$(document).ready(function() {
    var tag = document.createElement('script');

    tag.src = API_SRC;
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});

const TIME_LIMIT = 1000;
const API_SRC = 'https://www.youtube.com/iframe_api';
const DEFUALT_ID = '6TwzSGYycM';

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
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    if(event.data == YT.PlayerState.PLAYING && !playerJustLoaded) {
        setTimeout(stopVideo, 0);
        playerJustLoaded = true;
    }
}

function stopVideo() {
    player.stopVideo();
}

function playVideo() {
    console.log('yow');
    player.playVideo();
}

