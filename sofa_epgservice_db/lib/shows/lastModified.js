exports.lastModified = function(doc, req) {
	//"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
	// var headers_Accept = req.headers.Accept; 

	var format = req.query.accept;

	var expires = new Date();
	expires.setMinutes(expires.getMinutes()+5);

	var lastModified = doc.stations["ZDF.kultur"].timestamp;
	
	if (lastModified < doc.stations.ZDFneo.timestamp)
		lastModified = doc.stations.ZDFneo.timestamp;
	if (lastModified < doc.stations.ZDF.timestamp)
		lastModified = doc.stations.ZDF.timestamp;
	if (lastModified < doc.stations.ZDFinfo.timestamp)
		lastModified = doc.stations.ZDFinfo.timestamp;
	if (lastModified < doc.stations.ZDF.timestamp)
		lastModified = doc.stations.ZDF.timestamp;

	var headers = {
				"Content-Type" : "application/json; charset=utf-8",
				"Cache-Control": "no-transform,public,max-age=60,s-maxage=300",
				"Vary": "Accept-Encoding",
				"Expires" : expires,
				"Last-Modified" : lastModified
				};

	if (format == "json") {
		return provides_json(doc, req, headers);

	}else if (format == "xml") {
		return provides_xml(doc, req, headers);
	} else {
		//TODO accept fehlt oder demo seite
	}

}


function provides_json(doc, req, headers) {

	if (doc == null){
		return {
			code: 404,
			body : '{ "Error": "Document not found"}',
			headers : headers
			}
	} else {		
		// doc['id'] = doc['_id'];
		// delete doc['_id'];
		// delete doc['_rev'];
		delete doc['_revisions'];
		// delete doc['item_created'];
		// delete doc['item_modified'];


		
		var wrapper = { "response" : { status : { "statuscode" : "ok"} , "sendungsdetails" : [] }};
		wrapper.response.sendungsdetails = doc;

		return {
			body : JSON.stringify(wrapper),
			headers : headers
		}		
	}
}


function provides_xml(doc, req, headers) {

	if (doc == null){
		return {
			code: 404,
			body : "<xml><Error>Document not found</Error></xml>",
			headers : headers
			}
	} else {
		myxml = require('lib/jstoxml');
		
		// doc['id'] = doc['_id'];
		// delete doc['_id'];
		// delete doc['_rev'];
		delete doc['_revisions'];
		// delete doc['item_created'];
		// delete doc['item_modified'];
		

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
			headers : headers
		}		
	}
}