log = function(msg) {
    if(true) {
        console.log(msg);
    }
};

err = function(msg) {
    if(true) {
        document.getElementById('message_box').textContent = msg;
    }
};

dbg = function(msg) {
    if(Settings.cachedSettings.debug == true) {
        var li = document.createElement('li');
        var liText = document.createTextNode(msg);
        li.appendChild(liText);
        var container = document.getElementById('debug_ul');
        container.insertBefore(li, container.firstChild);
        console.debug(msg);
    }
}