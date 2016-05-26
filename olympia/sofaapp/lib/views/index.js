exports.view_getAllProgrammData     = {
    map: function(doc) {
            if (doc.station)
                emit(null,doc._rev);
    }
};


exports.view_getAllByDate 	        = require('./view_getAllByDate').view_getAllByDate;
exports.view_getAllByStation 	    = require('./view_getAllByStation').view_getAllByStation;
exports.view_getAllByStationDate 	= require('./view_getAllByStationDate').view_getAllByStationDate;

exports.viewByVersion 	= require('./viewByVersion').viewByVersion;
