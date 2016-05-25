/* global bot */
const SenderWeb = require("./SenderWeb");
const SenderZDF = require("./SenderZDF");

// -> store(/db/tag/channel)

module.exports = function SenderGruppe (db){

        const web  = new SenderWeb(db);
        const zdf  = new SenderZDF(db);
        
        return { web, zdf };
};
