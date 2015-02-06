// TODO cache separate infos by id
var widgetAPI;
if ( typeof Common != "undefined" && typeof Common.API != "undefined") {
    widgetAPI = new Common.API.Widget();
} else { widgetAPI = { sendReadyEvent: function(){ console.log('Common.API.Widget.sendReadyEvent'); } }; }

Main = {
    'base_url': 'http://watch.is/api',
    'filter': {
        'catalog'   : null,
        'genre'     : null,
        'page'      : 0,
        'search'    : null
    },
    'grid': null,
    'resource': null,
    'active_item': null
};

Main.onLoadCB = function() {
    widgetAPI.sendReadyEvent();

    try {
        if(Settings.cachedSettings.debug == true) {
            document.getElementById('debug_overlay').style.display = 'block';
        }
        Settings.load();
        if(Settings.cachedSettings.debug == false) {
            document.getElementById('debug_overlay').style.display = 'none';
        }
    } catch (e) {
        dbg(e);
    }

    Watchis.login();
    this.grid = new Grid();
    this.resource = Watchis;
    document.body.addEventListener('keydown',Main.keyDown.bind(Main), false);

    document.getElementById('search_button').addEventListener('click', Main.handleSearchInput.bind(this), false);
    document.getElementById('settings_button').addEventListener('click', Main.handleSettingsButtonClick.bind(this), false);
    document.getElementById('username').addEventListener('focus', Main.handleSettingsInputClick, false);
    document.getElementById('password').addEventListener('focus', Main.handleSettingsInputClick, false);
    document.getElementById('settings_save_button').addEventListener('click', Settings.writeSettings, false);

    document.getElementById('kbd').addEventListener('click', Kbd.handleClick.bind(this), false);
    document.getElementById('page_prev_btn').addEventListener('click', this.grid.prevPage.bind(this), false);
    document.getElementById('page_next_btn').addEventListener('click', this.grid.nextPage.bind(this), false);

    // Nav buttons CBs
    document.getElementById('catalog_button').addEventListener('click', Main.handleNavCatalogClick.bind(this), false);
    document.getElementById('genre_button').addEventListener('click', Main.handleNavGenreClick.bind(this), false);
    document.getElementById('filter_sort_apply_btn').addEventListener('click', this.grid.displayPage.bind(this.grid), false);

    // Tnt buttons CBs
    var tintButtons = document.getElementsByClassName('tint-button');
    for (btn = 0; btn < tintButtons.length; btn++) {
        tintButtons[btn].addEventListener('click', Main.handleTintButtonClick.bind(this), false);
    }
    document.getElementById('info_close').addEventListener('click', this.hideTint.bind(this.grid), false);


    this.grid.displayPage();
};

Main.onUnloadCB = function() {};

Main.handleSearchInput = function() {
    document.getElementById('title_placeholder').style.display = 'none';
    var si = document.getElementById('search_input');
    var search = document.getElementById('kbd');
    si.style.display = 'block';
    search.style.display = 'block';
    search.style.top = si.offsetHeight + si.offsetTop + 10 + 'px';
    search.style.left = si.offsetLeft + 30 + 'px';
    Kbd.focusedElement = si;
    Kbd.okHandler = function() {
        log('Main.handleSearchInput');
        document.getElementById('title_placeholder').style.display = 'inline-block';
        document.getElementById('search_input').style.display = 'none';
        document.getElementById('kbd').style.display = 'none';
        Kbd.focusedElement.blur();
        Kbd.focusedElement = null;
        Main.filter.search = document.getElementById('search_input').value;
        Main.grid.displayPage();
        Main.filter.search = null;
    };
};

Main.showTint = function(sectionId) {
    Main.hideTint();
    if (sectionId != undefined) {
        element = document.getElementById(sectionId);
        if (element !=undefined) {
            element.style.display = 'block';
            Main.active_item = sectionId;
        }
    }
    document.getElementById('tint_overlay').style.display = 'block';
};

Main.hideTint = function() {
    document.getElementById('tint_overlay').style.display = 'none';
    var tintSections = document.getElementsByClassName('tint-section');
    for (var s = 0; s < tintSections.length; s++){
        tintSections[s].style.display = 'none';
    }
    document.getElementById('spinner').style.display = 'none';
    document.getElementById('tint_info').style.display = 'none';
    document.getElementById('tint_settings').style.display = 'none';
    document.getElementById('kbd').style.display = 'none';
    Main.active_item = null;
};

