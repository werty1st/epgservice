/*wird von php gebraucht*/
exports.getold_view = {
    map: function (doc) {
        if (doc.station !== undefined) {
        /*2013-08-28T05:00:00+02:00*/
            var now = new Date();
            var old = new Date(doc.programdata.airtimeBegin);

            var diff = ((now - old)/3600000); /*alter in stunden*/
            diff = parseFloat(diff.toPrecision(6))
            if (diff >= 30) {
                emit(null,{"_id":doc._id,"_rev":doc._rev});
            }

        }
    }
};