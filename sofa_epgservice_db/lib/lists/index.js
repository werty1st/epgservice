exports.getNow_list 	= require('./getNow').getNow;
exports.getToday_list 	= require('./getToday').getToday;

//php Abhängigkeit deprecated
//exports.getOlderThen30h = require('./getOlderThen30h').getOlderThen30h;

//monitoring
exports.status		 	= require('./getliveDocCount').getliveDocCount;



