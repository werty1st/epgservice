module.exports = [
    {from:"/", to:'attachments/index.html'},
    {from:"/css/*", to:'attachments/css/*'},
    {from:"/fonts/*", to:'attachments/fonts/*'},
    {from:"/images/*", to:'attachments/images/*'},
    {from:"/lang/*", to:'attachments/lang/*'},
    {from:"/lib/*", to:'attachments/lib/*'},

    
    {from:"/swagger.json", to:'attachments/swagger.json'},
    {from:"/api/", to:'attachments/swagger.json'},
    /*  
    {from:"/*", to:'*'}
    {from:"/api", to:'../../'},
    {from:"/api/*", to:'../../*'},
    */


    /* get current+next broadcast from all stations */
    {from:"/all", to:'_list/list_getAll/view_getAllByDate', query: { station: 'all',  startkey: "2016-08-03T05:30:00+02:00", endkey:"2016-08-22T05:30:00+02:00" }},

    /* get current+next broadcast from all stations */
    {from:"/allbydate", to:'_list/list_getAll/view_getAllByDate', query: { station: 'all',  startkey: "2016-08-03T05:30:00+02:00", endkey:"2016-08-22T05:30:00+02:00" }},

    /* get current+next broadcast from all stations */
    {from:"/allbydate/:start/:end", to:'_list/list_getAll/view_getAllByDate', query: { station: 'all',  startkey: ":start", endkey:":end" }},
  

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
    {from:"/google.csv",         to:'_list/list_google/view_getAllByDate', query: { station: 'all' }},
        
    /* get broadcasts from all stations for current day 05300->0529 for all stations as csv */
    {from:"/sportarten/",         to:'_show/show_getSportarten'}

    /*sportart
    {from:"/today/add/:days/:sportart", to:'_list/list_getToday/view_getAllByDate', query: { station: ':station', days: ':days' }},
    {from:"/now/:sportart", to:'_list/list_getNow/view_getAllByDate',     query: { "station": ':station', "days": "0" }},
    {from:"/today/:sportart", to:'_list/list_getToday/view_getAllByStation', query: { startkey: ":station", endkey: ":station", "station": ':station', "days": "0" }},    
    */
    
];
