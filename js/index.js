var elfjukebox = (function() {
    var ui;

    var bindUI = function() {
        ui = {};

        ui.btn__hostGame = $('.btn__hostGame');
    }

    var bindEvents = function() {
        ui.btn__hostGame.on('click', hostGame);
    }

    var hostGame = function() {
        var hostDetailsHtml = '<p> Please enter a nickname and password so you can still edit your game later. </p>' +
                                '<input type="text" name="nickname" class="swal2-input" placeholder="Nickname">' +
                                '<input type="password" name="password" class="swal2-input" placeholder="Password">';

        var addSongHtml = '<p> You can add a song by pasting a youtube link. </p>';

        Swal.mixin({
            confirmButtonText: 'Next &rarr;',
            showCancelButton: true,
            progressSteps: ['1', '2', '3'],
            reverseButtons: true,
          }).queue([
            {
              title: 'Host a Game',
              html: hostDetailsHtml,
              allowOutsideClick: () => !Swal.isLoading(),
              preConfirm: () => {
                return new Promise(function (resolve) {
                    resolve([
                      $('[name=nickname]').val(),
                      $('[name=password]').val()
                    ])
                })
              },
              didOpen: () => {
                $('[name=nickname]').focus();
              }
            },
            {
                title: 'Add Songs',
                html: addSongHtml
            },
            'Question 3'
          ]).then((result) => {
            if (result.value) {
              const answers = JSON.stringify(result.value)
              Swal.fire({
                title: 'All done!',
                html: `
                  Your answers:
                  <pre><code>${answers}</code></pre>
                `,
                confirmButtonText: 'Lovely!'
              })
            }
          })
    }

    var init = function() {
        bindUI();
        bindEvents();
    }

    return {
        init
    }
})();

$(document).ready(function() {
    elfjukebox.init();
})

var player;
function onYouTubeIframeAPIReady() {
    var youtubePlayer = $('.youtube-audio');
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: youtubePlayer.data('id'),
        playerVars: {
            autoplay: youtubePlayer.data('autoplay'),
            loop: youtubePlayer.data('loop')
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.playVideo();
  }

  // 5. The API calls this function when the player's state changes.
  //    The function indicates that when playing a video (state=1),
  //    the player should play for six seconds and then stop.
  var done = false;
  function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
      setTimeout(stopVideo, 6000);
      done = true;
    }
  }
  function stopVideo() {
    player.stopVideo();
  }