CDV = (typeof CDV == 'undefined' ? {} : CDV);
var cordova = window.cordova || window.Cordova;
CDV.FB = {
    init: function (apiKey, fail) {
        // create the fb-root element if it doesn't exist
        if (!document.getElementById('fb-root')) {
            var elem = document.createElement('div');
            elem.id = 'fb-root';
            document.body.appendChild(elem);
        }
        cordova.exec(function () {
            var authResponse = JSON.parse(localStorage.getItem('cdv_fb_session') || '{"expiresIn":0}');
            if (authResponse && authResponse.expirationTime) {
                var nowTime = (new Date()).getTime();
                if (authResponse.expirationTime > nowTime) {
                    // Update expires in information
                    updatedExpiresIn = Math.floor((authResponse.expirationTime - nowTime) / 1000);
                    authResponse.expiresIn = updatedExpiresIn;

                    localStorage.setItem('cdv_fb_session', JSON.stringify(authResponse));
                    FB.Auth.setAuthResponse(authResponse, 'connected');
                }
            }
            console.log('Cordova Facebook Connect plugin initialized successfully.');
        }, (fail ? fail : null), 'FacebookConnectPlugin', 'init', [apiKey]);
    },
    login: function (params, cb, fail) {
        params = params || {
            scope: ''
        };
        cordova.exec(function (e) { // login
            if (e.authResponse && e.authResponse.expiresIn) {
                var expirationTime = e.authResponse.expiresIn === 0 ? 0 : (new Date()).getTime() + e.authResponse.expiresIn * 1000;
                e.authResponse.expirationTime = expirationTime;
            }
            localStorage.setItem('cdv_fb_session', JSON.stringify(e.authResponse));
            FB.Auth.setAuthResponse(e.authResponse, 'connected');
            if (cb) cb(e);
        }, (fail ? fail : null), 'FacebookConnectPlugin', 'login', params.scope.split(','));
    },
    logout: function (cb, fail) {
        cordova.exec(function (e) {
            localStorage.removeItem('cdv_fb_session');
            FB.Auth.setAuthResponse(null, 'notConnected');
            if (cb) cb(e);
        }, (fail ? fail : null), 'FacebookConnectPlugin', 'logout', []);
    },
    getLoginStatus: function (cb, fail) {
        cordova.exec(function (e) {
            if (cb) cb(e);
        }, (fail ? fail : null), 'FacebookConnectPlugin', 'getLoginStatus', []);
    },
    dialog: function (params, cb, fail) {
        cordova.exec(function (e) { // login
            if (cb) cb(e);
        }, (fail ? fail : null), 'FacebookConnectPlugin', 'showDialog', [params]);
    },

    /***************************************************************/
    // The following adapted by Kerry Knight 2013-10-15 from:
    //
    //  FacebookConnect.js
    //
    // Created by Olivier Louvignes on 2012-06-25.
    //
    // Copyright 2012 Olivier Louvignes. All rights reserved.
    // MIT Licensed
    /***************************************************************/
    /** 
     * Make an asynchrous Facebook Graph API request.
     *
     * @param {String} path Is the path to the Graph API endpoint.
     * @param {Object} [options] Are optional key-value string pairs representing the API call parameters.
     * @param {String} [httpMethod] Is an optional HTTP method that defaults to GET.
     * @param {Function} [callback] Is an optional callback method that receives the results of the API call.
     */
    requestWithGraphPath: function (path, options, httpMethod, callback) {
        var method;

        if (!path) path = "me";
        if (typeof options === 'function') {
            callback = options;
            options = {};
            httpMethod = undefined;
        }
        if (typeof httpMethod === 'function') {
            callback = httpMethod;
            httpMethod = undefined;
        }
        httpMethod = httpMethod || 'GET';

        var _callback = function (result) {
            //console.log('FacebookConnect.requestWithGraphPath: %o', arguments);
            if (typeof callback == 'function') callback.apply(null, arguments);
        };

        cordova.exec(_callback, _callback, service, 'requestWithGraphPath', [{
            path: path,
            options: options,
            httpMethod: httpMethod
        }]);

    }
};