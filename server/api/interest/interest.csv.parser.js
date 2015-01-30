var geo = require('../../components/geo/geo');
var csv = require('csv');
var Q = require('q');
var logger = require('../../components/logger/logger');



exports.parse = function (data) {

    var deffered = Q.defer();

    csv.parse(data, function (err, rows) {

        if (err) {
            deffered.reject(err);
        } else {

            var interests = [];

            if (rows.length > 1) {

                // first row is headers
                var headers = rows[0];

                // following rows are data
                for (var i = 1; i < rows.length; i++) {
                    var row = rows[i];

                    if (row.length !== headers.length) {
                        if (row.length !== 0) {
                            // log message only if the row has at least one column
                            logger.error('Expected size for row %d is %d but got %d.', i, firstRow.length, row.length);
                        }
                        continue;
                    }
                    
                    var data = {};
                    for (var j = 0; j < headers.length; j++) {
                        var columnName = headers[j]
                        data[columnName] = row[j];
                    }

                    var interest = exports.buildInterest(data, 'upload');
                    
                    if (interest !== null){
                        interests.push(interest);
                    }
                }

            }

            deffered.resolve(interests);
        }

    });

    return deffered.promise;
}


exports.buildInterest = function (data, source) {

    if (!data) {
        return null;
    }
    
    var longitude = parseFloat(data['longitude']);
    var latitude = parseFloat(data['latitude']);

    var geometry = {
        type: 'Point',
        coordinates: [longitude, latitude]
    };

    var interest = {
        type: 'food',
        geometry: geometry,
        priority: 3,
        source: source,
        name: data['raisonsociale'],
        description: data['adresseweb']
    };
    
    return interest;

}