'use strict';

var _ = require('lodash');
var Interest = require('./interest.model');

var IO = require('../../components/io/io');
var path = require('path');

// Get list of interests
exports.index = function (req, res) {
    Interest.find(function (err, interests) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, interests);
    });
};

// Get a single interest
exports.show = function (req, res) {
    Interest.findById(req.params.id, function (err, interest) {
        if (err) {
            return handleError(res, err);
        }
        if (!interest) {
            return res.send(404);
        }
        return res.json(interest);
    });
};

/**
 * Get interests by step.
 */
exports.getByStep = function (req, res) {

    var stepId = req.params.stepId;

    Interest.find({
        'stepId': stepId
    }, function (err, interests) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, interests);
    });
};


exports.upload = function (req, res) {

    var interestId = req.params.id;

    Interest.findById(interestId, function (err, interest) {
        if (err) {
            return handleError(res, err);
        }
        if (!interest) {
            console.log('Interest "%s" does not exists.', interestId);
            return res.send(404);
        }
        var file = req.files.file;

        if (!file) {
            console.log('File "file" is missing.');
            return res.send(400, 'File "file" is missing.');
        }

        var newPath = '/photos/interests/' + interestId + '/' + path.basename(file.path);

        // copy file
        IO.copyFile(file.path, 'server/' + newPath);

        interest.photos.push({
            url: newPath
        });

        interest.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, interest);
        });
    })
};


exports.deletePhoto = function (req, res) {


    var interestId = req.params.id;
    var photoId = req.param("photoId");

    Interest.findById(interestId, function (err, interest) {
        if (err) {
            return handleError(res, err);
        }
        if (!interest) {
            console.log('Interest "%s" does not exists.', interestId);
            return res.send(404);
        }

        var photoToDelete = interest.photos.reduce(function (output, photo) {
            if (("" + photo._id) === photoId) {
                return photo;
            } else {
                console.log(photo._id);
                console.log(typeof (photo._id));
                console.log(typeof (photoId));
            }
            return output;
        }, null);

        if (photoToDelete === null) {
            console.log('Photo "%s" does not exists.', photoId);
            return res.send(404);
        }

        var index = interest.photos.indexOf(photoToDelete);
        if (index > -1) {
            interest.photos.splice(index, 1);
            interest.save(function (err) {
                if (err) {
                    return handleError(res, err);
                }
                IO.removeFile(photoToDelete.url, function (err) {
                    return res.json(204, interest);
                });

            });
        }

    });


};

// Creates a new interest in the DB.
exports.create = function (req, res) {
    Interest.create(req.body, function (err, interest) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, interest);
    });
};

// Updates an existing interest in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Interest.findById(req.params.id, function (err, interest) {
        if (err) {
            return handleError(res, err);
        }
        if (!interest) {
            return res.send(404);
        }
        var updated = _.merge(interest, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, interest);
        });
    });
};

// Deletes a interest from the DB.
exports.destroy = function (req, res) {
    Interest.findById(req.params.id, function (err, interest) {
        if (err) {
            return handleError(res, err);
        }
        if (!interest) {
            return res.send(404);
        }
        interest.remove(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}