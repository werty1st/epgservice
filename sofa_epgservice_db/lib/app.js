/**
 * Values exported from this module will automatically be used to generate
 * the design doc pushed to CouchDB.
 */

module.exports = {
    shows: require('./shows/index'),
    lists: require('./lists/index'),
    views: require('./views/index'),
    rewrites: require('./rewrites'),
    jstoxml: require('./jstoxml')
};


/*
// updates: require('./updates'),
// filters: require('./filters'),
// validate_doc_update: require('./validate')
//types: require('./types'),
// bind event handlers
// require('./events');
*/