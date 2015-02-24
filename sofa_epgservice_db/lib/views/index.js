exports.getAllWithTimeStamp 	= require('./getAllWithTimeStamp').getAllWithTimeStamp;


//php Abhängigkeit
exports.listByPosition_view	 		= require('./listByPosition_view').listByPosition_view;
exports.getall_view 		 	 	= require('./getall_view').getall_view;

//deprecated
//exports.getRangeStartEndTime		= require('./getRangeStartEndTime').getRangeStartEndTime;


exports.getdefunct = { 
	map: function (doc) {

        if (Object.keys(doc).length<5 && doc._id != "lastmodified"){
			emit(doc._id, doc);                
		}
    }
	
};
