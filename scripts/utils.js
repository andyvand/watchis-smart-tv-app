Utils = {};
Utils.hasClass = function(element, className) {
    var result = false;
    if (element.className != undefined) {
        if (element.className.split(' ').indexOf(className) > -1) {
            result = true;
        }
    }
    return result;
};