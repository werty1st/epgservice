
// showFn+doc
// _show/lastModified/lastmodified', query: { accept: 'json'} },     

// listFn+viewFn
// _list/getToday_list/getAllWithTimeStamp', query: { accept: 'json', version: '2' }},

exports.view_getAllbyDate = {
    map: function(doc) {

        if (doc.channel) {
            emit(doc.start, doc);                
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

