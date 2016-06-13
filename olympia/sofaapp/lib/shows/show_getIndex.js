module.exports = function(doc, req) {
               
    doc = {};
    
    doc.now = "current and next broadcast of all stations";
    doc["now/olympia1"] = "current and next broadcast of olympia1 station";
    doc["now/olympia6"] = "current and next broadcast of olympia6 station";
    doc["now/zdf"] = "current and next broadcast of zdf station";
    doc["now/ard"] = "current and next broadcast of ard station";
    
    doc.today = "today's broadcasts of all stations";
    doc["today/olympia1"] = "today's broadcast of olympia1 station";
    doc["today/olympia6"] = "today's broadcast of olympia6 station";
    doc["today/zdf"] = "today's broadcast of zdf station";
    doc["today/ard"] = "today's broadcast of ard station";


    doc["today/add/3"] = "today + 3 days broadcast of all stations";
    doc["today/add/3/olympia1"] = "today + 3 days broadcast of olympia1 station";
    doc["today/add/3/olympia6"] = "today + 3 days broadcast of olympia6 station";
    doc["today/add/3/zdf"] = "today + 3 days broadcast of zdf station";
    doc["today/add/3/ard"] = "today + 3 days broadcast of ard station";
               
    return {
        body : JSON.stringify(doc),
        headers : {
            "Content-Type" : "application/json; charset=utf-8"
            }
    };		

};


