/**
 * Rewrite settings to be exported from the design doc
 */
    timestamp = new Date();
    timestamp = new Date().valueOf();

module.exports = [

    {from: "/epgservice/*", to: "../../*" },
    
    {from: '/getById/json/:id/*',  to: '../../:id/*' }, 
    {from: '/getById/xml/:id/*',  to: '../../:id/*' }, 


    {from: '/getById/xml/:id',  to: '_show/getByID_show/:id', query: { accept: 'xml'} }, 
    {from: '/getById/json/:id', to: '_show/getByID_show/:id', query: { accept: 'json'} }, 


    //ALL
        {from: '/all/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml' }},
        {from: '/all/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json' }},

        {from: '/all/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml' }},
        {from: '/all/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json' }},
    //ALL END

    //ALL v2
        {from: '/v2/all/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', version: '2'}},
        {from: '/v2/all/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', version: '2' }},

        {from: '/v2/all/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', version: '2' }},
        {from: '/v2/all/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', version: '2' }},
    //ALL v2 END


    //NOW
        {from: '/zdf/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "ZDF" }},
        {from: '/zdf/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "ZDF" }},

        {from: '/zdfinfo/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "ZDFinfo" }},
        {from: '/zdfinfo/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "ZDFinfo" }},

        {from: '/zdfneo/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "ZDFneo" }},
        {from: '/zdfneo/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "ZDFneo" }},

        {from: '/zdfkultur/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "ZDF.kultur" }},
        {from: '/zdfkultur/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "ZDF.kultur" }},

        {from: '/3sat/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "3sat" }},
        {from: '/3sat/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "3sat" }},

        {from: '/arte/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "arte" }},
        {from: '/arte/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "arte" }},

        {from: '/kika/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "KI.KA" }},
        {from: '/kika/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "KI.KA" }},
        
        {from: '/phoenix/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "phoenix" }},
        {from: '/phoenix/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "phoenix" }},
    //NOW END

    //NOW V2 DUMMY
        {from: '/v2/zdf/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "ZDF" }},
        {from: '/v2/zdf/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "ZDF" }},

        {from: '/v2/zdfinfo/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "ZDFinfo" }},
        {from: '/v2/zdfinfo/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "ZDFinfo" }},

        {from: '/v2/zdfneo/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "ZDFneo" }},
        {from: '/v2/zdfneo/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "ZDFneo" }},

        {from: '/v2/zdfkultur/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "ZDF.kultur" }},
        {from: '/v2/zdfkultur/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "ZDF.kultur" }},

        {from: '/v2/3sat/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "3sat" }},
        {from: '/v2/3sat/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "3sat" }},

        {from: '/v2/arte/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "arte" }},
        {from: '/v2/arte/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "arte" }},

        {from: '/v2/kika/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "KI.KA" }},
        {from: '/v2/kika/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "KI.KA" }},        
        
        {from: '/v2/phoenix/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "phoenix" }},
        {from: '/v2/phoenix/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "phoenix" }},        
    //NOW V2 END


    //TODAY
        {from: '/zdf/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "ZDF" }},
        {from: '/zdf/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "ZDF" }},

        {from: '/zdfinfo/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "ZDFinfo" }},
        {from: '/zdfinfo/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "ZDFinfo" }},

        {from: '/zdfneo/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "ZDFneo" }},
        {from: '/zdfneo/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "ZDFneo" }},

        {from: '/zdfkultur/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "ZDF.kultur" }},
        {from: '/zdfkultur/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "ZDF.kultur" }},

        {from: '/3sat/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "3sat" }},
        {from: '/3sat/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "3sat" }},

        {from: '/arte/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "arte" }},
        {from: '/arte/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "arte" }},
        
        {from: '/kika/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "KI.KA" }},
        {from: '/kika/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "KI.KA" }},  
        
        {from: '/phoenix/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "phoenix" }},
        {from: '/phoenix/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "phoenix" }},        
    //TODAY END


    //TODAY V2 DUMMY
        {from: '/v2/zdf/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "ZDF" }},
        {from: '/v2/zdf/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "ZDF" }},

        {from: '/v2/zdfinfo/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "ZDFinfo" }},
        {from: '/v2/zdfinfo/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "ZDFinfo" }},

        {from: '/v2/zdfneo/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "ZDFneo" }},
        {from: '/v2/zdfneo/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "ZDFneo" }},

        {from: '/v2/zdfkultur/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "ZDF.kultur" }},
        {from: '/v2/zdfkultur/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "ZDF.kultur" }},

        {from: '/v2/3sat/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "3sat" }},
        {from: '/v2/3sat/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "3sat" }},

        {from: '/v2/arte/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "arte" }},
        {from: '/v2/arte/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "arte" }},

        {from: '/v2/kika/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "KI.KA" }},
        {from: '/v2/kika/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "KI.KA" }},   

        {from: '/v2/phoenix/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'xml', station: "phoenix" }},
        {from: '/v2/phoenix/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { stale: "ok", accept: 'json', station: "phoenix" }},                
    //TODAY V2 END


    //deprecated warum?
    {from: '/lastModified/xml',  to: '_show/lastModified/lastmodified', query: { stale: "ok", accept: 'xml'} }, 
    {from: '/lastModified/json', to: '_show/lastModified/lastmodified', query: { stale: "ok", accept: 'json'} },     

    {from: '/lastmodified/xml',  to: '_show/lastModified/lastmodified', query: { stale: "ok", accept: 'xml'} }, 
    {from: '/lastmodified/json', to: '_show/lastModified/lastmodified', query: { stale: "ok", accept: 'json'} },     

    {from: '/crossdomain.xml', to: 'html/crossdomain.xml'},

    //php
    //{from: '/getOlderThen30h/json', to: '_list/getOlderThen30h/getAllWithTimeStamp', query: { stale: "ok", accept: 'json'} }, 

    
    //monitoring
    {from: '/status', to: '_list/status/getAllWithTimeStamp', query: { stale: "ok", accept: 'json'}},

    {from: '/', to: 'html/index.html'},
    {from: '/wartung', to: 'html/wartung.html'},
    {from: '/modules.js', to: '/modules.js'},
    {from: '/html/*', to: 'html/*'}

    // list:
    // http://localhost:5984/epgservice/_design/epgservice/_list/getNow_list/getAllWithTimeStamp?accept=xml&startkey=["ZDF",-24]&endkey=["ZDF",24]      
    // http://localhost:5984/epgservice/_design/epgservice/_list/getToday_list/getAllWithTimeStamp?accept=xml&startkey=["ZDF",-24]&endkey=["ZDF",24]

    // show:
    // http://localhost:5984/epgservice/_design/epgservice/_show/getByID/dbc2a00ab9ef7d59b252a8c166a17c19?accept=json


                               //_list/getNowByStation_list/getNowByStation_view?descending=false&station=zdf
    
    // {from: '/zdf/now',       to: '_list/getNowByStation_list/getNowByStation_view', method: 'get', query: { descending: 'false', station: 'zdf'}},
    /*
    {from: '/zdfneo/now',   to: '_list/getNowByStation/getNowByStation?descending=false&station=zdfneo'},
    {from: '/zdfinfo/now',  to: '_list/getNowByStation/getNowByStation?descending=false&station=zdfinfo'},
    {from: '/zdfkultur/now',to: '_list/getNowByStation/getNowByStation?descending=false&station=zdf.kultur'},
    */


    // {from: '/static/*', to: 'static/*'},
    // {from: '/static/*', to: 'static/*'},
    // {from: '/static/*', to: 'static/*'},
    // {from: '/getnow', to: '_show/getnow'},
    // {from: '/', to: '_list/homepage'},
    // {from: '*', to: '_show/not_found'}
];