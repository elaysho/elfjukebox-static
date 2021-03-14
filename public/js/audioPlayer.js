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
            controls: 0
        }
    });

    playerJustLoaded = true;
}

function onPlayerReady(event) {
    var volume = (osWatchout.includes(window.md.os())) ? 0 : 5;
    console.log(window.md.os(), 'volume: ' + volume);

    event.target.setVolume(volume);
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    if(event.data == YT.PlayerState.PLAYING && !playerJustLoaded) {
        var timeout = (osWatchout.includes(window.md.os())) ? 1 : 5000;
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

