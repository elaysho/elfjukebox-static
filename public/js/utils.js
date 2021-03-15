var utils = (function() {
    var checkInputs = function(inputs) {
        var valid = true;
        $.each(inputs, function(i, input) {
            if($(input).data('required') == 'required') {
                if($(input).val() == '') valid = (valid) ? false : valid;

                var group = $(input).closest('.song__group');
                if($(input).val() == '') {
                    if(group.length > 0) {
                        if($(group).find('.text-danger').length == 0) {
                            $(group).append('<small class="text-danger"> Oops! The fields above are required. </small>');
                            $(group).addClass('border__error');
                            $(input).addClass('group__error');
                        }
                    } else {
                        $(input).addClass('input__error');
                        if($(input).next().prop('tagName') != 'SMALL') {
                            $('<small class="text-danger"> Oops! This field is required. </small>').insertAfter(input);
                        }
                    }
                } else {
                    if(group.length > 0) {
                        $(group).find('.text-danger').remove();
                        $(input).removeClass('group__error');
                        $(group).removeClass('border__error');
                    } else {
                        $(input).removeClass('input__error');
                        $(input).next().remove();
                    }
                }
            }

            if($(input).data('youtube-link') == 'youtube-link') { 

            }
        });

        return valid;
    }

    var getValues = function(inputs) {
        var values = [];

        $.each(inputs, function(i, input) {
            values.push({name: $(input).attr('name'), value: $(input).val()});
        });

        return values;
    }

    var randomString = function(length, chars) {
        var mask = '';
        if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
        if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (chars.indexOf('#') > -1) mask += '0123456789';
        if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
        var result = '';
        for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
        return result;
    }

    var getYoutubeUrlId = function(url, re) {
        var id = url.match(re);
        if(id != null) {
            return (typeof id[4] != 'undefined') ? id[4] : null;
        } else {
            return null;
        }
    }

    var addParametersToUrl = function(url, search, params) {
        var url = url;
        var parameters = new URLSearchParams(search);

        $.each(params, function(i, param) {
            parameters.set(param.key, param.value);
        });

        url += '?' + parameters.toString();
        return url;
    }

    var copyToClipBoard = function() {
        $(this).select();
        document.execCommand('copy');
        
        Toast.fire({
            icon: 'success',
            text: 'Copied to clipboard.'
        });
    }

    var saveToLocalStorage = function(key, game) {
        try {
            var gameStringify = JSON.stringify(game);
            localStorage.setItem(key, gameStringify);
        } catch(e) {
            console.error(e);
        }
    }

    var shuffleArray = function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }

    return {
        checkInputs,
        getValues,
        randomString,
        getYoutubeUrlId,
        addParametersToUrl,
        copyToClipBoard,
        saveToLocalStorage,
        shuffleArray
    }
})();