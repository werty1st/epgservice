exports.getByID = function(doc, req) {
	//"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"

	// var headers_Accept = req.headers.Accept; 

	var format = req.query.accept;

	if (format == "json") {
		return provides_json(doc, req);

	}else if (format == "xml") {
		return provides_xml(doc, req);
	} else {
		//TODO accept fehlt oder demo seite
	}

}


function provides_json(doc, req) {

	if (doc == null){
		return {
			code: 404,
			body : '{ "Error": "Document not found"}',
			headers : {
				"Content-Type" : "application/json; charset=utf-8"
				}
			}
	} else {		
		doc['id'] = doc['_id'];
		delete doc['_id'];
		delete doc['_rev'];
		delete doc['_revisions'];
		delete doc['item_created'];
		delete doc['item_modified'];
		delete doc['_attachments'];
		//delete doc['images']["image"][1]["data"];



		
		var wrapper = { "response" : { status : { "statuscode" : "ok"} , "sendungsdetails" : [] }};
		wrapper.response.sendungsdetails = doc;

		return {
			body : JSON.stringify(wrapper),
			headers : {
				"Content-Type" : "application/json; charset=utf-8"
				}
		}		
	}
}


function provides_xml(doc, req) {

	if (doc == null){
		return {
			code: 404,
			body : "<xml><Error>Document not found</Error></xml>",
			headers : {
				"Content-Type" : "application/xml; charset=utf-8"
				}
			}
	} else {
		myxml = require('lib/jstoxml');
		
		doc['id'] = doc['_id'];
		delete doc['_id'];
		delete doc['_rev'];
		delete doc['_revisions'];
		delete doc['item_created'];
		delete doc['item_modified'];
		delete doc['_attachments'];
		//delete doc['images']["image"][1]["data"];
		

		var wrapper = { "response" : { status : { "statuscode" : "ok"} , "sendungsdetails" : [] }};
		wrapper.response.sendungsdetails = doc;

		var filter = Object();
			filter['"'] = "&quot;";
			filter["'"] = "&apos;";
			filter["<"] = "&lt;";
			filter[">"] = "&gt;";
			filter["&"] = "&amp;";			
		xml2 = myxml.toXML(wrapper,{header: true, indent: '  ', "filter":filter });

		return {
			body : xml2,
			headers : {
				"Content-Type" : "application/xml; charset=utf-8"
				}
		}		
	}
}