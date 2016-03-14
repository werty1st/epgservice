


exports.view_getAllByStation = {
    map: function(doc) {
        if(doc.station !== undefined) {
            emit(doc.station, {"_id":doc._id,"_rev":doc._rev});
        }
    }
};


