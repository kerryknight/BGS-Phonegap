BGS.module('Utilities', function (Utilities, BGS, Backbone, Marionette, $, _) {
    this.initialize = function () {
        console.log('utils.js: initialize -- **************** REMEMBER TO USE CORRECT Cordova*.js FILE ********************');

        //DATA STUFF
        console.log('utils.js - can remove the this.Views object once all moved to marionette apps');
        this.Views = {};
        this.templateLoader = new this.TemplateLoader();
        // this.pubsub = _.extend({}, Backbone.Events);//create our publish/subscribe object 

        //FOURSQUARE STUFF
        this.fsqIsInitialized = false;

        //PARSE STUFF
        var applicationID = "PG4Fpi5KFo5RBN3RM0vK5bY19hqjXOYgATlwTdYo",
            javascriptKey = "oM6sHrsY67LsfQAhXNDTG9SbWz9qKJZeh8LTGFXc";
        Parse.initialize(applicationID, javascriptKey);

        //UNIT TESTING STUFF
        this.rootTemplateAddress = 'templates/'; //used for unit testing; reset by test/index.html script
        this.templateCount = 0; //used for unit testing
        this.isUnitTesting = false;

        this.svEnabled = true;
    };

    //************ UI Functions **************************************************************************************
    //****************************************************************************************************************

    this.TemplateLoader = function () {

        this.templates = {};

        this.load = function (names, cb) {
            BGS.Utilities.templateCount = names.length; //set equal to our passed in template names array so we can unit test
            var that = this,

                loadTemplate = function (index) {
                    var name = names[index];
                    $.get(BGS.Utilities.rootTemplateAddress + name + '.html', function (data) {
                        that.templates[name] = data;
                        index++;
                        if (index < names.length) {
                            loadTemplate(index);
                        } else {
                            cb();
                        }
                    }, 'text');
                };

            loadTemplate(0);
        };

        // Get template by name from hash of preloaded templates
        this.get = function (name) {
            return this.templates[name];
        };
    };

    //************ Parse Functions ***********************************************************************************
    //****************************************************************************************************************

    this.deleteUserAccountAndDataFromParse = function (user) {
        var currentUser = Parse.User.current() || user; //user used for unit testing since there's no login
        var s = this;

        var dfd = new $.Deferred();

        if (!currentUser) {
            dfd.reject();
            return dfd;
        } else {
            if (s.isUnitTesting === false) BGS.MainApp.Main.Controller.showSpinner();

            if (typeof (FB) != 'undefined') {
                BGS.StartApp.Start.Controller.uninstallFBApp();//for good measure, even if we aren't signed in with FB
            }

            //pass our delete payload params to our Parse cloud code function; it'll take care of the rest
            Parse.Cloud.run('deleteUserAccountAndData', {
                'user': 'dummy' //dummy params; these aren't supposed to be needed but i wasn't getting cbs from Parse without
            }, {
                success: function (result) {
                    BGS.StartApp.Start.Controller.logOut();

                    if (s.isUnitTesting === false) BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Account deleted.", "Your account and all associated data have been successfully removed from Parse. We hope you come back!", isError = false, showAtBottom = true);

                    dfd.resolve(result);

                    //track account deletion with Parse
                    Parse.Analytics.track('userAccountAndDataDeletion');
                },
                error: function (e) {
                    console.log('Utilities.deleteUserAccountAndDataFromParse cloud code called back error ' + JSON.stringify(e));
                    if (s.isUnitTesting === false) BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Error", "Delete account failed with error: " + JSON.stringify(e), isError = true, showAtBottom = true);
                    BGS.StartApp.Start.Controller.logOut();
                    dfd.reject(e);
                }
            });
        }

        return dfd;
    };

    //retrieve our api key and secret which we store on Parse for security purposes
    this.retrieveAPIInfoFromParse = function (api, success) {
        // console.log('retrieve API info called');
        var s = this,
            API = Parse.Object.extend("API"),
            query = new Parse.Query(API); //query the API table in Parse
        query.equalTo("apiName", api); //where 'apiName' == 'foursquare' //could add more later
        query.find({
            success: function (results) {
                // console.log('success retrieving api info');
                var object = results[0], //should only be 1 object returned here
                    apiObject = object.attributes; //set our global foursquare object to the returned results object
                //create our global rest services object and initialize the proper instance of rest services
                // api == "foursquare" ? BGS.FoursquareAPIRestServices.initialize(apiObject) : /* some other API here */ '';

                $.isFunction(success) && success(apiObject); //success query cb
            },
            error: function (e) {
                console.log('failure retrieving ' + api + ' api info from parse');
                console.log(e);
                if (s.isUnitTesting === false) {
                    BGS.MainApp.Main.Controller.hideSpinner();
                    BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops! Something happened", "Error message: " + e.message, isError = true, showAtBottom = true);
                }
            }
        });
    };

    //************ Helper Functions **********************************************************************************
    //****************************************************************************************************************
    this.isPhonegap = function() {
        return typeof Cordova != 'undefined' || typeof cordova != 'undefined' || typeof Phonegap != 'undefined' || typeof PhoneGap != 'undefined' || typeof phonegap != 'undefined';
    },

    //used for determining if app running on desktop browser or mobile device
    this.isMobileDevice = function () {
        // are we running in native app or in browser?
        var isMobile = false;
        if (document.URL.indexOf("http://") == -1) { //desktop browser == 0
            isMobile = true;
        }
        return isMobile;

        // Android: function() {
        //     return navigator.userAgent.match(/Android/i) ? true : false;
        // },
        // BlackBerry: function() {
        //     return navigator.userAgent.match(/BlackBerry/i) ? true : false;
        // },
        // iOS: function() {
        //     return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
        // },
        // Windows: function() {
        //     return navigator.userAgent.match(/IEMobile/i) ? true : false;
        // },
        // any: function() {
        //     return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
        // }
    };

    //uses the built-in html5 navigator.geolocation to get the user's location
    //@location {string} optional; if a location is passed in, we pass it right back and don't process anymore of the function;
    //this will normally occur from tests.js when we want to test Foursquare/Google services are working throughout the world 
    this.getCurrentLocation = function (location) {
        console.log('this.js: getCurrentLocation');

        var dfd = new $.Deferred(),
            s = this;

        //check if we passed in a location; if we did, it probably means we're just testing Fourquare/Google services
        //to ensure they are working properly all over the world so just return the location right back to our caller
        if (location !== null && location !== undefined) {
            // console.log('utilities location = ' + JSON.stringify(location));
            dfd.resolve(location);
            return dfd.promise(); //return our promise so caller can modify it
        } else {
            // console.log('utilities no location passed in');
        }

        if (navigator.geolocation) {
            if (!s.getCurrentLocation.attempts) s.getCurrentLocation.attempts = 1; //cache our attempts at finding the user's location

            // console.log('get current location attempts = ' + s.getCurrentLocation.attempts);

            var maxAttempts = 3, //we'll try up to 3 times, i.e. for up to 30 seconds

                timeout = setTimeout(function () {
                    console.log('getting user location timed out');
                    if (s.getCurrentLocation.attempts < maxAttempts) {
                        console.log('try finding user location again after failed attempt');
                        s.getCurrentLocation.attempts++;
                        s.getCurrentLocation(); //try again recursively
                    } else {
                        console.log('we have tried too many times to find location so reject our promise');
                        //fail, we've tried too many times
                        s.getCurrentLocation.attempts = null; //clear the attempts cache property
                        dfd.reject('Trying to find your location is taking too long. Do you have an internet connection?');
                    }
                }, 10000);

            navigator.geolocation.getCurrentPosition(function (position) {
                // console.log('data returned = ' + JSON.stringify(position));
                clearTimeout(timeout);
                var location = {},
                    lat = position.coords.latitude,
                    lng = position.coords.longitude;

                location.lat = lat;
                location.lng = lng;

                s.getCurrentLocation.attempts = null; //clear the attempts cache property
                //resolve our promise and pass back our location to whatever method requires it
                dfd.resolve(location);
            }, function (e) {
                console.log('failed returning user location with error: ' + JSON.stringify(e));
                s.getCurrentLocation.attempts = null; //clear the attempts cache property
                clearTimeout(timeout);
                dfd.reject("Finding your current location failed.  Ensure location services are enabled on your device and try again.");
            }, {
                maximumAge: 60000,
                timeout: 12000,
                enableHighAccuracy: true
            });
        } else {
            console.log('geolocation unavailable and failed');
            // Fallback for no geolocation
            dfd.reject("We can't find your location.  Do you have an internet connection and location services enabled?");
            BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Location Services Required", "Please enable location finding services to access this feature of Bar Golf Stars.", isError = true, showAtBottom = true);
        }

        return dfd.promise(); //return our promise so caller can modify it
    };

    //usage: convertMeters(3).to("miles")
    this.convertMeters = function (numberOfMeters) {
        var meters = numberOfMeters, //our base unit will be meters, i.e. 1 meter
            kilometerUnit = 0.001, //number of kilometers in a meter
            mileUnit = 0.000621371; //number of miles in a meter

        return {
            to: function (toUnit) {

                if (toUnit == 'kilometers') {
                    return fix(meters * kilometerUnit);
                } else {
                    return fix(meters * mileUnit);
                }

                function fix(num) {
                    return parseFloat(num.toFixed(2));
                }
            }
        };
    };

    this.initialize();
});