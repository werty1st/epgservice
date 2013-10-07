/**
 * Rewrite settings to be exported from the design doc
 */

module.exports = [


    {from: '/getById/xml/*',  to: '_show/getByID_show/*', query: { accept: 'xml'} }, 
    {from: '/getById/json/*', to: '_show/getByID_show/*', query: { accept: 'json'} }, 


    {from: '/zdf/now/xml',  to: '_list/getNow_list/getAllWithAge_view', query: { accept: 'xml', startkey: ["ZDF",-50], endkey: ["ZDF",50]}},
    {from: '/zdf/now/json', to: '_list/getNow_list/getAllWithAge_view', query: { accept: 'json', startkey: ["ZDF",-50], endkey: ["ZDF",50]}},

    {from: '/zdfinfo/now/xml',  to: '_list/getNow_list/getAllWithAge_view', query: { accept: 'xml', startkey: ["ZDFinfo",-50], endkey: ["ZDFinfo",50]}},
    {from: '/zdfinfo/now/json', to: '_list/getNow_list/getAllWithAge_view', query: { accept: 'json', startkey: ["ZDFinfo",-50], endkey: ["ZDFinfo",50]}},

    {from: '/zdfneo/now/xml',  to: '_list/getNow_list/getAllWithAge_view', query: { accept: 'xml', startkey: ["ZDFneo",-50], endkey: ["ZDFneo",50]}},
    {from: '/zdfneo/now/json', to: '_list/getNow_list/getAllWithAge_view', query: { accept: 'json', startkey: ["ZDFneo",-50], endkey: ["ZDFneo",50]}},

    {from: '/zdfkultur/now/xml',  to: '_list/getNow_list/getAllWithAge_view', query: { accept: 'xml', startkey: ["ZDF.kultur",-50], endkey: ["ZDF.kultur",50]}},
    {from: '/zdfkultur/now/json', to: '_list/getNow_list/getAllWithAge_view', query: { accept: 'json', startkey: ["ZDF.kultur",-50], endkey: ["ZDF.kultur",50]}},


    {from: '/zdf/today/xml',  to: '_list/getToday_list/getAllWithAge_view', query: { accept: 'xml', startkey: ["ZDF",-50], endkey: ["ZDF",50]}},
    {from: '/zdf/today/json', to: '_list/getToday_list/getAllWithAge_view', query: { accept: 'json', startkey: ["ZDF",-50], endkey: ["ZDF",50]}},

    {from: '/zdfinfo/today/xml',  to: '_list/getToday_list/getAllWithAge_view', query: { accept: 'xml', startkey: ["ZDFinfo",-50], endkey: ["ZDFinfo",50]}},
    {from: '/zdfinfo/today/json', to: '_list/getToday_list/getAllWithAge_view', query: { accept: 'json', startkey: ["ZDFinfo",-50], endkey: ["ZDFinfo",50]}},

    {from: '/zdfneo/today/xml',  to: '_list/getToday_list/getAllWithAge_view', query: { accept: 'xml', startkey: ["ZDFneo",-50], endkey: ["ZDFneo",50]}},
    {from: '/zdfneo/today/json', to: '_list/getToday_list/getAllWithAge_view', query: { accept: 'json', startkey: ["ZDFneo",-50], endkey: ["ZDFneo",50]}},

    {from: '/zdfkultur/today/xml',  to: '_list/getToday_list/getAllWithAge_view', query: { accept: 'xml', startkey: ["ZDF.kultur",-50], endkey: ["ZDF.kultur",50]}},
    {from: '/zdfkultur/today/json', to: '_list/getToday_list/getAllWithAge_view', query: { accept: 'json', startkey: ["ZDF.kultur",-50], endkey: ["ZDF.kultur",50]}},

    {from: '/crossdomain.xml', to: 'html/crossdomain.xml'},

    {from: '/', to: 'index.html'},
    {from: '/wartung', to: 'html/wartung.html'},
    {from: '/modules.js', to: '/modules.js'},
    {from: '/html/*', to: 'html/*'}

    // list:
    // http://localhost:5984/epgservice/_design/epgservice/_list/getNow_list/getAllWithAge_view?accept=xml&startkey=["ZDF",-50]&endkey=["ZDF",50]      
    // http://localhost:5984/epgservice/_design/epgservice/_list/getToday_list/getAllWithAge_view?accept=xml&startkey=["ZDF",-50]&endkey=["ZDF",50]

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