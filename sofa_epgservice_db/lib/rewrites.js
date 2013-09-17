/**
 * Rewrite settings to be exported from the design doc
 */

module.exports = [

    // http://localhost:5984/epgservice/_design/epgservice/_rewrite/zdf/now/ => /epgservice/_design/epgservice/_show/getByID/
    // http://localhost:5984/epgservice/_design/epgservice/_rewrite/getByID/ => /epgservice/_design/epgservice/_show/getByID/
    /*{from: '/getByID/*', to: '_show/getByID/*'}, 
    
    {from: '/zdf/now/', 		to: '_list/getNowByStation_list/getNowByStation_view/', method: 'get', query: { descending: 'false', station: 'zdf'}},
    {from: '/zdfneo/now', 	to: '_list/getNowByStation/getNowByStation?descending=false&station=zdfneo'},
    {from: '/zdfinfo/now', 	to: '_list/getNowByStation/getNowByStation?descending=false&station=zdfinfo'},
    {from: '/zdfkultur/now',to: '_list/getNowByStation/getNowByStation?descending=false&station=zdf.kultur'},

    */

    // {from: '/static/*', to: 'static/*'},
    // {from: '/static/*', to: 'static/*'},
    // {from: '/static/*', to: 'static/*'},
    // {from: '/getnow', to: '_show/getnow'},
    // {from: '/', to: '_list/homepage'},
    // {from: '*', to: '_show/not_found'}
];