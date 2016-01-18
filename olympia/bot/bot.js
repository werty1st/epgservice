var token = require('./.config.json').token;
var config = require('./.config.json').socket;

var ipc  =require('node-ipc');
var TelegramBot = require('node-telegram-bot-api');

//log to console instead of the bot
var debug=true;

ipc.config = config;

// Setup polling way
var bot = new TelegramBot(token, {polling: true});

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function (msg, match) {
  var fromId = msg.from.id;
  var resp = match[1];
  if (debug){
      console.log(msg);
  }  else {
    bot.sendMessage(fromId, resp);      
  }
});

// Matches /start
bot.onText(/\/start/i, function (msg, match) {
  var fromId = msg.from.id;
  if (debug){
    console.log(msg);
  }  else {
    bot.sendMessage(fromId, "Enter /status to get System Information");      
  }  
});

// Matches status[whatever]
bot.onText(/status.*/i, function (msg, match) {
  var fromId = msg.from.id;
  if (debug){
    console.log(msg);
  }  else {
    bot.sendMessage(fromId, "System up and running");      
  }    
});





//@bot text
/*bot.on('message', function (msg) {
  console.log(msg);
  var chatId = msg.chat.id;
  // photo can be: a file path, a stream or a Telegram file_id
  bot.sendMessage(chatId, "Pong");
});*/


bot.getMe().then(function (me) {
    console.log('Hi my name is %s!', me.username);
});


ipc.serve(
    function(){

        ipc.server.on(
            'app.message.error',
            function(data,socket){                
                //notfify my "670216"
                if (debug){
                    ipc.log('got a message from'.debug, (data.id).variable, (data.message).data);
                }  else {
                    bot.sendMessage("670216", data.message);
                }
            }
        );
        ipc.server.on(
            'app.message.log',
            function(data,socket){
                if (debug){
                    ipc.log('got a message from'.debug, (data.id).variable, (data.message).data);
                }  else {
                    bot.sendMessage("670216", data.message);
                }                
            }
        );        
    }
);



ipc.server.start();