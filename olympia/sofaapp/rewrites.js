//{from: '/all/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { accept: 'json' }},

module.exports = [
    {from:"/", to:'index.html'},
    {from:"/api", to:'../../'},
    {from:"/api/*", to:'../../*'},
    
    {from:"/now", to:'_list/list_getNow/view_getAllbyDate'},
    {from:"/today", to:'_list/list_getToday/view_getAllbyDate'},

    {from:"/now/:station", to:'_list/list_getNow/view_getAllbyDate', query: { station: ':station' }},
    {from:"/today/:station", to:'_list/list_getToday/view_getAllbyDate', query: { station: ':station' }},
    
    
    {from:"/today/:plus/", to:'_list/list_getToday/view_getAllbyDate', query: { station: 'all', addDays: ':plus' }},    
    {from:"/today/:plus/:station", to:'_list/list_getToday/view_getAllbyDate', query: { station: ':station', addDays: ':plus' }},    
    
    
    //show sendung
    {from:"/now/:station/:vcmsid", to:'_show/show_getByID/:vcmsid' },
    {from:"/today/:station/:vcmsid", to:'_show/show_getByID/:vcmsid' },
        

    
    
    //
    {from:"/byId/:vcmsid", to:'_show/show_getByID/:vcmsid' },
    
    
    
    {from:"/*", to:'*'}
];