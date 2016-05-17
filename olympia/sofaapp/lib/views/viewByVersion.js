


module.exports.viewByVersion = {
    map: function(doc) {
        if (!doc.version){
            emit(0, doc._rev);
        } else {
	        emit(doc.version, doc._rev);
        }       
    }
};


