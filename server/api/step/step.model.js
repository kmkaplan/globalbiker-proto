'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/*var PointSchema = new Schema({
    latitude: {
        type: Number,
        required: 'Please fill latitude'
    },
    longitude: {
        type: Number,
        required: 'Please fill longitude'
    },
    elevation: {
        type: Number
    }
});*/

var StepSchema = new Schema({
    creationTime: {
        type: Date,
        default: Date.now
    },
    tourId: {
        type: Schema.ObjectId,
        ref: 'TourSchema',
        required: 'Please fill tour'
    },
    difficulty: {
        type: Number,
        required: 'Please fill difficulty'
    },
    interest: {
        type: Number,
        required: 'Please fill interest'
    },
    cityFrom: {
        geonameId: {
            type: Number,
            required: 'Please fill cityFrom geonames id'
        },
        name: {
            type: String,
            required: 'Please fill cityFrom name'
        },
        adminName1: {
            type: String,
            required: 'Please fill cityFrom adminName1'
        },
        latitude: {
            type: Number,
            required: 'Please fill cityFrom latitude'
        },
        longitude: {
            type: Number,
            required: 'Please fill cityFrom longitude'
        }
    },
    cityTo: {
        geonameId: {
            type: Number,
            required: 'Please fill cityTo geonames id'
        },
        name: {
            type: String,
            required: 'Please fill cityTo name'
        },
        adminName1: {
            type: String,
            required: 'Please fill cityFrom adminName1'
        },
        latitude: {
            type: Number,
            required: 'Please fill cityTo latitude'
        },
        longitude: {
            type: Number,
            required: 'Please fill cityTo longitude'
        }
    },
    distance: Number,
    points: [{
        latitude: {
            type: Number,
            required: 'Please fill latitude'
        },
        longitude: {
            type: Number,
            required: 'Please fill longitude'
        },
        elevation: {
            type: Number
        }
}],
    markers: [{
        latitude: {
            type: Number,
            required: 'Please fill latitude'
        },
        longitude: {
            type: Number,
            required: 'Please fill longitude'
        },
        type: {
            type: String,
            required: 'Please fill type'
        }
}]
});

module.exports = mongoose.model('Step', StepSchema);