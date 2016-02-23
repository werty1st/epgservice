var couchapp = require('couchapp');
var path = require('path');

var couchapp = require('couchapp');

var ddoc = 
  { _id:'_design/olympia',
    rewrites: require('./rewrites'),
    views: require('./views/index'),
    lists: require('./lists/index'),
    shows: require('./shows/index')    
  };

module.exports = ddoc; 

  
//console.log(ddoc);



ddoc.validate_doc_update = function (newDoc, oldDoc, userCtx) {   
  if (newDoc._deleted === true && userCtx.roles.indexOf('_admin') === -1) {
    throw "Only admin can delete documents on this database.";
  } 
};

//couchapp.loadAttachments(ddoc, path.join(__dirname, 'attachments'));




//?startkey="2010/01/01 00:00:00"&endkey
// es liegen heute-1 bis heute+7 in der datenbank