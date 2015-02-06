Kbd = {
    focusedElement: null,
    okHandler: null
};

Kbd.handleClick = function(event) {
    Kbd.focusedElement.focus();
    var src = event.srcElement;
    if (Utils.hasClass(src, 'kbd-key-ok') && typeof Kbd.okHandler == 'function') {
        Kbd.okHandler();
    } else if (src.dataset.handler != undefined && typeof Kbd['handle' + src.dataset.handler] == 'function') {
        Kbd['handle' + src.dataset.handler](event);
    } else if (Utils.hasClass(src, 'kbd-key-del') && typeof Kbd.delHandler == 'function') {
        Kbd.delHandler();
    }else if (Utils.hasClass(src, 'kbd-key')) {
        Kbd.focusedElement.value += src.dataset.key;
    }
};

Kbd.delHandler = function() {
    Kbd.focusedElement.value = Kbd.focusedElement.value.substring(0, Kbd.focusedElement.value.length - 1);
};

Kbd.handleLayoutSwitch = function(event){
    var src = event.srcElement;
    var kbds = document.getElementsByClassName('local-kbd');
    for (var k = 0; k < kbds.length; k++) {
        kbds[k].style.display = 'none';
    }
    var toLayout = src.dataset.toLayout;
    document.getElementById('kbd_search_' + toLayout).style.display = 'block';
}