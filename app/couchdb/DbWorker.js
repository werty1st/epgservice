// @flow
/* global process */

(function () {
"use strict";

const moment = require("moment");
const log = require('../log.js'); 
const diff = require('deep-diff').diff;
const PouchDB = require('pouchdb');
      PouchDB.plugin(require('pouchdb-upsert'));
//require('pouchdb/extras/websql');
//PouchDB.debug.enable('*');
    



class DbWorker {
        
    constructor (){
        const log = require('winston');
        log.info("db init");

        this.remote = new PouchDB(process.env.DB, { auto_compaction: true, ajax: {timeout: 2000} });
        
    }

    /**
     * "private" save function
     */
    save (item, done){
        //send to db
        //log.debug("upsert item",item._id);
        
        //refresh expires date
        item.expires = moment().add(15,"minutes").toISOString();

        this.remote.upsert(
                item._id,   //find oldDoc by id and pass it to function this _diffDocs returns
                this._diffDocs(item) //compare old and newDoc==item, returns false or newDoc
            ).then( (response) => {
                // item stored or skipped invoke callback now
                done();
                log.debug("upsert success", response);
            }).catch((err) => {
                log.error(`Ìtem ${item._id} not updated.`);
                setTimeout(()=>{ throw err; });           
            });
    }
    
    /**
     * diff Function to compare doc from XML with doc from DB if it exists
     */
    _diffDocs( newdoc ) {
        
        return function ( olddoc ){
            // diff doc                
            let diffResult = diff(olddoc, newdoc); 

            if ( (diffResult.length == 1) &&
                    (diffResult[0].path[0] === "_rev")) {
                // only diff is _rev property
                return false;
            } else {
                // something changed, return new item
                
                // set current document version without trigger update
                //newdoc.version = process.env.npm_package_config_version_items;
               
                // console.log("XXXXXXXXXXXXXXXXXX");                
                // console.log(diffResult);                
                // console.log("zzzzzzz olddoc zzzzzzzzzz");                
                // console.log(olddoc);                
                // console.log("zzzzzzz newdoc zzzzzzzzzzz");                
                // console.log(newdoc);                
                // console.log("zzzzzzzzzzzzzzzzzz");
                // process.exit();                
                return newdoc;
            }        
        };
    }

    // /**
    //  * remove lower version items
    //  */
    // _removeOldversion (done) {
    //     log.info("find old versions");
    
    //     // count deleted items
    //     let ver_count=0;        
        
    //     /**
    //      * find docs with lower version 
    //      */
    //     this.remote.query('olympia/viewByVersion',{
    //             endkey: process.env.npm_package_config_version.toString(),
    //             inclusive_end: false })
    //         .then( (res) => {
                
    //             ver_count = res.rows.length;
    //             log.debug(`Found ${res.rows.length} outdated docs`);

    //             //build array of docs to delete
    //             return res.rows.map((x)=>{                                        
    //                 return {
    //                     _id: x.id,
    //                     _rev: x.value,
    //                     _deleted: true
    //                 };
    //             });
    //         })
    //         .then( (docs2delete) => {

    //             // remove old versions elements
    //             this.remote.bulkDocs(docs2delete)
    //                 .then((result)=>{
    //                     log.info(`Deleted ${ver_count} old versions.`);
    //                     done();
    //                 })
    //                 .catch((err)=>{
    //                     log.error("Error removing docs with old version.");
    //                     setTimeout(()=>{ throw err; });    
    //                 });
    //         })
    //         .catch( (err) => {
    //             log.err(err);
    //             setTimeout(()=>{ throw err; }); 
    //         });         

    // }


    /**
     * remove expired items
     * called from SenderGruppe
     */
    async removeExpired (done){

        // create array of docs to remove from remote
        let docs2delete = [];
        let outdatedDocs = new Map();
        
        /**
         * Called after remove version to avoid syncing outdated items
         */
        // save all docIds to temp array, they will be removed from this array if they are
        // downloaded again, otherwise this ids are marked as deleted and safe to remove
        await this.remote.query('olympia/view_expired',{
            endkey: moment().toISOString(),
            inclusive_end: false }
        ).then( (result) =>{
        
            //call list by expires            
            result.rows.map( (item) => {
                
                if( moment().isAfter(moment(item.key)) ) //item ist veraltet
                {
                    outdatedDocs.set(item.id,item.value);
                }
            });


             /* Map {'1653' => '2-5ef0249f5573c0499f40985fece14e9d',
             *       '1654' => '2-57065de65b4d2690ccfa6156377af365',
             *       '1655' => '2-b6a3351426e5ad023883095af06b4149'} */
        });

        await outdatedDocs.forEach((value,key)=>{
            // add item to array
            docs2delete.push({
                _id: key,
                _rev: value,
                _deleted: true
            });
            outdatedDocs.delete(key);
        });

        // remove old versions elements
        this.remote.bulkDocs(docs2delete)
            .then((result)=>{
                //log.debug("docs2delete", docs2delete );
                log.info("docs2delete count:",result.length);
                done();
            })
            .catch((err)=>{
                log.error("Error removing outdated docs.");
                setTimeout(()=>{ throw err; });    
            });

        
    }

    
    // test1 (){
    //     this.local.query("olympia/view_getAllByStation").then( (res) => {
    //         console.log("view_getAllByStation", res);
    //     });
    // }


}

module.exports = DbWorker;

}());