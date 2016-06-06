module.exports = [
    {from:"/", to:'_show/show_getIndex'},
    /*  
    {from:"/*", to:'*'}
    {from:"/api", to:'../../'},
    {from:"/api/*", to:'../../*'},
    */
    
    /* get current+next broadcast from all stations */
    {from:"/now", to:'_list/list_getNow/view_getAllByDate'},

    /* get current+next broadcast from selected station */
    {from:"/now/:station", to:'_list/list_getNow/view_getAllByDate',     query: { "station": ':station', "days": "0" }},
    
    /* get details from selected broadcast */
    {from:"/now/:station/:vcmsid", to:'_show/show_getByID/:vcmsid' },
    
    /* get broadcasts from all station for current day 05300->0529 */
    {from:"/today", to:'_list/list_getToday/view_getAllByDate'},
    
    /* get broadcasts from selected station for current day 05300->0529 */
    {from:"/today/:station", to:'_list/list_getToday/view_getAllByStation', query: { startkey: ":station", endkey: ":station", "station": ':station', "days": "0" }},

  
    
    /* get broadcasts from all station for :days in the future 05300->0529 */
    {from:"/today/add/:days",        to:'_list/list_getToday/view_getAllByDate', query: { station: 'all',       days: ':days' }},
        
    /* get broadcasts from selected station for :days in the future 05300->0529 */
    {from:"/today/add/:days/:station", to:'_list/list_getToday/view_getAllByDate', query: { station: ':station', days: ':days' }},    

    /* redirect request from today/station/id to getById => get details from selected broadcast */
    {from:"/today/:station/:vcmsid", to:'_show/show_getByID/:vcmsid' },  
    
    /* redirect request from today/station/id to getById => get details from selected broadcast */
    {from:"/byId/:vcmsid", to:'_show/show_getByID/:vcmsid' },
        
    /* get broadcasts from all stations for current day 05300->0529 for all stations as csv */
    {from:"/google/",         to:'_list/list_google/view_getAllByDate', query: { station: 'all' }}

    /*sportart
    {from:"/today/add/:days/:sportart", to:'_list/list_getToday/view_getAllByDate', query: { station: ':station', days: ':days' }},
    {from:"/now/:sportart", to:'_list/list_getNow/view_getAllByDate',     query: { "station": ':station', "days": "0" }},
    {from:"/today/:sportart", to:'_list/list_getToday/view_getAllByStation', query: { startkey: ":station", endkey: ":station", "station": ':station', "days": "0" }},    
    */
    
];
