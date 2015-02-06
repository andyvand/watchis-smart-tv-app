// TODO if mouse coordinates are ok then show status if player is playing
// TODO auth can be checked on network change(IP address?)
var Player = {
		AVPlay: null,
		bInited: false,
		curTime: 'NaN',
		duration: 'NaN',
		curItemTitle: '',
		e: 0,
		dimensions: {
			'width': 1280,
			'height': 720
		},
		timeoutId: -1
};

// TODO reuse same
Player.init = function() {
	var result = true;
	if (this.bInited != true) {
		try {
			webapis.avplay.getAVPlay(Player.getAVPlaySuccess, Player.getAVPlayError);
			var initOptions = {
				containerID: 'player_container',
				bufferingCallback: bufferingCB,
				playCallback: playCB,
				displayRect: {
					top: 0,
	                left: 0,
	                width: Player.dimensions.width,
	                height: Player.dimensions.height
				},
				autoRatio: true,
				zIndex: 1
			};
			this.AVPlay.init(initOptions);
		} catch (e) {
			log('ERROR Player.init');
			log(e);
			result = false;
		}
	}
	return result;
};

Player.getAVPlaySuccess = function(avplay) {
	this.bInited = true;
	log('Getting avplay object successfully');
    Player.AVPlay = avplay;
};

Player.getAVPlayError = function(a,b,c,d,e) {
	log('ERROR: Player.getAVPlayerror. a,b,c,d,e');
	console.dir([a,b,c,d,e]);
};

Player.playVideo = function(url) {
	log('Trying to play ' + url);
	try {
		Player.show();
		Player.init();
		Player.AVPlay.open(url);
		Player.AVPlay.play(Player.successCB, Player.errorCB);
	} catch (e) {
		log('Player.playVideo failed');
		log(e.message);
	}
};

Player.successCB = function() {
	log('Player.successCB');
	document.getElementById('player_container').children[Player.AVPlay.id].addEventListener('mousemove', Player.mouseMoved);
};

Player.errorCB = function(a,b,c,d,e) {
	log('Player.errorCB');
	log([a,b,c,d,e]);
};

var bufferingCB = {
    onbufferingstart : function () {
      log("buffering started");
      Player.duration = new PlayTime(Player.AVPlay.getDuration());
    },
    onbufferingprogress: function (percent) {
    	Player.bufferingProgress = percent;
		//Player.updateBufferingInfo();
    },
    onbufferingcomplete: function () {
        log("buffering completely");
    }
};

var playCB = {
    oncurrentplaytime: function (time) {
        Player.curTime = time;
        Player.updateTimeInfo();
    },
    onresolutionchanged: function (width, height) {
        log("resolution changed : " + width + ", " + height);
    },
    onstreamcompleted: function () {
        log("streaming completed");
    },
    onerror: function (error) {
        log(error.name);
    }
};

Player.show = function() {
	document.getElementById('player_container').style.display = 'block';
	var e = document.getElementById('player_overlay_title_info');
	widgetAPI.putInnerHTML(e, Player.curItemTitle);
	//Player.showPlayerOverlay();
};

Player.mouseMoved = function() {
	Player.showOverlay();
	if (Player.timeoutId != -1) {
		clearTimeout(Player.timeoutId);
	}
	Player.timeoutId = setTimeout(Player.hideOverlay, 3000);
};

Player.showOverlay = function() {
	document.getElementById('player_overlay_container').style.display = 'block';
};

Player.hideOverlay = function(){
	document.getElementById('player_overlay_container').style.display = 'none';
};

Player.updateTimeInfo = function() {
	var e = document.getElementById('player_overlay_time_info');
	// TODO take this snippet to other places
	widgetAPI.putInnerHTML(e, Player.curTime.timeString + '/' + Player.duration.timeString);
};

Player.play = function() {
	log('Player.play');
	if (Player.AVPlay.State2String[Player.AVPlay.status] == 'PLAY_STATE_PAUSED') {
		Player.AVPlay.resume()
	} else {
		log('Player.play was not paused');
	}
};

Player.pause = function() {
	// TODO show pause screen
	Player.AVPlay.pause();
	log('Player.pause');
};

Player.destroy = function() {
	document.getElementById('player_container').style.display = 'none';
	Player.AVPlay.destroy();
};