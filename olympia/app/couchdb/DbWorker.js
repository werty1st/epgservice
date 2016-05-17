(function () {
"use strict";

var moment = require("moment");

var PouchDB = require('pouchdb');
    PouchDB.plugin(require('pouchdb-upsert'));
    //PouchDB.debug.enable('*');
    
var diff = require('deep-diff').diff;    


class DbWorker {
        
    constructor (){     
        
        const that = this;
        
        // redirect save requests to this array as long as the constructor has not finished loading
        let workerQ = [];
        
        log.info("db init");
        
        this.local = new PouchDB('localecms', {db: require('memdown')});
        this.remote = new PouchDB(process.env.DB, {auto_compaction: true});
        
        // test local and remote connection
        // setup replication
        this.local.info().then((info) => {
            
            log.debug("local info:", info.doc_count);
            
            // if local db ok check remote    
            that.remote.info().then( (info) => {
            
                log.debug("remote info:", info.doc_count);
                
                // remote db ok, sync remote
                that.local.replicate.from(that.remote,{ filter: 'olympia/hauptprogrammFilter', }).then( (result) => {
                    // handle 'completed' result
                    log.debug("init replicate completed");


                    ready();
                    
                    // setup live replication
                    that.local.replicate.to(that.remote, { live: true})
                        .on("change", (change) => {
                            log.debug(`change event: docs_read: ${change.docs_read}, docs_written: ${change.docs_written}, doc_write_failures: ${change.doc_write_failures}`);
                        })
                        .on("error", (err) => {
                            log.debug("change error", err);
                        });
                    
                });
            });   
                                   
        }).catch( (err) =>{
            log.error(err);
            throw new Error (err);
        });
        

        // collect items until class is ready
        this.save = function save (item, done) {
            workerQ.push([item, done]);
            //todo on constructor error call callbacks
        };
        
        /**
         * add XML News Item to DB
         */
        const addItem = function addItem (item, done){
            //send to db
            log.debug("upsert item",item._id);
                    
            that.local.upsert(
                    item._id,   //find oldDoc by id and pass it to function that _diffDocs returns
                    that._diffDocs(item) //compare old and newDoc==item, returns false or newDoc
                ).then( (response) => {
                    // item stored or skipped invoke callback now
                    done();
                    log.debug("success", item._id, response);
                }).catch((err) => {
                    log.error("error", err);
                    throw new Error (err);            
                });
        };
        
        // save items to DB
        const ready = function ready () {
            // constructor is ready now, send collected save requests to addItem function
            that.save = addItem;

            // wait one tick to catch late calls to old save function();
            process.nextTick( ()=>{
                workerQ.forEach((item) => {
                    addItem(item[0],item[1]);
                });                        
            });            
        };
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
                // console.log("zzzzzzzzzzzzzzzzzz");                
                return newdoc;
            }        
        };
    }


    /**
     * remove outdated and wrong version items
     */
    removeOutdated() {
    
        // count deleted items
        let ver_count=0;
        //let old_count=0;
        //let outdated = process.env.npm_package_config_age_keep;
        
        console.log("find outdated");
        
        /**
         * find docs with lower version 
         */
        this.local.query('olympia/viewByVersion',{
                endkey: process.env.npm_package_config_version,
                inclusive_end: "false"
            }).then( (res) => {
                
                ver_count = res.rows.length;

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
                
                // console.log("version: docs2delete",docs2delete);
                // return;
                
                // remove old versions elements
                this.local.bulkDocs(docs2delete)
                    .then((result)=>{
                        log.info(`Deleted ${ver_count} old versions.`);
                    })
                    .catch((err)=>{
                        log.error("Error removing docs with old version.");
                        throw new Error(err);    
                    });
            })
            .catch( (err) => {
                console.log(err);
                // some error
            });         


        
        /** 
         * remove outdated docs 
         * */
        // this.db.query('app/viewByDate',{
        //         descending: true, //newest first
        //         startkey: moment().subtract(outdated, 'hours')                
        //     }).then( (res) => {
                
        //         old_count = res.rows.length;

        //         //build array of docs to delete
        //         return res.rows.map((x)=>{                                        
        //             return {
        //                 _id: x.value._id,
        //                 _rev: x.value._rev,
        //                 _deleted: true
        //             };
        //         });
        //     })
        //     .then( (docs2delete) => {
                
        //         // console.log("outdated: docs2delete",docs2delete);
        //         // return;
                            
        //         // remove outdated elements
        //         this.db.bulkDocs(docs2delete)
        //             .then((result)=>{
        //                 log.info(`Deleted ${old_count} old items.`);
        //             })
        //             .catch((err)=>{
        //                 log.error("Error removing outdated docs.");
        //                 throw new Error(err);    
        //             });
        //     })
        //     .catch( (err) => {
        //         console.log(err);
        //         // some error
        //     });
    }



    



}

module.exports = new DbWorker();

}());