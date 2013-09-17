/*
curl -i -H "Accept: application/json" http://localhost:5984/epgservice/_design/epgservice/_show/getByID_show/7af22be421dd603e8e39de9a68372ebf
http://localhost:5984/epgservice/_design/epgservice/_show/getByID_show/7a14ce8dce0989850989ac84a66bdc1e

*/

exports.getByID_show = function(doc, req) {
	//"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"

	// var headers_Accept = req.headers.Accept; 

	provides("json", function() {
		if (doc == null){
			return {
				code: 404,
				body : '{ "Error": "Document not found"}',
				headers : {
					"Content-Type" : "application/json; charset=utf-8",
					}
				}
		} else {		
			doc['id'] = doc['_id'];
			delete doc['_id'];
			delete doc['_rev'];
			delete doc['_revisions'];

			var tempsendung = {};
			tempsendung.sendungsdetails = doc;

			return {
				body : JSON.stringify(tempsendung),
				headers : {
					"Content-Type" : "application/json; charset=utf-8",
					// "X-My-Own-Header": "you can set your own headers"
					}
			}		
		}
	});

	provides("xml", function() {
		if (doc == null){
			return {
				code: 404,
				body : "<xml><Error>Document not found</Error></xml>",
				headers : {
					"Content-Type" : "application/xml; charset=utf-8",
					}
				}
		} else {
			myxml = require('lib/jstoxml');
			var obj = {};
			
			doc['id'] = doc['_id'];
			delete doc['_id'];
			delete doc['_rev'];
			delete doc['_revisions'];

			obj.sendungsdetails = doc;

			var filter = Object();
				filter["&"] = "&amp;";
			xml2 = myxml.toXML(obj,{header: true, indent: '  ', "filter":filter });

			return {
				body : xml2,
				headers : {
					"Content-Type" : "application/xml; charset=utf-8",
					// "X-My-Own-Header": "you can set your own headers"
					}
			}		
		}
	});

}

exports.not_found_show = function (doc, req) {
	
    return {
	    	code: 404,
	    	headers: {'Content-Type': 'text/html; charset=utf-8'},
	    	body: "Not Found"
    	};
}; 



/*
curl -i -H "Accept: application/json" http://s.wrty.eu:5984/epgservice/_design/epgservice/_show/getByID_show/7a14ce8dce0989850989ac84a66bdc1e
http://s.wrty.eu:5984/epgservice/_design/epgservice/_show/getByID_show/***ID***

*/