var couchapp = require('couchapp');
var path = require('path');

var ddoc = 
  { _id:'_design/app',
    rewrites : 
    [{from:"/", to:'index.html'},
     {from:"/api", to:'../../'},
     {from:"/api/*", to:'../../*'},
     {from:"/*", to:'*'}],
    views:{},
    lists:{},
    shows:{},    
  };


ddoc.validate_doc_update = function (newDoc, oldDoc, userCtx) {   
  if (newDoc._deleted === true && userCtx.roles.indexOf('_admin') === -1) {
    throw "Only admin can delete documents on this database.";
  } 
};

//couchapp.loadAttachments(ddoc, path.join(__dirname, 'attachments'));

module.exports = ddoc; 



// showFn+doc
// _show/lastModified/lastmodified', query: { accept: 'json'} },     

// listFn+viewFn
// _list/getToday_list/getAllWithTimeStamp', query: { accept: 'json', version: '2' }},

ddoc.views.getAllbyDate = {
    map: function(doc) {
        emit(doc.start, {"_id":doc._id,"_rev":doc._rev});
    }
};

ddoc.views.getAllByChannel = {
    map: function(doc) {
        if(doc.channel !== undefined) {
            emit(doc.channel, {"_id":doc._id,"_rev":doc._rev});
        }
    }
};


// http://localhost:5984/ecms/_design/app/_view/getAllByChannelDate?startkey=["web2"]&endkey=["web3"]
ddoc.views.getAllByChannelDate = {
    map: function(doc) {
        if(doc.channel !== undefined) {
            emit([doc.channel, doc.start], {"_id":doc._id,"_rev":doc._rev});
        }
    }
};


//?startkey="2010/01/01 00:00:00"&endkey
// es liegen heute-1 bis heute+7 in der datenbank