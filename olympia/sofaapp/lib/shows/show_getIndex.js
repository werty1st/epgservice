module.exports = function(doc, req) {
               
doc = 
    {
    "swagger": "2.0",
    "info": {
        "description": "This is the Olympia 2016 ECMS EPG Data server.\n\n",
        "version": "2.0.2",
        "title": "Swagger API Definition",
        "termsOfService": "http://zdf.de/",
        "contact": {
            "name": "adams.r@zdf.de"
        },
        "license": {
            "name": "Apache 4.0",
            "url": "http://www.apache.org/licenses/LICENSE-4.0.html"
        }
    },
    "host": "sofa01.zdf.de",
    "basePath": "/epgservice/olympia",
    "schemes": [
        "https"
    ],
    "paths": {
        "/now/": {
            "get": {
                "tags": [
                    "stations", "now"
                ],
                "summary": "current and next broadcast of all stations",
                "description": "Returns Object of stations or an empty Object if no data is available",
                "operationId": "getallnow",
                "produces": [
                    "application/json"
                ],
                "responses": {
                    "200": {
                        "description": "successful operation",
                        "schema": {
                            "$ref": "#/definitions/allStations"
                        }
                    }
                }
            }
        },        
        "/now/{station}/": {
            "get": {
                "tags": [
                    "station", "now"
                ],
                "summary": "Current and next broadcast of selected station",
                "description": "Returns Array of Objects with EPG data of current and next or an empty Array if no data is available",
                "operationId": "getallnowbystation",
                "produces": [
                    "application/json"
                ],
                "parameters": [
                    {
                        "in": "path",
                        "name": "station",
                        "description": "ID of station that needs to be fetched",
                        "required": true,
                        "type": "string",
                        "enum": [
                          "olympia1","olympia2","olympia3","olympia4","olympia5","olympia6","zdf","ard"
                        ]
                    }
                ],
                "responses": {
                    "200": {
                        "description": "successful operation",
                        "schema": {
                            "$ref": "#/definitions/station"
                        }
                    },
                    "204":{
                      "description": "No Data"
                    },
                    "404": {
                        "description": "Station not found"
                    }
                }
            }
        },
        "/today/": {
            "get": {
                "tags": [
                    "stations", "today"
                ],
                "summary": "todays broadcast of all stations",
                "description": "Returns Object of stations or an empty Object if no data is available",
                "operationId": "getalltoday",
                "produces": [
                    "application/json"
                ],
                "responses": {
                    "200": {
                        "description": "successful operation",
                        "schema": {
                            "$ref": "#/definitions/allStations"
                        }
                    }
                }
            }
        },        
        "/today/{station}/": {
            "get": {
                "tags": [
                    "station", "today"
                ],
                "summary": "todays broadcast of selected station",
                "description": "Returns Array of Objects with EPG data of current and next or an empty Array if no data is available",
                "operationId": "getalltodaybystation",
                "produces": [
                    "application/json"
                ],
                "parameters": [
                    {
                        "in": "path",
                        "name": "station",
                        "description": "ID of station that needs to be fetched",
                        "required": true,
                        "type": "string",
                        "enum": [
                          "olympia1","olympia2","olympia3","olympia4","olympia5","olympia6","zdf","ard"
                        ]
                    }
                ],
                "responses": {
                    "200": {
                        "description": "successful operation",
                        "schema": {
                            "$ref": "#/definitions/allStations"
                        }
                    },
                    "204":{
                      "description": "No Data"
                    },
                    "404": {
                        "description": "Station not found"
                    }
                }
            }
        },
        "/today/add/{days}/": {
            "get": {
                "tags": [
                    "stations", "future"
                ],
                "summary": "today+days broadcast of all stations",
                "description": "Returns Array of Objects with EPG data of the calcuated date or an empty Array if no data is available",
                "operationId": "getallfuturebystation",
                "produces": [
                    "application/json"
                ],
                "parameters": [
                    {
                        "in": "path",
                        "name": "days",
                        "description": "Number of days to add",
                        "required": true,
                        "type": "integer",
                        "format": "int32",
                        "minimum": 1,
                        "maximum": 30
                    }
                ],
                "responses": {
                    "200": {
                        "description": "successful operation",
                        "schema": {
                            "$ref": "#/definitions/allStations"
                        }
                    },
                    "204":{
                      "description": "No Data"
                    },
                    "404": {
                        "description": "Station not found"
                    }
                }
            }
        },  
        "/today/add/{days}/{station}/": {
            "get": {
                "tags": [
                    "station", "future"
                ],
                "summary": "todays broadcast of selected station",
                "description": "Returns Array of Objects with EPG data of current and next or an empty Array if no data is available",
                "operationId": "getallfuture",
                "produces": [
                    "application/json"
                ],
                "parameters": [
                    {
                        "in": "path",
                        "name": "station",
                        "description": "ID of station that needs to be fetched",
                        "required": true,
                        "type": "string",
                        "enum": [
                          "olympia1","olympia2","olympia3","olympia4","olympia5","olympia6","zdf","ard"
                        ]
                    },
                    {
                        "in": "path",
                        "name": "days",
                        "description": "Number of days to add",
                        "required": true,
                        "type": "integer",
                        "format": "int32",
                        "minimum": 1,
                        "maximum": 30
                    }                    
                ],
                "responses": {
                    "200": {
                        "description": "successful operation",
                        "schema": {
                            "$ref": "#/definitions/station"
                        }
                    },
                    "204":{
                      "description": "No Data"
                    },
                    "404": {
                        "description": "Station not found"
                    }
                }
            }
        },  
        "/allbydate/{startdate}/{enddate}": {
            "get": {
                "tags": [
                    "stations", "future"
                ],
                "summary": "broadcast of all stations between startdate and enddate",
                "description": "Returns Array of Objects with EPG data of the calcuated date or an empty Array if no data is available",
                "operationId": "getallfuturerange",
                "produces": [
                    "application/json"
                ],
                "parameters": [
                    {
                        "in": "path",
                        "name": "startdate",
                        "description": "date of first day to get results for. e.g. 2016-07-21T05:30:00+02:00",
                        "required": true,
                        "type": "string",
                        "format": "date-time"
                    },
                    {
                        "in": "path",
                        "name": "enddate",
                        "description": "date of last day to get results for. e.g. 2016-08-21T05:30:00+02:00",
                        "required": true,
                        "type": "string",
                        "format": "date-time"
                    }                    
                ],
                "responses": {
                    "200": {
                        "description": "successful operation",
                        "schema": {
                            "$ref": "#/definitions/allStations"
                        }
                    },
                    "204":{
                      "description": "No Data"
                    },
                    "404": {
                        "description": "Station not found"
                    }
                }
            }
        },
        "/sportarten/": {
            "get": {
                "tags": [
                    "sportarten"
                ],
                "summary": "a list of all sports that can occur",
                "description": "",
                "operationId": "listsports",
                "produces": [
                    "application/json",
                    "application/xml"
                ],
                "responses": {
                    "200": {
                        "description": "successful operation",
                        "schema": {
                            "$ref": "#/definitions/sportarten"
                        }
                    }
                }
            }
        }
    },
    "definitions": {
        "allStations":{
          "type": "object",
          "properties": {
            "station": {
              "type": "array",
              "items": {
                "type": "object"
              }
            }
          }          
        },
        "sportarten": {
          "type": "object"
        },
        "station":{
          "type": "array",
          "items": {
            "type": "object"
          }
        }
    }
};

               
    return {
        body : JSON.stringify(doc),
        headers : {
            "Content-Type" : "application/json; charset=utf-8"
            }
    };		

};


