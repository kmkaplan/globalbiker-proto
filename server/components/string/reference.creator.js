(function () {

    "use strict";

    var diacritics = require('./diacritics');
    
    exports.createReferenceFromString = function (str) {
        if (str){
            // revove diacritics (accents)
            return diacritics.removeDiacritics(str)
            // replace spaces with '-'
            .replace(/ /g,"-")
            // replace "'" with '-'
            .replace(/'/g,"-")
            // remove duplicated '-'
            .replace(/----/g,"-")
            .replace(/---/g,"-")
            .replace(/--/g,"-")
            // remove all non-alpha numerics or '-'
            .replace(/[^a-zA-Z\d-]/g, '')
            // to lower case
            .toLowerCase();
        }else{
            return null;
        }
    };

})();