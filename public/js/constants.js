var gameSettings = (function() {
    const GAME_CODE_MASK = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const GAME_CODE_LENGTH = 6;

    const DB_KEYS = ['games', 'players', 'settings', 'song_library', 'error_reports'];
    const GAME_KEYS = ['code', 'host_details', 'songs', 'startSeconds', 'endSeconds'];

    const SAVED_GAMES   = 'saved_games';
    const UNSAVED_GAMES = 'unsaved_games';
    const ERROR         = 'error';

    return {
        GAME_CODE_LENGTH,
        GAME_CODE_MASK,
        DB_KEYS,
        GAME_KEYS,
        SAVED_GAMES,
        UNSAVED_GAMES,
        ERROR
    }
})();

var htmlTemplates = (function() {
    const HOST_DETAIL = '<p> Please enter a nickname and password so you can still edit your game later. </p>' +
                        '<div class="text-left">' +
                            '<input type="text" name="nickname" class="swal2-input" placeholder="Nickname" data-required="required">' +
                            '<input type="password" name="password" class="swal2-input" placeholder="Password" data-required="required">' +
                        '</div>';


    const ADD_SONG_HTML_DESCRIPTION = "<p class=\"text-justify\"> You can add songs by pasting it's youtube link on the input fields below. " +
                                        "Please make sure the id is included (ex. https://youtu.be/<b>kEo14-UOM80</b>) </p>";

    const ADD_SONG_GROUP = '<div class="song__group">' +
                                '<div class="">' +
                                    '<input type="text" name="song_link" class="swal2-input" placeholder="Paste song youtube link here" data-required="required">' +
                                    '<input type="text" name="answer" class="swal2-input" placeholder="Song Title" data-required="required">' +
                                    '<input type="text" name="startSeconds" class="swal2-input mr-1" placeholder="Starts At" style="width: 48%" data-required="required">' +
                                    '<input type="text" name="endSeconds" class="swal2-input ml-2" placeholder="Ends At" style="width: 48%" data-required="required">' +
                                '</div>' +
                                '<a class="btn btn-sm btn-round btn-danger float-right btn__deleteSongs"> <i data-feather="x"></i> </a>' +
                            '</div>';
    
    const ADD_SONG_HTML = ADD_SONG_HTML_DESCRIPTION + ADD_SONG_GROUP +
                            '<button type="button" class="swal2-confirm swal2-styled float-right btn__addSongs"> Add </button>';

    const ENTER_GAME_CODE = '<p> Hello ELFs! ' +
                            'To play a game, please enter a game code (ex. <b>SUJUXX</b>) </p>' +
                            '<input type="text" name="code" class="swal2-input input__gameCodePlay" placeholder="Enter game code here" data-required="required">';
    
    const GAME_INSTRUCTION = '<div class="text-justify"> <h4>Mechanics:</h4>' +
                                'Guess which <b><span class="span__groupName"></span></b> ' +
                                "song is playing after hearing it for a second. Didn't get it on the first try? Don't worry. " +
                                "You can always play the song again by pressing the replay button. Have fun! <br><br>" + 
                                '<div class="div__gameInfo text-left"></div>' +
                            "</div>";            
                                        
    const GAME_HTML = '<div class="d-flex justify-content-between align-items-center">' +
                        '<input type="text" name="answer" class="swal2-input mr-2" placeholder="Write your answer here" data-required="required">' +
                        '<button class="swal2-confirm swal2-styled btn__repeatSong"> <i data-feather="repeat"></i> </button>' +
                      '</div>';

    const GAME_RESULT = '<div class="text-left">' +
                            '<div class="div__correctAnswers"></div>' +
                            '<p class="text-center mt-3"> Thank you for playing <b>ELF Jukebox alpha</b>. Hope you had fun! </p>'
                        '</div>';

    const WEBGAME_INFO = '<div class="text-justify">' +
                            '<p> Thank you for checking out ELF Jukebox! Means a lot to me. This game is inspired by a twitter game ' +
                                ' I enjoyed a lot, made by <b><a href="https://twitter.com/avecsuju?s=20">@avecsuju</a></b>. Check out the original ELF Jukebox <a href="https://twitter.com/avecsuju/status/1365467749951049728?s=20">here</a>. </p> </br>' +
                            '<p> I hope you had fun here and I\'m sorry if ever you encountered inconveniences! ' +
                            'ELF Jukebox is still in it\'s alpha version and I\'m still working on it. ^^ </p> </br>' +
                            '<p> For the mean time, if there\'s a problem (<b>i.e</b> sounds not playing, next button unclickable), just refresh it! If problem persists, kindly leave me a DM ' +
                                'at <b><a href="https://twitter.com/haerionne">@haerionne</a></b> so I can help you. ' +
                            'Note that the plan used for hosting this game and for storing it\'s data is just a free plan, so there would be ' +
                                'limitations. </p> </br>' +
                            
                            '<h4>Credits:</h4>' +
                            '<p><a href="https://pixabay.com/users/clker-free-vector-images-3736/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=303367">Jukebox Vector</a>,' +
                                ' relies heavily on <a href="https://sweetalert2.github.io/">SweetAlert2</a>, uses Firestore for Database</p>' +
                         '</div>';

    const WEBGAME_FOOTER = '<a href="https://twitter.com/haerionne"><div class="twitter__icon"></div></a> <a href="https://github.com/elaysho/elfjukebox-static"><div class="github__icon"></div></a>';

    return {
        HOST_DETAIL,
        ADD_SONG_GROUP,
        ADD_SONG_HTML,
        ENTER_GAME_CODE,
        GAME_INSTRUCTION,
        GAME_HTML,
        GAME_RESULT,
        WEBGAME_INFO,
        WEBGAME_FOOTER
    }
})();

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

