//urlgen
var moment = require("moment");


/**
 * @param {object} options which have to include 
 * startdate, enddate, current (current date) and a path
 */
module.exports = function (data){ 


	//create date range urls
	//days
    var options = data.options;
    
    var startd = moment(data.startdate);
    var stopd = moment(data.enddate);
    var today = moment(data.current);
    var days = 0;
    var skip = 0;
    var urls = [];
    var log = "";

	//zufrüh
    if (today.isBefore(startd)){
        log = "before";
        //alle daten holen
        days = moment.duration(stopd.diff(startd)).asDays();
        skip = 0;
    }
	//mittendrin
    if ((today.isSameOrAfter(startd)) && (today.isSameOrBefore(stopd))) {
        log = "in progress";
        //daten ab heute holen
        days = moment.duration(stopd.diff(today)).asDays();
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

	//add skip days
    var date = startd.add(skip,"days");

    for (var i=0;i<days;i++){
        //url
        var filename = date.format("YYYY-MM-DD");
        date.add(1,"days");
        var dpath = options.proto + "://" + options.host + options.path + filename +".xml";
        urls.push(dpath);
    }

    return { urls: urls,
            days: days,
            skip: skip,
            log: log
        };
};