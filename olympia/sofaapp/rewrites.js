//{from: '/all/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { accept: 'json' }},

module.exports = [
    {from:"/", to:'index.html'},
    {from:"/api", to:'../../'},
    {from:"/api/*", to:'../../*'},
    {from:"/all/now/json", to:'_list/list_getNow/view_getAllbyDate'},
    {from:"/all/today/json", to:'_list/list_getToday/view_getAllbyDate'},
    {from:"/*", to:'*'}
];