
// showFn+doc
// _show/lastModified/lastmodified', query: { accept: 'json'} },     

// listFn+viewFn
// http://localhost:5984/ecms/_design/olympia/_view/view_getAllbyDate?startkey="2016-03-15"&endkey="2016-03-16"
// _list/getToday_list/getAllWithTimeStamp', query: { accept: 'json', version: '2' }},
exports.view_getAllByDate = {
    map: function(doc) {

        if (doc.station && doc.station.name && (doc.station.name.toLowerCase() === "zdf"))
        {
            var out = {};
            
            out.time    = doc.time;
            out.endTime = doc.endTime;
            out.station = { "name":doc.station.name};
            //out.position  = doc.position;
            
            if (doc.kicker !== "" ){
                out.kicker = doc.kicker;
            }
            if (doc.titel !== "" ){
                out.titel = doc.titel;
            }
            if (doc.subtitle !== "" ){
                out.untertitel = doc.subtitle;
            }                
            if (doc.beschreibung !== "" ){
                out.beschreibung = doc.beschreibung;
            }                
            if (doc.subtitle !== "" ){
                out.untertitel = doc.subtitle;
            }                
        

            out.programdata = (doc.programdata)?{ "genre": doc.programdata.genre}:{};

            out.url     = doc.url;
            out.item_created  = doc.item_created;
            out.item_modified = doc.item_modified;
            out.rev     = doc._rev;

            //if (diff >= -5)
            emit(doc.start, out);                
        } else if (doc.station) {
            emit(doc.start, doc);                
        }        
    }
};
