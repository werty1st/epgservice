//{from: '/all/now/json', to: '_list/getNow_list/getAllWithTimeStamp', query: { accept: 'json' }},

module.exports = [
    {from:"/", to:'index.html'},
    {from:"/api", to:'../../'},
    {from:"/api/*", to:'../../*'},
    
    {from:"/jetzt", to:'_list/list_getNow/view_getAllbyDate'},
    {from:"/heute", to:'_list/list_getToday/view_getAllbyDate'},

    {from:"/jetzt/:channel", to:'_list/list_getNow/view_getAllbyDate', query: { channel: ':channel' }},
    {from:"/heute/:channel", to:'_list/list_getToday/view_getAllbyDate', query: { channel: ':channel' }},
    
    //show sendung
    {from:"/jetzt/:channel/:vcmsid", to:'_show/show_getByID/:vcmsid' },
    {from:"/heute/:channel/:vcmsid", to:'_show/show_getByID/:vcmsid' },
        
     //get attachment
    {from:"/jetzt/:channel/:vcmsid/*", to:'../../:vcmsid/*' },
    {from:"/heute/:channel/:vcmsid/*", to:'../../:vcmsid/*' },
    
    
    //
    {from:"/heute+1/:vcmsid", to:'_show/show_getByID/:vcmsid' },
    
    
    {from:"/*", to:'*'}
];