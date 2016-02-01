var ipc  =require('node-ipc');
var config = {
        "appspace"        : "app.",
        "socketRoot"      : "/tmp/",
        "id"              : "client1",
        "networkHost"     : "localhost",
        "networkPort"     : 8000,
        "encoding"        : "utf8",
        "rawBuffer"       : false,
        "sync"            : false,
        "silent"          : true,
        "maxConnections"  : 100,
        "retry"           : 500,
        "maxRetries"      : false,
        "stopRetrying"    : false
    };

ipc.config = config;

ipc.connectTo(
    'server',
    function(){

        module.exports = {
            error: function(msg){
                ipc.of.server.emit(
                        'app.message.error',
                        {
                            id      : ipc.config.id,
                            message : msg
                        }
                    );
                },
            log: function(msg){
                ipc.of.server.emit(
                        'app.message.log',
                        {
                            id      : ipc.config.id,
                            message : msg
                        }
                    );
            },
            close: function(){
                ipc.disconnect(ipc.config.id);
            }
        };       
    }
);


