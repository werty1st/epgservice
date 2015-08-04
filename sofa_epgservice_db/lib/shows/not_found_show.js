exports.not_found_show = function (doc, req) {
	
    return {
	    	code: 404,
	    	headers: {'Content-Type': 'text/html; charset=utf-8'},
	    	body: "Not Found"
    	};
}; 
