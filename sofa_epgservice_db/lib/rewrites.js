/**
 * Rewrite settings to be exported from the design doc
 */
    timestamp = new Date();
    timestamp = new Date().valueOf();

module.exports = [


    {from: '/getById/json/:id/*',  to: '../../:id/*' }, 
    {from: '/getById/xml/:id/*',  to: '../../:id/*' }, 


    {from: '/getById/xml/:id',  to: '_show/getByID_show/:id', query: { accept: 'xml'} }, 
    {from: '/getById/json/:id', to: '_show/getByID_show/:id', query: { accept: 'json'} }, 

    {from: '/all/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { accept: 'xml' }},
    {from: '/all/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { accept: 'json' }},


    {from: '/zdf/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { accept: 'xml', station: "ZDF" }},
    {from: '/zdf/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { accept: 'json', station: "ZDF" }},

    {from: '/zdfinfo/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { accept: 'xml', station: "ZDFinfo" }},
    {from: '/zdfinfo/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { accept: 'json', station: "ZDFinfo" }},

    {from: '/zdfneo/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { accept: 'xml', station: "ZDFneo" }},
    {from: '/zdfneo/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { accept: 'json', station: "ZDFneo" }},

    {from: '/zdfkultur/now/xml',  to: '_list/getNow_list/getAllWithTimeStamp', query: { accept: 'xml', station: "ZDF.kultur" }},
    {from: '/zdfkultur/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { accept: 'json', station: "ZDF.kultur" }},


    {from: '/all/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { accept: 'xml' }},
    {from: '/all/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { accept: 'json' }},


    {from: '/zdf/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { accept: 'xml', station: "ZDF" }},
    {from: '/zdf/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { accept: 'json', station: "ZDF" }},

    {from: '/zdfinfo/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { accept: 'xml', station: "ZDFinfo" }},
    {from: '/zdfinfo/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { accept: 'json', station: "ZDFinfo" }},

    {from: '/zdfneo/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { accept: 'xml', station: "ZDFneo" }},
    {from: '/zdfneo/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { accept: 'json', station: "ZDFneo" }},

    {from: '/zdfkultur/today/xml',  to: '_list/getToday_list/getAllWithTimeStamp', query: { accept: 'xml', station: "ZDF.kultur" }},
    {from: '/zdfkultur/today/json', to: '_list/getToday_list/getAllWithTimeStamp', query: { accept: 'json', station: "ZDF.kultur" }},

    //deprecated
    {from: '/lastModified/xml',  to: '_show/lastModified/lastmodified', query: { accept: 'xml'} }, 
    {from: '/lastModified/json', to: '_show/lastModified/lastmodified', query: { accept: 'json'} },     

    {from: '/lastmodified/xml',  to: '_show/lastModified/lastmodified', query: { accept: 'xml'} }, 
    {from: '/lastmodified/json', to: '_show/lastModified/lastmodified', query: { accept: 'json'} },     

    {from: '/crossdomain.xml', to: 'html/crossdomain.xml'},

    //php
    //{from: '/getOlderThen30h/json', to: '_list/getOlderThen30h/getAllWithTimeStamp', query: { accept: 'json'} }, 

    
    //monitoring
    {from: '/status', to: '_list/status/getAllWithTimeStamp', query: { accept: 'json'}},

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
    
    // {from: '/zdf/now', 		to: '_list/getNowByStation_list/getNowByStation_view', method: 'get', query: { descending: 'false', station: 'zdf'}},
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