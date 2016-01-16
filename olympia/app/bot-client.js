var ipc  =require('node-ipc');
var config = require('./.config.json').socket;

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
                console.log("ipc log 2");
                ipc.of.server.emit(
                        'app.message.log',
                        {
                            id      : ipc.config.id,
                            message : msg
                        }
                    );
            },
            close: function(){
                console.log("ipc close");
                ipc.disconnect(ipc.config.id);
            }
        };       
    }
);


