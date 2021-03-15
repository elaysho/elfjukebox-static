var index = (function() {
    const MAX_SONGS_PER_GAME = 20;
    const MIN_SONGS_PER_GAME = 1;

    const HOST_DETAILS_KEY   = 0;
    const SONGS_KEY          = 1;

    const YOUTUBE_ID_RE      = /^.*(youtu.be\/|youtube(-nocookie)?.com\/(v\/|.*u\/\w\/|embed\/|.*v=))([\w-]{11}).*/;

    var ui;

    var bindUI = function() {
        ui = {};

        ui.btn__hostGame    = $('.btn__hostGame');
        ui.btn__playGame    = $('.btn__playGame');
        ui.btn__addSongs    = $('.btn__addSongs');
        ui.btn__deleteSongs = $('.btn__deleteSongs');
        ui.btn__repeatSong  = $('.btn__repeatSong');
        ui.btn__info        = $('.btn__info');

        ui.input__gameCode  = $('.input__gameCode');
        ui.input__gameUrl   = $('.input__gameUrl');
    }

    var bindEvents = function() {
        ui.btn__hostGame.on('click', hostGame);
        ui.btn__playGame.on('click', playGame);
        ui.btn__info.on('click', showInfo);
        
        $(document).on('click', '.btn__addSongs', addASong);
        $(document).on('click', '.btn__deleteSongs', deleteASong);
        $(document).on('click', '.input__gameCode', utils.copyToClipBoard);
        $(document).on('click', '.input__gameUrl', utils.copyToClipBoard);
        $(document).on('click', '.btn__repeatSong', repeatSong);

        $(document).on('keyup change', '.input__songStartsAt', function() {
            var startsAt = parseInt($(this).val());
            $(this).next().val(startsAt + 1);
        });
        
        $(document).on('keyup change', '.input__error', function() {
            utils.checkInputs([$(this)]);
        });

        $(document).on('keyup change', '.group__error', function() {
            utils.checkInputs([$(this)]);
        });
    }

    var hostGame = function() {
        Swal.mixin(swalConfigs.HOST_GAME_SETTINGS)
            .queue(swalConfigs.HOST_GAMES_MODAL_QUEUES)
            .then((result) => {
                if(result.value) {
                    const answers = result.value;

                    var loadingSwal = swalConfigs.CREATE_GAME_LOADING;
                    loadingSwal.didOpen = () => {
                        Swal.showLoading();
                        setTimeout(Swal.clickConfirm, 2000);
                    };

                    loadingSwal.preConfirm = () => {
                        const game = generateGameData(answers);
                        saveGame(game);
                        
                        try {
                            error = localStorage.getItem(gameSettings.ERROR);
                            error = JSON.parse(error);

                            if(error != null) onError(error);
                        } catch(e) {}
                    }

                    Swal.queue([loadingSwal]);
                }

                return false;
          });
    }

    var addASong = function() {
        var songs = $(this).parent().find('.song__group');

        if(songs.length < MAX_SONGS_PER_GAME) {
            $(htmlTemplates.ADD_SONG_GROUP).insertBefore($(this));
        }

        feather.replace();
    }

    var deleteASong = function() {
        var songs = $('.swal2-html-container').find('.song__group');
        if(songs.length > MIN_SONGS_PER_GAME) {
            $($(this).parent()).remove();
        }
    }

    var generateGameData = function(values) {
        var gameData = {};

        gameData.code  = generateGameCode();
        gameData.host_details = {};

        $.each(values[HOST_DETAILS_KEY], function(i, val) {
            gameData.host_details[val.name] = val.value;
        });

        gameData.songs = [];
        $.each(values[SONGS_KEY], function(i, val) {
            if((i % 4) > 0) return;
            if(utils.getYoutubeUrlId(val.value, YOUTUBE_ID_RE) == null) return;
            
            var song = {
                answer: btoa(values[SONGS_KEY][i + 1]['value']),
                id: utils.getYoutubeUrlId(val.value, YOUTUBE_ID_RE),
                link: val.value,
                startSeconds: parseInt(values[SONGS_KEY][i + 2]['value']),
                endSeconds: parseInt(values[SONGS_KEY][i + 3]['value'])
            };

            gameData.songs.push(song);
        });

        gameData.group_name = 'Super Junior';
        return gameData;
    }

    var generateGameCode = function() {
        var code = utils.randomString(gameSettings.GAME_CODE_LENGTH, gameSettings.GAME_CODE_MASK);
        return code;
    }

    var saveGame = function(game) {
        db.collection(gameSettings.DB_KEYS[0])
            .add(game).then((docRef) => {
                Swal.hideLoading();

                var gameCreatedSwal = swalConfigs.GAME_CREATED;
                gameCreatedSwal.didOpen = () => {
                    $('.input__gameCode').val(game.code);

                    var url = utils.addParametersToUrl(location.href, location.search, 
                        [{key: 'code', value: game.code}]);
                    $('.input__gameUrl').val(url);
                };

                Swal.fire(gameCreatedSwal)
                    .then((result) => {
                          if(result.isDismissed) {
                              if(result.reason == 'close') return true;
                          }
                          return false;
                    });
            }).catch((error) => {
                var gameCreatedErrorSwal = swalConfigs.GAME_CREATE_ERROR;
                gameCreatedErrorSwal.didOpen = () => {
                    utils.saveToLocalStorage(gameSettings.UNSAVED_GAMES, game);
                    utils.saveToLocalStorage(gameSettings.ERROR, {error: error, code: game.code});
                };

                Swal.fire(gameCreatedErrorSwal)
                    .then((result) => {});
            });
        
        return null;
    }

    var onError = function(error) {
        db.collection(gameSettings.DB_KEYS[4]).add({
            browser: null,
            error: error.error,
            game_code: error.code,
        }).then((docRef) => {}).catch((error) => {});

        try {
            localStorage.removeItem(gameSettings.ERROR);
        } catch(e) { console.log('Accessing error saved on localStorage', e, e.message); }
    }

    var playGame = function() {
        (async() => {
            var gameModalQueues = await loadGameModals();
            var firstModal = gameModalQueues.shift();

            Swal.fire(firstModal).then((result) => {
                if(result.isDismissed) {
                    return true;
                }

                if(result.value != null) {
                    var game = result.value;
                    utils.saveToLocalStorage('game', game);

                    (async() => {
                        gameModalQueues = await createSongModalsQueues(gameModalQueues);
                        Swal.mixin(swalConfigs.PLAY_GAME_SETTINGS)
                            .queue(gameModalQueues)
                            .then((result) => {
                                if(typeof result.dismiss != 'undefined') {
                                    if(result.dismiss == 'close') {
                                        Swal.fire({
                                            icon: 'warning',
                                            title: 'Aborting...',
                                            text: 'Sorry to see you go in the middle of the game. Hope you had fun!',
                                            showConfirmButton: false,
                                            showCancelButton: false,
                                            timer: 2000,
                                            timerProgressBar: true
                                        });

                                        clearLocalStorage(window.clearKeys);
                                        return true;
                                    }
                                }

                                if(result.value) {
                                    const answers = result.value;
                                    var gameResultHtml = htmlTemplates.GAME_RESULT;
                                    var gameResult = checkAnswers(game, answers);

                                    Swal.fire({
                                        icon: (gameResult.correct == game.songs.length) ? 'success' : 'error',
                                        title: (gameResult.correct == game.songs.length) ? 
                                                'Perfect!' : ('You got ' + gameResult.correct + ' out of ' + game.songs.length + ' songs!'),
                                        html: gameResultHtml,
                                        showConfirmButton: false,
                                        showCloseButton: true,
                                        showCancelButton: true,
                                        cancelButtonText: 'Close',
                                        didOpen: () => {
                                            $.each(game.songs, function(i, song) {
                                                var correctAnswer = '<div class="d-flex justify-content-between align-items-center w-75 mx-auto">' +
                                                                        '<p>' + atob(song.answer) + '</p>' +
                                                                        '<a href="' + song.link + '" class="" target="_blank"><icon data-feather="youtube"></i></a>' +
                                                                    '</div>';
                                                $('.div__correctAnswers').append(correctAnswer);
                                            });

                                            feather.replace();
                                        }
                                    }).then((result) => {
                                        localStorage.removeItem('game');
                                        localStorage.removeItem('current_song');
                                        localStorage.removeItem('songs');
                                    });
                                }
                            });
                    })();

                        
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Ooops!',
                        text: 'Sorry :( The game you\'re looking for doesn\'t exist.',
                        showCancelButton: true,
                        cancelButtonText: 'Close',
                        showConfirmButton: true,
                        confirmButtonText: 'Try Again',
                        reverseButtons: true
                    }).then((result) => {
                        if(result.isConfirmed) {
                            playGame();
                        }
                    });
                }
            });
        })();
    }

    var loadGameModals = async function() {
        var gameModalQueues = [];

        gameModalQueues[0] = swalConfigs.ENTER_GAME_CODE;
        gameModalQueues[0].didOpen = () => {
            var parameters = new URLSearchParams(location.search);
            if(parameters.has('code')) $('.input__gameCodePlay').val(parameters.get('code'));
        };

        gameModalQueues[0].preConfirm = async () => {
            var inputs = $('.swal2-html-container :input');
            if(inputs.length > 0) {
                var validated = utils.checkInputs(inputs);
                if(validated == false) return false;
            }

            var code = $(inputs[0]).val();
            var game = null;

            try {
                game = await loadGame(code);
            } catch(e) {
                console.log('Load game from firebase error!', e);

                Swal.close();
                Swal.fire({
                    icon: 'warning',
                    title: 'Oh no!',
                    text: 'Sorry :( An error has occured. Please try again later.',
                    showConfirmButton: false,
                    showCloseButton: true,
                    timerProgressBar: true,
                    timer: 2000
                });
            }

            return new Promise(function (resolve) {
                resolve(game)
            });
        };

        return gameModalQueues;
    }

    var loadGame = async function(code) {
        let gamesCollection = db.collection(gameSettings.DB_KEYS[0]);
        let gameRef = await gamesCollection.where(gameSettings.GAME_KEYS[0], "==", code).get();

        let gameData = null;
        for(game of gameRef.docs) {
            gameData = game.data();
        }

        return gameData;
    }

    var createSongModalsQueues = async function(gameModalQueues = []) {
        try {
            var game = JSON.parse(localStorage.getItem('game'));
            gameData = game;

            localStorage.setItem('songs', JSON.stringify(game.songs));
            $.each(game.songs, function(i, song) {
                var songModal = swalConfigs.GAME_MODAL;
                songModal.preDeny = () => {
                    Swal.clickConfirm();
                };

                songModal.willOpen = () => {
                    if(osWatchout.includes(window.md.os())) {
                        $('#audioPlayer').prependTo('#swal2-content.swal2-html-container');
                        $('#audioPlayer').prop('width', '560');
                        $('#audioPlayer').prop('height', '340');

                        var cover = '<div id="iframeCover">For iOS users, please click the play button.</div>';
                        $(cover).prependTo('#swal2-content.swal2-html-container');
                    }
                }

                songModal.didOpen = () => {
                    stopVideo();

                    feather.replace();
                    playSong();
                };

                songModal.preConfirm = () => {
                    var inputs = $('.swal2-html-container :input');
                    var values = utils.getValues(inputs);
                    return new Promise(function (resolve) {
                        resolve(values)
                    });
                };

                songModal.willClose = () => {
                    if(osWatchout.includes(window.md.os())) {
                        $('#audioPlayer').appendTo('.ejb__mainContainer');
                        $('#audioPlayer').prop('width', '0');
                        $('#audioPlayer').prop('height', '0');

                        $('#iframeCover').remove();
                    }
                };

                gameModalQueues.push(songModal);
            });

            gameModalQueues.unshift(loadInsturctionModal());
            return gameModalQueues;
        } catch(e) { console.log(e) }
    }

    var loadInsturctionModal = function() {
        try {
            instructionModal = swalConfigs.GAME_INSTRUCTION;
            instructionModal.willOpen = () => {
                var gameData = JSON.parse(localStorage.getItem('game'));
                $('.span__groupName').text(gameData.group_name ?? 'Super Junior');
                $('.div__gameInfo').append('<h4> Game Info: </h4> ');
                $('.div__gameInfo').append('<b> Code: </b> ' + gameData.code + '</br>');
                $('.div__gameInfo').append('<b> Hosted By: </b> ' + ((gameData.host_details.nickname == '') ? 'N/A' : gameData.host_details.nickname));
                $('.div__gameInfo').append('<br>');
                $('.div__gameInfo').append('<b> Songs: </b> ' + gameData.songs.length);
            };

            instructionModal.didOpen = () => {
                player.playVideo();
            };

            return instructionModal;
        } catch(e) {
            console.log('Loading instruction error.', e, e.message);
            return loadInsturctionModal();
        }
    }

    var playSong = function() {
        var songs, song;
        try {
            songs = JSON.parse(localStorage.getItem('songs'));
            song  = songs.shift();

            localStorage.setItem('current_song', JSON.stringify(song));
            localStorage.setItem('songs', JSON.stringify(songs));

            player.loadVideoById({
                videoId: song.id,
                startSeconds: song.startSeconds,
                endSeconds: song.endSeconds
            });
        } catch(e) { console.log('Play song error.', e, e.message); }
    }

    var repeatSong = function() {
        try {
            song = JSON.parse(localStorage.getItem('current_song'));
            player.loadVideoById({
                videoId: song.id,
                startSeconds: song.startSeconds,
                endSeconds: song.endSeconds
            });

            player.setVolume(100);
        } catch(e) { console.log('Repeat song error.', e, e); }
    }

    var checkAnswers = function(game, answers) {
        var results = [];
        results['correct'] = 0;
        results['songs']   = [];

        $.each(answers, function(i, answer) {
            if(typeof answer == 'boolean') return;

            var correctAnswer = game.songs[i - 1].answer;
            results['songs'][i] = (atob(correctAnswer).toLowerCase() == answer[0].value.toLowerCase());
            if(results['songs'][i]) results['correct']++;
        });

        return results;
    }

    var onGameLoad = function() {
        var md = new MobileDetect(window.navigator.userAgent);
        window.md = md;

        var parameters = new URLSearchParams(location.search);
        if(parameters.has('code')) {
            ui.btn__playGame.click();
        }

        if(parameters.has('debug')) {
            if(parameters.get('debug') == 'true') {
                // var headTag = document.getElementsByTagName('title')[0];
                // var mobileConsole = '<script src="js/vendor/hnl.mobileConsole.js"></script>';
                // var mobileConsoleTag = '<script src="https://cdnjs.cloudflare.com/ajax/libs/vConsole/3.4.0/vconsole.min.js"></script>';
                // $(mobileConsoleTag).insertBefore(headTag);

                var vconsole = new VConsole();
                console.log('vconsole initialized.') 
                console.log('mobile debug:');
            }
        }

        var clearKeys = ['game', 'songs', 'current_song'];
        window.clearKeys = clearKeys;
        clearLocalStorage(clearKeys);
    }

    var clearLocalStorage = function(keys) {
        $.each(keys, function(i, key) {
            try {
                localStorage.removeItem(key);
            } catch(e) { console.log(e); }
        });
    }

    var showInfo = function() {
        Swal.fire({
            icon: 'info',
            title: 'Hellooo~',
            html: htmlTemplates.WEBGAME_INFO,
            showCloseButton: true,
            showConfirmButton: false,
            footer: htmlTemplates.WEBGAME_FOOTER
        });
    }

    var init = function() {
        feather.replace();

        bindUI();
        bindEvents();
        onGameLoad();
    }

    return {
        init
    }
})();

$(document).ready(function() {
    index.init();
})