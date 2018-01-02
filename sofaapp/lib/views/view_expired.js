


module.exports.view_expired = {
    map: function(doc) {
        if (!doc.expires){
            emit("2017-01-02T15:56:07.707Z", doc._rev);
        } else {
	        emit(doc.expires, doc._rev);
        }       
    }
};


