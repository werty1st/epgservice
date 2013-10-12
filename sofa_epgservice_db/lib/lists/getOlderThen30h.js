//php Abhängigkeit
exports.getOlderThen30h = function (head, req) {
    var header = {};
	var encoding = req.query.accept || "";
    var output = { total_rows : 0, rows : []};
	
    header['Content-Type'] = 'application/json; charset=utf-8';
    start({code: 200, headers: header});
    
    while(row = getRow()){

        var time_old = new Date(row.value.time);
        var time_now = new Date();
        var diff = parseFloat((Math.abs(time_now - time_old)/3600000).toPrecision(4));

        if (diff >= 30) {

            var out = {};
            output.total_rows +=1;

            out.id = row.id;
            out.key = null;
            out.value = {};

            out.value["_id"]            = row.id;        
            out.value["_rev"]           = row.value.rev;        
            out.value["station"]        = row.value.station;
            out.value["titel"]          = row.value.titel;
            out.value["beschreibung"]   = row.value.beschreibung;
            out.value["url"]            = row.value.url;
            out.value["time"]           = row.value.time;
            out.value["endTime"]        = row.value.endTime;
            out.value["now"]            = time_now;
            out.value["diff"]           = diff;        

            output.rows.push(out);
        }
           
    }
    

    send(JSON.stringify(output)); 

}

