
// showFn+doc
// _show/lastModified/lastmodified', query: { accept: 'json'} },     

// listFn+viewFn
// _list/getToday_list/getAllWithTimeStamp', query: { accept: 'json', version: '2' }},

exports.view_getAllbyDate = {
    map: function(doc) {

        if (doc.channel) {
            delete doc.image64;
            emit(doc.start, doc);                
        }       
        else if (doc.station && doc.station.name == "ZDF")
        {
            var out = {};
            
            out.time    = doc.time;
            out.endTime = doc.endTime;
            out.station = { "name":doc.station.name};
            //out.position  = doc.position;
            
            if (doc.kicker != "" ){
                out.kicker = doc.kicker;
            }
            if (doc.titel != "" ){
                out.titel = doc.titel;
            }
            if (doc.subtitle != "" ){
                out.untertitel = doc.subtitle;
            }                
            if (doc.beschreibung != "" ){
                out.beschreibung = doc.beschreibung;
            }                
            if (doc.subtitle != "" ){
                out.untertitel = doc.subtitle;
            }                
        

            out.programdata = (doc.programdata)?{ "genre": doc.programdata.genre}:{};

            out.url     = doc.url;
            out.item_created  = doc.item_created;
            out.item_modified = doc.item_modified;
            out.rev     = doc["_rev"];

            //if (diff >= -5)
            emit(doc.time, out);                
        }
        
        
    }
};

exports.view_getAllByChannel = {
    map: function(doc) {
        if(doc.channel !== undefined) {
            emit(doc.channel, {"_id":doc._id,"_rev":doc._rev});
        }
    }
};


// http://localhost:5984/ecms/_design/app/_view/getAllByChannelDate?startkey=["web2"]&endkey=["web3"]
exports.view_getAllByChannelDate = {
    map: function(doc) {
        if(doc.channel !== undefined) {
            emit([doc.channel, doc.start], {"_id":doc._id,"_rev":doc._rev});
        }
    }
};

