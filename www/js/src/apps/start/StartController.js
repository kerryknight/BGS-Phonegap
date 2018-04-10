// var revMob = null;

BGS.module('StartApp.Start', function (Start, BGS, Backbone, Marionette, $, _) {
    Start.Controller = {

        initialize: function () {
            console.log('start controller init');
            var s = this;
            $('#container').show();

            //check if we're currently logged into parse by seeing if there is a current user; if so, 
            //load the main view and if not, just go to the welcome screen where we can log in/sign up
            Parse.User.current() ? s.loadMainApp() : s.showStartView();

            //only uncomment this for testing within Xcode/simulator as this will get called by deviceready otherwise
            // if (BGS.Utilities.isPhonegap()) {
            //     s.mobileInits();
            // } else {
            //     console.log('is not phonegap');
            // }
        },

        //normally, these could all be placed within a 'deviceready' event; however, this wasn't
        //getting called by phonegap 100% of the time so I'm scrapping that and doing here
        mobileInits: function() {
            console.log('mobileInits called from StartController, meaning deviceready called again');
            var s = this;

            $("#spinner").hide();

            //initialize Facebook sdk
            BGS.FacebookAPI.initializeParseFBUtils();

            // initialize crittercism crash reporter
            if (typeof Crittercism != 'undefined') {
                console.log('crittercism loaded');
                Crittercism.init({
                    appId: '51effed197c8f23f08000003',
                    appVersion: '2.0',
                });
            }

            //init revmob advertising
            var rm = window.plugins.revMob;
            rm.initWithAppId("5063a942d1a7040c00000027");
            //use strings to denote test mode instead of properties
            // rm.setTestingMode(rm.TEST_WITH_ADS);
            // rm.setTestingMode(rm.TEST_WITHOUT_ADS);
            // rm.setTestingMode(rm.TEST_DISABLED);
        },

        offsetStatusBar: function() {
            console.log('offsetStatusBar called');

            function isIOS() {
                return navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
            }

            // window.device is available only if you include the phonegap package
            // http://docs.phonegap.com/en/3.0.0/cordova_device_device.md.html#Device
            // Note for ios, you do not need to add anything to the config.xml, just add the plugin
            if (BGS.Utilities.isPhonegap() && isIOS() && window.device && parseFloat(window.device.version) >= 7.0) {
                console.log('add the ios 7 20px to top');
                $('body').addClass('phonegap-ios-7');
            }
        },

        resetStatusBar: function() {
            //on the login screen, allow silhouette to touch the top of screen, regardless of status bar overlap
             $('body').removeClass('phonegap-ios-7');
        },

        setNavController: function () {
            this.navController = new BackStack.StackNavigator({
                el: '#nav-container'
            });
        },

        showView: function (view, effect, cb) {
            var s = this;
            setTimeout(function () {
                s.navController.pushView(view, {}, effect);
            }, 0); //ignoring initial options ({}) for now
            $.isFunction(cb) && cb();
        },

        //child view loaded at app start if not logged in
        showStartView: function () {
            this.startView().render();
            this.resetStatusBar();
        },

        //child view loaded at app start if not logged in
        showWelcomeView: function () {
            this.setNavController();
            this.showView(this.welcomeView(), this.noEffect());
        },

        showForgotPasswordView: function () {
            this.showView(this.forgotPasswordView());
        },

        showLoginView: function () {
            this.showView(this.loginView());
        },

        showSignupView: function () {
            this.showView(this.signupView());
        },

        loadMainAppWithSuccess: function () {
            BGS.MainApp.Main.Controller.hideSpinner();
            BGS.MainApp.Main.Controller.showMainView(cb = function () {
                //give our notification a delay so our DOM can fully render
                setTimeout(function () {
                    BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Success!", "Successfully logged in.", false, true);
                }, 500);

                return true;
            });
        },

        loadMainApp: function (cb) {
            console.log('load main app called');
            BGS.MainApp.Main.Controller.showMainView();
            $.isFunction(cb) && cb();
        },

        popView: function (transition) {
            this.navController.popView(transition);
            BGS.MainApp.Main.Controller.hideSpinner();
        },

        startView: function () {
            return new BGS.StartApp.Start.StartView({
                el: '#container'
            });
        },
        welcomeView: function () {
            return new BGS.StartApp.Start.WelcomeView();
        },
        loginView: function () {
            return new BGS.StartApp.Start.LoginView();
        },
        signupView: function () {
            return new BGS.StartApp.Start.SignupView();
        },
        forgotPasswordView: function () {
            return new BGS.StartApp.Start.ForgotPasswordView();
        },

        noEffect: function () {
            return new BackStack.NoEffect();
        },
        fadeEffect: function () {
            return new BackStack.FadeEffect();
        },

        regularLogin: function (credentials) {
            BGS.MainApp.Main.Controller.showSpinner();

            var username = credentials.username,
                password = credentials.password;

            //tell our router to log us in 
            this.logIn(username, password);
        },

        skipLogin: function () {
            this.loadMainApp(cb = function () {
                //give our notification a delay so our DOM can fully render
                setTimeout(function () {
                    BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("You're in!", "Just remember, some app features like the networked leaderboard and player statistics will be unavailable without logging in.", false, true);
                }, 500);
            });
        },

        logIn: function (username, password) {
            var s = this;

            //track login with Parse
            Parse.Analytics.track('parseLogin');

            //Parse returns the logIn function as a promise, so just return it here to fulfill our promise
            return Parse.User.logIn(username, password)
                .then(function (user) {
                    if (BGS.Utilities.isUnitTesting === false) return s.loadMainAppWithSuccess();
                }, function (e) {
                    console.log('e at logIn = ' + JSON.stringify(e));
                    Parse.User.logOut(); //log current user out so we don't accidentally show #mainView on a refresh
                    if (BGS.Utilities.isUnitTesting === false) {
                        BGS.MainApp.Main.Controller.hideSpinner();
                        BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Error", e.message, true, true);
                    }

                    var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                    Parse.Analytics.track('error', { code: codeString });
                });
        },

        // Logs out the user and shows the login view
        logOut: function (cb) {
            Parse.User.logOut(); //log out of Parse first; this method does not return anything from Parse SDK so cannot be used in promise chain

            var fbLoggedIn,
                //create a jquery deferred object which we can pass to whoever to fulfill our promise
                dfd = new $.Deferred();
            //check what we're running on so our returned promise will send back the proper logout vars
            if (BGS.Utilities.isMobileDevice() && (typeof (FB) != 'undefined')) {
                fbLoggedIn = true;
                FB.logout(function (response) {
                    fbLoggedIn = false; //for unit testing
                    dfd.resolve(fbLoggedIn); //fulfill our promise
                });
            } else {
                dfd.resolve(fbLoggedIn = null); //fulfill our promise
            }

            if (BGS.Utilities.isUnitTesting === false) {
                BGS.MainApp.Main.Controller.hideSpinner(); //hide any spinner
                //empty the DOM before re-populating
                $('#container').empty();
                this.showStartView();

                //reset any regions we may have created so they'll be created anew when logging back in
                BGS.containerRegion.reset();
            }

            //clear any cached items
            BGS.FoursquareAPI.fsqGetNearbyResults.barCache = null;

            // Return the Promise so caller can't change the Deferred
            return dfd.promise();
        },

        signUp: function (user) {
            var s = this;

            //set some defaults
            user.set('roundsCreated', 0);

            //attempt to sign the user up with Parse system
            return user.signUp()
                .then(function (success) {
                    if (BGS.Utilities.isUnitTesting === false) {
                        s.loadMainApp();
                        BGS.MainApp.Main.Controller.hideSpinner();
                        BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Success!", "Successfully signed up and logged in.", false, true);
                    }

                    return success;
                }, function (e) {
                    console.log('e = ' + e.message);
                    if (BGS.Utilities.isUnitTesting === false) {
                        BGS.MainApp.Main.Controller.hideSpinner();
                        BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops! Something happened", "Error message: " + e.message, isError = true, showAtBottom = true);
                    }

                    var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                    Parse.Analytics.track('error', { code: codeString });

                    return e;
                });
        },

        sendPasswordResetLink: function (email) {
            BGS.MainApp.Main.Controller.showSpinner('Sending reset link...');
            this.resetPasswordForEmail(email); //a utils.js function
        },

        resetPasswordForEmail: function (email, cb) {
            var s = this,
                emailToSendTo = email;
            console.log('email to send to = ' + emailToSendTo);
            //get our email from the email field and send our reset link

            Parse.User.requestPasswordReset(emailToSendTo, {
                success: function () {
                    $.isFunction(cb) && cb('success'); //only used for unit testing
                    console.log('password reset sent successfully');
                    // Password reset request was sent successfully
                    //success, take us back to login view
                    if (BGS.Utilities.isUnitTesting === false) {
                        s.popView();
                        BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Email sent!", "A password reset link as been sent to " + emailToSendTo + ".", isError = false, showAtBottom = true);
                    }
                },
                error: function (e) {
                    $.isFunction(cb) && cb('e'); //only used for unit testing
                    console.log(e);
                    console.log('password reset failed with error: ' + e.message);
                    console.log(e.message);
                    if (BGS.Utilities.isUnitTesting === false) {
                        BGS.MainApp.Main.Controller.hideSpinner();
                        // Show the e message somewhere
                        BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops! Something happened", "Error message: " + e.message, isError = true, showAtBottom = true);
                    }

                    var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                    Parse.Analytics.track('error', { code: codeString });
                }
            });
        }        
    };
});

$(document).on('permissions_revoked', function () {
    // Reset cached views
    console.log('fb permissions revoked');
    return false;
});