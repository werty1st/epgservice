module.exports = [
    {from:"/", to:'index.html'},
    {from:"/api", to:'../../'},
    {from:"/api/*", to:'../../*'},
    
    {from:"/now", to:'_list/list_getNow/view_getAllbyDate'},
    {from:"/today", to:'_list/list_getToday/view_getAllbyDate'},

    {from:"/now/:station", to:'_list/list_getNow/view_getAllbyDate',     query: { station: ':station' }},
    {from:"/today/:station", to:'_list/list_getToday/view_getAllbyDate', query: { station: ':station' }},
    
    
    {from:"/today/add/:days/", to:'_list/list_getNext/view_getAllbyDate',         query: { station: 'all', days: ':days' }},    
    {from:"/today/add/:days/:station", to:'_list/list_getNext/view_getAllbyDate', query: { station: ':station', days: ':days' }},    
    
    {from:"/now/:station/:vcmsid", to:'_show/show_getByID/:vcmsid' },
    {from:"/today/:station/:vcmsid", to:'_show/show_getByID/:vcmsid' },
    {from:"/byId/:vcmsid", to:'_show/show_getByID/:vcmsid' },
    {from:"/*", to:'*'}
];
