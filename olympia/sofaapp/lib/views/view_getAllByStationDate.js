// http://localhost:5984/ecms/_design/app/_view/getAllByShannelDate?startkey=["web2"]&endkey=["web3"]
exports.view_getAllByStationDate = {
    map: function(doc) {
        if(doc.station !== undefined) {
            emit([doc.station.toLowerCase(), doc.start], doc);
        }
    }
};

