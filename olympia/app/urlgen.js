//urlgen
var moment = require("moment");


/**
 * @param {object} options which have to include 
 * startdate, enddate, current (current date) and a path
 */
module.exports = function (data){ 

    var options = data.options;
   
    var startd = moment(data.startdate);
    var stopd = moment(data.enddate);
    var days = 0;
    var urls = []; // [ uri:{ date , url} ]



    days = moment.duration(stopd.diff(startd)).asDays()+1; //plus heute
    var date = startd.clone();

    for (var i=0;i<days;i++){
        //url
        var filename = date.format("YYYY-MM-DD");
        var dpath = options.proto + "://" + options.host + options.path + filename +".xml";
        urls.push(dpath);
        date.add(1,"days");
    }

    return  urls;
};