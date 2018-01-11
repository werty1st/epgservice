const winston = require('winston');


const logger = new (winston.Logger)({
    exitOnError: false,
    levels:{
        verb: 4,
        debug: 3,
        info: 2,
        setting: 1,
        warn: 1,
        error: 0
    },
    colors:{
        verb: "magenta",
        debug: "blue",
        info: "green",
        setting: "cyan",
        warn: "yellow",
        error: "red"
    },
    transports: [
      new (winston.transports.Console)({colorize: true, level: process.env.logLevel })
    ]
  });
  module.exports=logger;
  