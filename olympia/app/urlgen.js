//urlgen
var moment = require("moment");


/**
 * @param {object} options which have to include 
 * startdate, enddate, current (current date) and a path
 */
module.exports = function (data){ 

    //console.log(data);

	//create date range urls
	//days
    var options = data.options;
    
    var startd = moment(data.startdate);
    var stopd = moment(data.enddate);
    var today = moment(data.current);
    var days = 0;
    var skip = 0;
    var urls = []; // [ uri:{ date , url} ]
    var log = "";

	//zufrüh
    if (today.isBefore(startd)){
        log = "before";
        //alle daten holen
        days = moment.duration(stopd.diff(startd)).asDays()+1; //plus heute
        skip = 0;
    }
	//mittendrin
    if ((today.isSameOrAfter(startd)) && (today.isSameOrBefore(stopd))) {
        log = "in progress";
        //daten ab heute holen
        days = moment.duration(stopd.diff(today)).asDays()+1; //plus heute
        skip = moment.duration(today.diff(startd)).asDays();
    }
	//letzter tag
    if (today.isSame(stopd)){
        log = "in progress";
        //daten ab heute holen
        days = 1;
        skip = moment.duration(today.diff(startd)).asDays();
    }
	//vorbei
    if (today.isAfter(stopd)) {
        log = "done";
        //keiner daten holen
        days = 0;
        skip = 0;
    }
    
    //console.log("log",log);
    //console.log("skip",skip);

	//add skip days
    var date = startd.add(skip,"days");

    for (var i=0;i<days;i++){
        //url
        var filename = date.format("YYYY-MM-DD");
        var dpath = options.proto + "://" + options.host + options.path + filename +".xml";
        urls.push({ url: dpath, date: date.clone()} );
        date.add(1,"days");
    }

    return { urls: urls,
            days: days,
            skip: skip,
            log: log
        };
};