var swalConfigs = (function() {
    const HOST_GAME_SETTINGS = {
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        reverseButtons: true,
    };

    const HOST_GAMES_MODAL_QUEUES = [
        {
            title: 'Host a Game',
            html: htmlTemplates.HOST_DETAIL,
            footer: '<p><b> Note: </b> Edit Game function is not yet available. </p>',
            allowOutsideClick: () => !Swal.isLoading(),
            preConfirm: () => {
                var inputs = $('.swal2-html-container :input');
                // if(inputs.length > 0) {
                //     var validated = utils.checkInputs(inputs);
                //     if(validated == false) return false;
                // }

                var values = utils.getValues(inputs);
                return new Promise(function (resolve) {
                    resolve(values)
                })
            },
            didOpen: () => {
                $('[name=nickname]').focus();
            }
        },
        {
            title: 'Add Songs',
            html: htmlTemplates.ADD_SONG_HTML,
            allowOutsideClick: () => !Swal.isLoading(),
            preConfirm: () => {
                var inputs = $('.swal2-html-container :input');
                if(inputs.length > 0) {
                    var validated = utils.checkInputs(inputs);
                    if(validated == false) return false;
                }

                var values = utils.getValues(inputs);
                return new Promise(function (resolve) {
                    resolve(values)
                })
            },
            didOpen: () => {
                feather.replace();
            }
        }
    ];

    const CREATE_GAME_LOADING = {
        icon: 'warning',
        title: 'Creating Game...',
        text: "Please wait while your songs are loaded into the jukebox.",
        showCancelButton: false,
        showCloseButton: true,
        allowOutsideClick: () => !Swal.isLoading()
    };

    const GAME_CREATED = {
        icon: 'success',
        title: 'Hooray!',
        showConfirmButton: false,
        showCloseButton: true,
        html: "<p>Your game has been saved. Don't forget to copy your game code below.</p>" +
              '<input type="text" class="swal2-input input__gameCode" data-info="Code" readonly>' +
              '<input type="text" class="swal2-input input__gameUrl data-info="Link" readonly>'
    }

    const GAME_CREATE_ERROR = {
        icon: 'error',
        title: 'Oh no!',
        text: 'Something went wrong with our jukebox.',
        showCancelButton: true,
        cancelButtonText: 'Close',
        showCloseButton: true,
        reverseButtons: true
    }

    const PLAY_GAME_SETTINGS = {
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        reverseButtons: true,
    };

    const ENTER_GAME_CODE = {
        title: "Play a Game",
        html: htmlTemplates.ENTER_GAME_CODE,
        cancelButtonText: 'Cancel'
    }

    const GAME_INSTRUCTION = {
        title: "Are you ready to party?",
        html: htmlTemplates.GAME_INSTRUCTION,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Start',
        footer: '<div class="text-center">' +
                'This game is inspired by <a href="https://twitter.com/avecsuju?s=20">@avecsuju</a>\'s <a href="https://twitter.com/avecsuju/status/1365467749951049728?s=20"> ELF Jukebox </a> game on twitter. </div>'
    }

    const GAME_MODAL = {
        icon: 'question',
        title: 'Guess the song!',
        html: htmlTemplates.GAME_HTML,
        showCancelButton: false,
        allowOutsideClick: () => false,
        footer: '<p> <b>Note:</b> If song doesn\'t play, click the repeat button (with 2 second interval) until it does. ' +
                ' <b>Don\'t spam though, please!</b> </br></br> Also currently not working on mobile too. Sorry :( </p>'
    }

    return {
        HOST_GAME_SETTINGS,
        HOST_GAMES_MODAL_QUEUES,
        CREATE_GAME_LOADING,
        GAME_CREATED,
        GAME_CREATE_ERROR,
        PLAY_GAME_SETTINGS,
        ENTER_GAME_CODE,
        GAME_INSTRUCTION,
        GAME_MODAL
    }
})();