Main.replaceTintWith = function(sectionId) {
    Main.hideTint();
    Main.showTint(sectionId);
};

Main.handleNavCatalogClick = function(e) {
    Main.showTint('tint_catalog_chooser');
};

Main.handleNavGenreClick = function(e) {
    Main.showTint('tint_genre_chooser');
};

Main.handleTintButtonClick = function(e) {
    var btn = e.srcElement;
    Main.hideTint();
    var section = btn.dataset.section || null;
    var val = btn.dataset.val || null;
    var valRu = btn.dataset.valRu || null;
    if (section || val || valRu) {
        log('section:' + section + '/ val:' + val + ' /valRu:' + valRu);
        Main.updateNav(section, val, valRu)
    }
};

Main.updateNav = function(section, val, valRu) {
    if (section == 'catalog' && val == 'top') {
        document.getElementById('genre_button').style.display = 'none';
    } else {
        document.getElementById('genre_button').style.display = 'inline-block';
    }

    if (document.getElementById(section + '_button') != undefined) {
        Main['filter'][section] = val;
        if (valRu != undefined) {
            document.getElementById(section + '_button').innerText = valRu;
        } else {
            document.getElementById(section + '_button').innerText = val;
        }
    }
};

Main.showError = function(err) {
    log('ERROR ERROROR in Main.showError' + err);
    Main.hideTint();
};

Main.keyDown = function(event){
    var keyCode = event.keyCode;
    log("Key pressed: " + keyCode);

    switch(keyCode)
    {
        case TvKeyCode.KEY_RETURN:
        case TvKeyCode.KEY_PANEL_RETURN:
            console.log("KEY_RETURN || KEY_PANEL_RETURN");
            event.preventDefault();
            Main.handleReturnKey();
            break;

        case TvKeyCode.KEY_PLAY:
            console.log("KEY_PLAY");
            this.playWrapper();
            console.log('Player has state ' + Player.state);
            break;

        case TvKeyCode.KEY_STOP:
            console.log("KEY_STOP");
            break;

        case TvKeyCode.KEY_PAUSE:
            console.log("KEY_PAUSE");
            this.pauseWrapper();
            break;

        case TvKeyCode.KEY_FF:
            console.log("KEY_FF");
        /*if(Player.getState() != Player.PAUSED)
         Player.skipForwardVideo();
         break;*/

        case TvKeyCode.KEY_RW:
            console.log("KEY_RW");
            if(Player.getState() != Player.PAUSED)
                Player.skipBackwardVideo();
            break;

        case TvKeyCode.KEY_DOWN:
            console.log("KEY_DOWN");
            // TODO add infopanel.
            // TODO add open windows stack to know how keys are handled
            document.getElementById('info_right_column').scrollTop += 50
            //this.selectNextVideo(this.DOWN);
            break;

        case TvKeyCode.KEY_UP:
            console.log("KEY_UP");
            document.getElementById('info_right_column').scrollTop -= 50
            //this.selectPreviousVideo(this.UP);
            break;

        case TvKeyCode.KEY_ENTER:
        case TvKeyCode.KEY_PANEL_ENTER:
            console.log("KEY_ENTER || KEY_PANEL_ENTER");
            break;

        case TvKeyCode.KEY_MUTE:
            console.log("KEY_MUTE");
            break;

        default:
            console.log("Unhandled key");
            break;
    }
};

/* ------ HANDLE KEYS ------*/
Main.handleReturnKey = function(){
    if (Main.active_item == null) {
        // TODO add confirm dialog
        widgetAPI.sendReturnEvent();
    } else if (Player.AVPlay != null && Player.AVPlay.State2String[Player.AVPlay.status] != 'PLAY_STATE_STOPPED'){
        Player.destroy();
    }else{
        Main.hideTint();
    }
};

Main.playWrapper = function() {
    if (Player == undefined) {
        return;
    }
    Player.play();
};

Main.pauseWrapper = function() {
    if (Player == undefined) {
        return;
    }
    Player.pause();
};

Main.handleSettingsButtonClick = function() {
    Main.showTint('tint_settings');
};

Main.handleSettingsInputClick = function(e){
    srcId = e.srcElement.id;
    var si = document.getElementById(srcId);
    var search = document.getElementById('kbd');
    search.style.display = 'block';
    search.style.top = si.offsetHeight + si.offsetTop + 10 + 'px';
    Kbd.focusedElement = si;
    Kbd.okHandler = function() {
        document.getElementById('kbd').style.display = 'none';
    };
};
