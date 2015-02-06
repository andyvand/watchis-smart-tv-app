Settings = {
    fileName: 'settings.json',
    cachedSettings: {
        username: '',
        password: '',
        debug: false
    },
    bInited: false,
    fs: null
};

Settings.init = function()
{
    if (Settings.bInited != true) {
        try {
            Settings.fs = new FileSystem();
        } catch (err) {
            log(err.message);
        }
        if (Settings.fs && Settings.fs.isValidCommonPath(curWidget.id) == 0){
            Settings.fs.createCommonDir(curWidget.id);
        }
        Settings.bInited = true;
    }
};

Settings.writeSettings = function()
{
    dbg('Settings.writeSettings');
    var settings = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        debug: document.getElementById('debug').checked
    };

    var fileObj = Settings.fs.openCommonFile(curWidget.id + '/' + Settings.fileName, 'w');
    Settings.cachedSettings = settings;
    var result = fileObj.writeAll(JSON.stringify(Settings.cachedSettings));
    Settings.fs.closeCommonFile(fileObj);
}

Settings.readSettings = function()
{
    dbg('Settings.readSettings');
    var fileObj = Settings.fs.openCommonFile(curWidget.id + '/' + Settings.fileName, 'r');
    if (fileObj) {
        var result = fileObj.readAll();
        Settings.cachedSettings = JSON.parse(result);
    }
    Settings.fs.closeCommonFile(fileObj);
}

Settings.load = function()
{
    dbg('Settings.load');
    Settings.init();
    Settings.readSettings();
    document.getElementById('username').value = Settings.cachedSettings.username;
    document.getElementById('password').value = Settings.cachedSettings.password;
    document.getElementById('debug').checked = Settings.cachedSettings.debug;
};
