


exports.view_getAllByStation = {
    map: function(doc) {
        emit(doc.station.toLowerCase(), doc);       
    }
};


