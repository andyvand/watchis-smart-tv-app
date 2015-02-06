Watchis = {
    loginTries: 0,
    fetchPage: function (successCallback, errorCallback) {
        dbg('Watchis.fetchPage');
        Main.fetchGridSuccessCB = successCallback;
        Main.fetchGridErrorCB = errorCallback;
        this.ajax(Watchis.generateNavUrl(), this.processGridXml);
    },

    processGridXml: function(event) {
        dbg('Watchis.processGridXml');
        var xhr = event.currentTarget;
        if (xhr.readyState != 4) {
            return;
        }

        dbg('Watchis.processGridXml & state == 4');

        if (xhr.responseXML == null) {
            log('processGridXml xhr.responseText');
            log(xhr.responseText);
        }

        dbg('Watchis.processGridXml xhr.responseXML is present');
        dbg('[' + xhr.responseXML + ']');

        var xmlItems = xhr.responseXML.firstChild;

        if (xmlItems.attributes != undefined
            && xmlItems.getAttribute('total') != undefined
            && xmlItems.getAttribute('total') == 0
        ) {
            err(xmlItems.firstElementChild.textContent);
            dbg('Watchis.processGridXml error');
            Main.fetchGridErrorCB(xmlItems.firstElementChild.textContent);
            return;
        }

        dbg('Watchis.processGridXml Found items');

        if (xmlItems.nodeName == 'error' && xmlItems.textContent == 'Access Denied' && Watchis.loginTries == 0) {
            err('Error [' + xmlItems.textContent + ']');
            dbg('Watchis.processGridXml Access Denied');
            return;
        }

        dbg('Watchis.processGridXml Access Granted');
        var page = [];
        for (var index in xmlItems.childNodes) {
            var xmlItem = xmlItems.childNodes[index];
            var item = {};
            if (xmlItem.nodeType != 1 || xmlItem.nodeName == 'count') {
                continue;
            }

            for (var innerIndex in xmlItem.childNodes) {
                var childNode = xmlItem.childNodes[innerIndex];
                if (childNode.textContent == 'Пичалька, ничего не найдено') {
                    // TODO not found based on count?
                    Main.fetchGridErrorCB('Пичалька, ничего не найдено');
                }
                if (childNode.nodeType != 1) {
                    continue;
                }

                item[childNode.nodeName] = childNode.textContent;
            }
            page.push(item);

        }
        dbg('Watchis.processGridXml complete. Callback.');
        Main.fetchGridSuccessCB(page);
    },

    fetchItem: function(url, successCallback) {
        Main.fetchInfoSuccessCB = successCallback;
        this.ajax(url, this.processItemXml);
    },

    processItemXml: function(event) {
        var xhr = event.currentTarget;
        if (xhr.readyState != 4) {
            return;
        }

        var xmlItem = xhr.responseXML.firstChild;
        var info = {};
        for (var index in xmlItem.childNodes) {
            childNode = xmlItem.childNodes[index];
            if (childNode.nodeType != 1) {
                continue;
            }
            info[childNode.nodeName] = childNode.textContent;
        }
        Main.fetchInfoSuccessCB(info);
    }
};

Watchis.login = function(){
    dbg('Watchis.login');
    this.ajax(Watchis.generateLoginUrl(), Watchis.processLoginXml);
};

Watchis.processLoginXml = function(event) {
    dbg('Watchis.processLoginXml');
    var xhr = event.currentTarget;
    if (xhr.readyState == 4) {
        dbg('Watchis.processLoginXml :: xhr.readyState == 4 ');
        Watchis.loginTries++;
        Watchis.ajax(Watchis.generateNavUrl(), Watchis.processGridXml.bind(Watchis));
    }
};

Watchis.ajax = function(url, callback) {
    dbg('Watchis.ajax to ' + url);
    log('Watchis.ajax');
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('GET', url);
    xhr.onreadystatechange = callback;
    xhr.send();
};

Watchis.generateNavUrl = function() {
    dbg('Watchis.generateNavUrl');
    var urlParts = [];

    if (Main['filter']['page'] != null) {
        urlParts.push('page=' + Main['filter']['page']);
    }

    if (Main['filter']['limit'] != null) {
        urlParts.push('limit=' + Main['filter']['limit']);
    }

    if (Main['filter']['search'] != null) {
        urlParts.push('search=' + Main['filter']['search']);
        url = Main.base_url + '?' + urlParts.join('&');
    } else if (Main['filter']['catalog'] != 'top') {
        if (Main['filter']['genre'] != null) {
            urlParts.push('genre=' + Main['filter']['genre']);
        }
        url = Main.base_url + '?' + urlParts.join('&');
    } else {
        url = Main.base_url + '/top?' + urlParts.join('&');
    }
    //url += '&nocache=' + new Date().valueOf();
    dbg('generated ' + url);
    return url;
};

Watchis.generateLoginUrl = function(){
    dbg('Watchis.generateLoginUrl');
    var url = [];
    var username = Settings.cachedSettings.username;
    var password = Settings.cachedSettings.password;
    if (username == '' || password == '') {
        dbg('Watchis.generateLoginUrl :: ERROR');
        throw {'message': 'Логин или Пароль пустой. Гляньте-ка в настройки.'}
    }
    url.push('username=' + username);
    url.push('password=' + password);
    url = Main.base_url + '?' + url.join('&');
    //url += '&nocache=' + new Date().valueOf();
    return url;
};