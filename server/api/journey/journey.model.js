'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var JourneySchema = new Schema({
    creationTime: {
        type: Date,
        default: Date.now
    },
    region: {
        type: Schema.ObjectId,
        ref: 'Region',
        required: true
    },
    authors: [{
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    }],
    reference: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    properties: {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            required: true,
            default: 'draft'
        },
        travelWith: {
            type: String
        },
        keywords: [{
            type: String
        }],
        beginDate: {
            type: Date
        },
        difficulty: {
            type: Number
        },
        interest: {
            type: Number
        }
    },
    geo: {
        properties: {
            distance: Number,
            positiveElevationGain: Number,
            negativeElevationGain: Number,
            elevationPoints: [{
                type: Number
            }]
        },
        geometry: {
            type: Object,
            index: '2dsphere'
        },
        cityFrom: {
            geonameId: {
                type: Number
            },
            name: {
                type: String
            },
            adminName1: {
                type: String
            },
            geometry: {
                type: Object,
                index: '2dsphere'
            }
        },
        cityTo: {
            geonameId: {
                type: Number
            },
            name: {
                type: String
            },
            adminName1: {
                type: String
            },
            geometry: {
                type: Object,
                index: '2dsphere'
            }
        },
        waypoints: [{
            stopover: {
                type: Boolean,
                required: true,
                default: false
            },
            city: {
                geonameId: {
                    type: Number
                },
                name: {
                    type: String
                },
                adminName1: {
                    type: String
                },
                geometry: {
                    type: Object,
                    index: '2dsphere'
                }
            }
                }]
    },
    photos: [
        {
            type: Schema.ObjectId,
            ref: 'Photo'
        }
    ],
    steps: [{
        reference: {
            type: String,
            required: true,
            trim: true
        },
        properties: {
            description: {
                type: String,
                trim: true
            },
            difficulty: {
                type: Number
            },
            interest: {
                type: Number
            }
        },
        geo: {
            properties: {
                distance: Number,
                positiveElevationGain: Number,
                negativeElevationGain: Number,
                elevationPoints: [{
                    type: Number
                }]
            },
            geometry: {
                type: Object,
                index: '2dsphere'
            },
            cityFrom: {
                geonameId: {
                    type: Number,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                adminName1: {
                    type: String,
                    required: true
                },
                geometry: {
                    type: Object,
                    index: '2dsphere',
                    required: true
                }
            },
            cityTo: {
                geonameId: {
                    type: Number,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                adminName1: {
                    type: String,
                    required: true
                },
                geometry: {
                    type: Object,
                    index: '2dsphere',
                    required: true
                }
            }
        }
}]
});

module.exports = mongoose.model('Journey', JourneySchema);