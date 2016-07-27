// @flow
/* global process log */

(function () {
"use strict";

const moment = require("moment");
const diff = require('deep-diff').diff;
const PouchDB = require('pouchdb');
      PouchDB.plugin(require('pouchdb-upsert'));
//require('pouchdb/extras/websql');
//PouchDB.debug.enable('*');
    



class DbWorker {
        
    constructor (){     
        log.info("db init");
        
        // redirect save requests to this array as long as the constructor is not ready
        this.workerQ = [];
        
        // store document Ids + Revs
        this.outdatedDocs = new Map();
        
        //setup local and remote DBs
        this.local = new PouchDB('localecms', {db: require('memdown')});

        //this.local  = new PouchDB('localecms', {adapter: 'websql'});
        this.remote = new PouchDB(process.env.DB, {auto_compaction: true, ajax: {timeout: 2000} });

        // check local connection
        this.local.info().then((info) => {
                log.debug("local info:", info.doc_count);                                   
            }).catch( (err) =>{
                log.error("local Database is not available");
                setTimeout(()=>{ throw err; });
        });
                
        // check remote connection
        this.remote.info().then( (info) => {
                log.debug("remote info:", info.doc_count);
                /**
                 * REMOTE DATABASE READY
                 */

                //delete old version docs from remote before syncing
                this._removeOldversion( ()=>{

                    /**
                     * Called after remove version to avoid syncing outdated items
                     */
                    // save all docIds to temp array, they will be removed from this array if they are
                    // downloaded again, otherwise this ids are outdated and safe to remove
                    this.remote.query('olympia/view_getAllProgrammData').then( (result) =>{
                        result.rows.map( (item) => {
                            this.outdatedDocs.set(item.id,item.value);
                        });
                         /* Map {'1653' => '2-5ef0249f5573c0499f40985fece14e9d',
                         *       '1654' => '2-57065de65b4d2690ccfa6156377af365',
                         *       '1655' => '2-b6a3351426e5ad023883095af06b4149'} */
                    });



                    const timer = setInterval(()=>{
                        log.info("replication", repl.state);
                    },1000);

                    const repl = this.local.replicate.from(this.remote);
                    repl.then( (result) => {
                        clearInterval(timer);

                        // handle 'completed' result
                        log.debug("init replicate completed");
                        // replace save function
                        this._ready();
                    });
                });     
                

            }).catch( (err) =>{
                log.error("remote Database is not available");
                setTimeout(()=>{ throw err; });                
        }); 
        
    }

    
    // save items to DB
    _ready () {
        // constructor is ready now, send collected save requests to addItem function
        this.save = this._save;
        
        // wait one tick to catch late calls to old save function;
        process.nextTick( ()=>{
            this.workerQ.forEach((item) => {
                this._save(item[0],item[1]);
            });                        
        });            
    }



    /**
     * "private" save function
     */
    _save (item, done){
        //send to db
        log.debug("upsert item",item._id);
        
        // remove item from outdatedDocs Map
        this.outdatedDocs.delete(item._id);
                
        this.local.upsert(
                item._id,   //find oldDoc by id and pass it to function this _diffDocs returns
                this._diffDocs(item) //compare old and newDoc==item, returns false or newDoc
            ).then( (response) => {
                // item stored or skipped invoke callback now
                done();
                log.debug("upsert success", item._id, response);
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

    /**
     * remove lower version items
     */
    _removeOldversion (done) {
        log.info("find old versions");
    
        // count deleted items
        let ver_count=0;        
        
        /**
         * find docs with lower version 
         */
        this.remote.query('olympia/viewByVersion',{
                endkey: process.env.npm_package_config_version.toString(),
                inclusive_end: false })
            .then( (res) => {
                
                ver_count = res.rows.length;
                log.debug(`Found ${res.rows.length} outdated docs`);

                //build array of docs to delete
                return res.rows.map((x)=>{                                        
                    return {
                        _id: x.id,
                        _rev: x.value,
                        _deleted: true
                    };
                });
            })
            .then( (docs2delete) => {

                // remove old versions elements
                this.local.bulkDocs(docs2delete)
                    .then((result)=>{
                        log.info(`Deleted ${ver_count} old versions.`);
                        done();
                    })
                    .catch((err)=>{
                        log.error("Error removing docs with old version.");
                        setTimeout(()=>{ throw err; });    
                    });
            })
            .catch( (err) => {
                log.err(err);
                setTimeout(()=>{ throw err; }); 
            });         

    }

    /**
     * sync local to remote
     * TODO test live replication just after this.remote.query('olympia/view_getAllProgrammData')
     */
    sync(){
        this.local.replicate.to(this.remote).then( (result) => {
            // handle 'completed' result
            log.info("sync to remote completed");
        });          
    }    

    /**
     * remove outdated items
     * called from SenderGruppe
     */
    removeOutdated (done){

        // create array of docs to remove from remote
        let docs2delete = [];
        
        this.outdatedDocs.forEach((value,key)=>{
            // add item to array
            docs2delete.push({
                _id: key,
                _rev: value,
                _deleted: true
            });
            this.outdatedDocs.delete(key);
        });

        // remove old versions elements
        this.remote.bulkDocs(docs2delete)
            .then((result)=>{
                log.info("docs2delete",result.length);
                done();
            })
            .catch((err)=>{
                log.error("Error removing outdated docs.");
                setTimeout(()=>{ throw err; });    
            });

        
    }


    // public save function
    // collect items until db is ready
    save (item, done) {
        this.workerQ.push([item, done]);
    }

    
    test1 (){
        this.local.query("olympia/view_getAllByStation").then( (res) => {
            console.log("view_getAllByStation", res);
        });
    }


}

module.exports = new DbWorker();

}());