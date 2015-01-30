var geo = require('../../components/geo/geo');
var Q = require('q');

exports.parse = function (data) {

    var deffered = Q.defer();

    var geojsonContent = JSON.parse(data);

    var interests = geojsonContent.features.reduce(function (interests, currentFeature) {

        if (currentFeature.geometry === null) {
            return interests;
        }

        var interest = exports.buildInterest('Point', currentFeature.geometry.coordinates, currentFeature.properties, 'upload');

        if (interest === null) {
            return interests;
        }

        interest.type = interestType;

        switch (interestType) {
        case 'water-point':
            {
                interest.name = currentFeature.properties['TYPE'],
                interest.description = currentFeature.properties['LOCALISATION'];
                break;

            }
        case 'velotoulouse':
            {
                interest.name = currentFeature.properties['nom'];
                interest.description = currentFeature.properties['num_station'];
                break;
            }
        case 'wc':
            {
                interest.name = currentFeature.properties['type'];
                interest.description = currentFeature.properties['adresse'];
                break;
            }
        case 'merimee':
            {
                interest.name = currentFeature.properties['chpnoms'];
                interest.description = currentFeature.properties['chpdesc'];
                break;
            }
        case 'danger':
            {
                interest.name = currentFeature.properties['nom_des_branches_du_carrefour'];
                interest.description = currentFeature.properties['nom_des_branches_du_carrefour'];

                var total = currentFeature.properties['total__2008_2012_'];

                if (!total || parseInt(total) <= 2) {
                    return interests;
                }

                break;
            }
        }

        if (interest.name && interest.description) {
            interests.push(interest);
        } else {
            console.info('Name or description missing.');
        }

        return interests;

    }, []);

    deffered.resolve(interests);

    return deffered.promise;

}


exports.buildInterest = function (type, coordinates, properties, source) {

    if (!coordinates) {
        return null;
    }

    // convert coordinates
    var coordinates = geo.convertPointCoordinatesToWGS84(coordinates);

    var geometry = {
        type: type,
        coordinates: coordinates
    };

    var p = properties;

    var interest = {
        geometry: geometry,
        priority: 3,
        source: source
    };

    return interest;

}