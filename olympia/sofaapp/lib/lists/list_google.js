var json2csv = function (array, headings, quotes) {
    
    array = typeof array != 'object' ? JSON.parse(array) : array;
    var str = '';
    var line = '';

    if (headings) {
      var head = array[0];
      if (quotes) {
        for (var index in array[0]) {
          var value = index + "";
          line += '"' + value.replace(/"/g, '""') + '",';
        }
      }
      else {
        for (var index in array[0]) {
          line += index + ',';
        }
      }

      line = line.slice(0, -1);
      str += line + '\r\n';
    }
    for (var i = 0; i < array.length; i++) {
      var line = '';

      if (quotes) {
        for (var index in array[i]) {
          var value = array[i][index] + "";
          line += '"' + value.replace(/"/g, '""') + '",';
        }
      }
      else {
        for (var index in array[i]) {
          line += array[i][index] + ',';
        }
      }
      line = line.slice(0, -1);
      str += line + '\r\n';
    }
    return str;
};
  

exports.list_google = function (head, req) {
    
    var moment = require("lib/moment");
      
    //var accept  = req.query.accept  || "";
    //var station = req.query.station || "all";
    var range    = parseInt(req.query.range) || "all";
    //var version = req.query.version || "3";

    var header = {};

    // jetzt plus X Tage
    var startTag = moment();
    var stopTag  = moment().add(range+1, 'days');

    // wir sind zwischen 00:00-05:30 und müssen für die erste sendung des tages einen tag zurück
    if( startTag.isBefore(startSendungstag) ) 
    {
        // gestern
        startTag.subtract(1, 'days');
        stopTag.subtract(1, 'days');
    } else                
    {   // heute
    }

    // Sendungstag von StartTag
    var startSendungstag = startTag.hour(5).minute(30).second(0).millisecond(0);

    // Sendungstag von StopTag
    var stopSendungstag = stopTag.hour(5).minute(30).second(0).millisecond(0);


    // traget array
    var out = [];
        out.push(["startTime","endTime","channelName","channelId","programName","programDescription","language"]);

    while( (row = getRow()) ){	

        
        var startTime             = moment(row.value.start);
        var endTime               = moment(row.value.end);
        var channelName           = row.value.station;       
        var channelId             = row.value.channelId + channelName;       
        var programName           = row.value.titel.substring(0, 40);
        var programDescription    = '"' + row.value.text.substring(0, 44).replace(/"/g, '\\"') + '"';
        var language              = "de";
        

        if (channelName == "zdf"){
            channelName = "ZDF";
        } else if (channelName == "ard"){
            channelName = "ARD";
        } else {
            channelName  = capitalizeFirstLetter(channelName);
        }

        if (range == "all"){
            //output all        
            out.push([startTime.format(),endTime.format(),channelName,channelId,programName,programDescription,language]);           
        } else {
            //5:35		> 5:30 			 4:00       < 5:30
            if (( endTime.isAfter(startTag) ) && ( startTime.isBefore(startTag) )){
                out.push([startTime.format(),endTime.format(),channelName,channelId,programName,programDescription,language]);
            }

            //betrifft alle die 5:30 oder später starten aber nicht die die vor 5:30 starten und nach 5:30 enden
            if ( startTime.isSameOrAfter(startTag) && ( endTime.isBefore(stopSendungstag) )){
                out.push([startTime.format(),endTime.format(),channelName,channelId,programName,programDescription,language]);           
            }            
        }
    }
    
    // working by defaul
    //registerType("csv", "text/csv");

    function csv(){
        header['Content-Type'] = 'text/csv; charset=utf-8';
        start({code: 200, headers: header});
        //TODO Fehlermeldung wenn leer
        send(json2csv(out));          
    }

    provides("csv",function(){
        csv();
    });

    provides("all",function(){
        csv();
    });
        

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }        

};


