var ipc  =require('node-ipc');
var config = require('../.config.json').socket;

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


