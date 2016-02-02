exports.show_getByID = function(doc, req) {

    if (doc === null){
        return {
            code: 404,
            body : '{ "Error": "Document not found"}',
            headers : {
                "Content-Type" : "application/json; charset=utf-8"
                }
            };
    } else {		
                    
        delete doc._revisions;
        return {
            body : JSON.stringify(doc),
            headers : {
                "Content-Type" : "application/json; charset=utf-8"
                }
        };		
    }
};


