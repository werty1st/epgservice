module.exports = { 
    
    views: require('./views/index'),
    lists: require('./lists/index'),
    shows: require('./shows/index'),
    rewrites: require('./rewrites'),
    validate_doc_update: function (newDoc, oldDoc, userCtx) {   
        if (newDoc._deleted === true && userCtx.roles.indexOf('_admin') === -1) {
            throw "Only admin can delete documents on this database.";
        } 
    }    
  };
  
