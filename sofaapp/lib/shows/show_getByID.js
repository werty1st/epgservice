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
		delete doc._rev;
		delete doc._id;
        delete doc.version; 
        delete doc.expires; 
		delete doc._conflicts;	
		delete doc._deleted_conflicts;	
                
        return {
            body : JSON.stringify(doc),
            headers : {
                "Content-Type" : "application/json; charset=utf-8"
                }
        };		
    }
};


