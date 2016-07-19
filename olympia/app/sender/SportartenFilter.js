// @flow
/* global process log */

(function () {
"use strict";

class Sportfilter {

    constructor () {

        let initData = [
            ["Wasserspringen", "DV"],
            ["Freiwasser-Schwimmen", "OW"],
            ["Schwimmen", "SW"],
            ["Synchronschwimmen", "SY"],
            ["Wasserball", "WP"],
            ["Bogenschießen", "AR"],
            ["Leichtathletik", "AT"],
            ["Badminton", "BD"],
            ["Basketball", "BK"],
            ["Boxen", "BX"],
            ["Kanu", "CF"],
            ["Kanu-Slalom", "CS"],
            ["BMX", "CB"],
            ["Mountainbike", "CM"],
            ["Radsport Straße", "CR"],
            ["Radsport Bahn", "CT"],
            ["Reiten", "EQ"],
            ["Fußball", "FB"],
            ["Fechten", "FE"],
            ["Golf", "GO"],
            ["Turnen", "GA"],
            ["Rhythmische Sportgymnastik", "GR"],
            ["Trampolin", "GT"],
            ["Handball", "HB"],
            ["Hockey", "HO"],
            ["Judo", "JU"],
            ["Moderner Fünfkampf", "MP"],
            ["Rudern", "RO"],
            ["Rugby", "RU"],
            ["Segeln", "SA"],
            ["Schießen", "SH"],
            ["Tennis", "TE"],
            ["Taekwondo", "TK"],
            ["Triathlon", "TR"],
            ["Tischtennis", "TT"],
            ["Beachvolleyball", "BV"],
            ["Volleyball", "VO"],
            ["Gewichtheben", "WL"],
            ["Ringen", "WR"]
        ];

        let initData2 = [
            ["DV", "Wasserspringen"],
            ["OW", "Freiwasser-Schwimmen"],
            ["SW", "Schwimmen"],
            ["SY", "Synchronschwimmen"],
            ["WP", "Wasserball"],
            ["AR", "Bogenschießen"],
            ["AT", "Leichtathletik"],
            ["BD", "Badminton"],
            ["BK", "Basketball"],
            ["BX", "Boxen"],
            ["CF", "Kanu"],
            ["CS", "Kanu-Slalom"],
            ["CB", "BMX"],
            ["CM", "Mountainbike"],
            ["CR", "Radsport Straße"],
            ["CT", "Radsport Bahn"],
            ["EQ", "Reiten"],
            ["FB", "Fußball"],
            ["FE", "Fechten"],
            ["GO", "Golf"],
            ["GA", "Turnen"],
            ["GR", "Rhythmische Sportgymnastik"],
            ["GT", "Trampolin"],
            ["HB", "Handball"],
            ["HO", "Hockey"],
            ["JU", "Judo"],
            ["MP", "Moderner Fünfkampf"],
            ["RO", "Rudern"],
            ["RU", "Rugby"],
            ["SA", "Segeln"],
            ["SH", "Schießen"],
            ["TE", "Tennis"],
            ["TK", "Taekwondo"],
            ["TR", "Triathlon"],
            ["TT", "Tischtennis"],
            ["BV", "Beachvolleyball"],
            ["VO", "Volleyball"],
            ["WL", "Gewichtheben"],
            ["WR", "Ringen"]
        ];

        this.sportName  = new Map(initData);    
        this.sportCodes = new Map(initData2);    
    }

    /**
     * @param String Name of Sport
     * @return false if no replacement is necessary or new Name of Sport
     */
    checkSport(sendung){
        // sendung.rscId
        // sendung.sportName

        if ( this.sportName.has(sendung.sportName) ){
            //skip
            return;
        } else {
            //find Sportname by Code and replace Sportname in Sendung
            let code = sendung.rscId.substring(0,2).toUpperCase();
            if ( this.sportCodes.has(code) ) {
                let newsportname = this.sportCodes.get(code);
                log.info(`Sportname changed from ${sendung.sportName} to ${newsportname}`);
                sendung.sportName = newsportname;
                return;
            } else {
                //no code found
                log.warn(`Sportname not found: ${sendung.sportName} rscId: ${sendung.rscId}`);
                return;
            }
        }
    }
    
}

module.exports = new Sportfilter();

}());