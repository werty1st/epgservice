module.exports = function(doc, req) {
               
    var data =  {
                    "DV": "Wasserspringen",
                    "OW": "Freiwasser-Schwimmen",
                    "SW": "Schwimmen",
                    "SY": "Synchronschwimmen",
                    "WP": "Wasserball",
                    "AR": "Bogenschießen",
                    "AT": "Leichtathletik",
                    "BD": "Badminton",
                    "BK": "Basketball",
                    "BX": "Boxen",
                    "CF": "Kanu",
                    "CS": "Kanu-Slalom",
                    "CB": "BMX",
                    "CM": "Mountainbike",
                    "CR": "Radsport Straße",
                    "CT": "Radsport Bahn",
                    "EQ": "Reiten",
                    "FB": "Fußball",
                    "FE": "Fechten",
                    "GO": "Golf",
                    "GA": "Turnen",
                    "GR": "Rhythmische Sportgymnastik",
                    "GT": "Trampolin",
                    "HB": "Handball",
                    "HO": "Hockey",
                    "JU": "Judo",
                    "MP": "Moderner Fünfkampf",
                    "RO": "Rudern",
                    "RU": "Rugby",
                    "SA": "Segeln",
                    "SH": "Schießen",
                    "TE": "Tennis",
                    "TK": "Taekwondo",
                    "TR": "Triathlon",
                    "TT": "Tischtennis",
                    "BV": "Beachvolleyball",
                    "VO": "Volleyball",
                    "WL": "Gewichtheben",
                    "WR": "Ringen"
                };    

               
    return {
        body : JSON.stringify(data),
        headers : {
            "Content-Type" : "application/json; charset=utf-8"
            }
    };		

};


