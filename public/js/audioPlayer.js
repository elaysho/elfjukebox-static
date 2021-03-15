$(document).ready(function() {
    var tag = document.createElement('script');

    try {
        tag.src = API_SRC;
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } catch(e) {
        console.error(e);
    }
});

const TIME_LIMIT = 1000;
const API_SRC = 'https://www.youtube.com/iframe_api';
const DEFUALT_ID = '6TwzSGYycM';

var osWatchout = ['iPadOS', 'iOS'];

var playerJustLoaded = false;
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('audioPlayer', {
        height: '0',
        width: '0',
        videoId: DEFUALT_ID,
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        },
        playerVars: {
            autoplay: 1,
            loop: 0,
            controls: 1,
            enablejsapi: 1,
            fs: 0,
            playsinline: 1,
            cc_load_policy: 0,
            disablekb: 1,
            iv_load_policy: 3
        }
    });

    playerJustLoaded = true;

    if(window.md.mobile() == null) {
        onBackgroundPlayerReady();
    } else {
        $('.btn__bgToggle').attr('data-toggle', 'true');
        $('.btn__bgToggleIcon').attr('data-feather', 'video');
        $('.btn__bgToggle').attr('title', 'Turn On Background Video');

        feather.replace();
    }
}

function onPlayerReady(event) {
    var volume = 100;

    event.target.setVolume(volume);
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    if(event.data == YT.PlayerState.PLAYING && !playerJustLoaded) {
        var timeout = 1;
        console.log(window.md.os(), 'timeout: ' + timeout);

        setTimeout(stopVideo, timeout);
        playerJustLoaded = true;
    }

    console.log(event);
    console.log('playing: ' + (event.data == YT.PlayerState.PLAYING));
}

function stopVideo() {
    player.stopVideo();
}

function playVideo() {
    player.playVideo();
}

var backgroundPlayer;
function onBackgroundPlayerReady() {
    var orignalPlaylist = [
            'dctGL_a13hk', 'RZrqrinmdks', 'eM5XiXrBu74'
        ];
    orignalPlaylist = utils.shuffleArray(orignalPlaylist);
    
    var playlistSeconds = {
        dctGL_a13hk: [0, null],
        RZrqrinmdks: [0, null],
        eM5XiXrBu74: [0, null]
    };

    var playlist    = orignalPlaylist;
    var firstVideoId = playlist.shift();
    backgroundPlayer = new YT.Player('backgroundPlayer', {
        videoId: firstVideoId,
        events: {
            'onReady': function(event) {
                event.target.mute();
                event.target.playVideo();
            },
            'onStateChange': function(event) {
                if(event.data == YT.PlayerState.PLAYING) {}
                if(event.data == YT.PlayerState.ENDED) {
                    if(playlist.length == 0) playlist = orignalPlaylist;

                    var videoId = playlist.shift();
                    backgroundPlayer.cueVideoById({
                        videoId: videoId
                    });

                    backgroundPlayer.playVideo();
                }
            }
        },
        playerVars: {
            autoplay: 1,
            loop: 1,
            controls: 0,
            enablejsapi: 1,
            fs: 0,
            playsinline: 1,
            cc_load_policy: 0,
            disablekb: 1,
            iv_load_policy: 3
        }
    });
}

function adjustBackgroundPlayerSound() {
    var unmute = $(this).attr('data-unmute');

    if(unmute == 'true') {
        $(this).attr('data-unmute', 'false');
        $(this).find('.btn__bgSoundIcon').attr('data-feather', 'volume-x');
        $(this).attr('title', 'Mute');

        backgroundPlayer.unMute();
    } else {
        $(this).attr('data-unmute', 'true');
        $(this).find('.btn__bgSoundIcon').attr('data-feather', 'volume-2');
        $(this).attr('title', 'Unmute');

        backgroundPlayer.mute();
    }

    feather.replace();
}

function toggleBackgroundVideo() {
    var bgoff = $(this).attr('data-toggle');

    if(bgoff == 'false') {
        $(this).attr('data-toggle', 'true');
        $(this).find('.btn__bgToggleIcon').attr('data-feather', 'video');
        $(this).attr('title', 'Turn On Background Video');

        $('#backgroundPlayer').hide();
        $('.overlay__vidBg').hide();
        backgroundPlayer.stopVideo();
    } else {
        $('#backgroundPlayer').show();
        $('.overlay__vidBg').show();

        $(this).attr('data-toggle', 'false');
        $(this).find('.btn__bgToggleIcon').attr('data-feather', 'video-off');
        $(this).attr('title', 'Turn Off Background Video');

        if(backgroundPlayer == null) {
            onBackgroundPlayerReady();
        } else {
            backgroundPlayer.playVideo();
        }
    }

    feather.replace();
}