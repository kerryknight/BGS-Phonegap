// facebook.js
BGS.module('FacebookAPI', function (FacebookAPI, BGS, Backbone, Marionette, $, _) {
    //************ Facebook Functions ********************************************************************************
    //****************************************************************************************************************
    this.initializeParseFBUtils = function (cb) {
        console.log('FacebookAPI initializeParseFBUtils:');
        this.fbIsInitialized = false;
        var api = BGS.FacebookAPI;

        if (typeof FB !== 'undefined' && BGS.FacebookAPI.fbIsInitialized !== true) {
            try {
                Parse.FacebookUtils.init({
                    appId: "109998089149025",
                    nativeInterface: CDV.FB,
                    status     : true, // check login status
                    cookie     : true, // enable cookies to allow Parse to access the session
                    xfbml      : true,  // parse XFBML
                    useCachedDialogs: false
                });

                api.fbIsInitialized = true;
                this.authUser();

                $('#qunit').trigger('facebookInit'); //used for unit testing facebook

                // $.isFunction(cb) && cb();
            } catch (e) {
                api.fbIsInitialized = false;
                console.log("The Facebook JavaScript SDK must be loaded & not initialized before calling Parse.FacebookUtils.init.");
                console.log('catch error: ' + e);
            }
        } else {
            console.log('FB did not load properly');
            console.log("The Facebook JavaScript SDK must be loaded & not initialized before calling Parse.FacebookUtils.init.");
            api.fbIsInitialized = false;
        }
    };

    this.facebookLogin = function () {
        console.log('FacebookAPI facebookLogin:');
        if (typeof (FB) === 'undefined' || BGS.FacebookAPI.fbIsInitialized === false) {
            //check to see if the FB phonegap plugin initialized
            BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Facebook Error", "Shoot, we're sorry. Something happened trying to contact Facebook. Try completely closing Bar Golf Stars and reopening.", true, true);
            BGS.FacebookAPI.fbIsInitialized = false;
        } else {
            this.attemptFBLogin();
        }
    };

    // this.fbUser = [];

    // this.fbPermissions = ['publish_actions', 'user_status'];

    //Detect when Facebook tells us that the user's session has been returned
    this.authUser = function () {
        console.log('FacebookAPI: authUser');
        FB.Event.subscribe('auth.statusChange', this.handleStatusChange);
    };

    // Handle status changes
    this.handleStatusChange = function (session) {
        console.log('FacebookAPI: handleStatusChange');
        // console.log('Got the user\'s session: ' + JSON.stringify(session));
        // var s = this;
        if (session.authResponse) {
            //document.body.className = 'connected';

            //Fetch user's id, name, and picture
            FB.api('/me', {
                fields: 'id, name, picture, email'
            }, function (response) {
                if (!response.e) {
                    // document.body.className = 'connected';
                    console.log('handleStatusChange Got the user\'s name, picture and email: ' + JSON.stringify(response));
                } else {
                    // document.body.className = 'not_connected';
                    console.log('Error getting user info: ' + JSON.stringify(response.e));
                    // Check for es due to app being unininstalled
                    if (response.e.e_subcode && response.e.e_subcode == "458") {
                        setTimeout(function () {
                            console.log("The app was removed. Please log in again.");
                        }, 0);
                    }
                    BGS.StartApp.Start.Controller.logOut();
                }

            });
        } else {
            // document.body.className = 'not_connected';
            console.log('User has not connected to BGS via Facebook');
        }
    };

    //Check the current permissions to set the page elements.
    //Pass back a flag to check for a specific permission, to
    //handle the cancel detection flow.
    this.checkFBUserPermissions = function (permissionToCheck) {
        console.log('FacebookAPI: checkFBUserPermissions');
        var permissionsFQLQuery = 'SELECT ' + fbPermissions.join() + ' FROM permissions WHERE uid = me()';

        FB.api('/fql', {
            q: permissionsFQLQuery
        }, function (response) {

            if (permissionToCheck) {
                console.log('checkUserPermissions permissiontocheck');
                if (response.data[0][permissionToCheck] == 1) {
                    console.log("The '" + permissionToCheck + "' permission has been granted.", false);
                    return true;
                } else {
                    console.log('You need to grant the ' + permissionToCheck + ' permission before using this functionality.', false);
                }
                return false;
            }

            return true;
        });
    };

    //Prompt the user to login and ask for the 'email' permission
    this.attemptFBLogin = function () {
        console.log('FacebookAPI: attemptFBLogin');
        var s = this;

        // s.useParseFBLogin();
        // // console.log('FB at attemptFBLogin = ' + JSON.stringify(FB));

        FB.login(function (session) {
            console.log('FB.login returned response: ' + JSON.stringify(session));
            s.fbLogIntoParse(session);
        }, {
            scope: 'read_stream'
        }); //'publish_actions, email, read_stream'
        //publish_actions if don't use the Feed Dialog to post to timeline; this one also kicks in the OAuth view instead of
        //just the native alert box popping up and looks a bit more official 
        //eventually use create_event too to schedule bar golf rounds
    };

    this.useParseFBLogin = function() {

        BGS.MainApp.Main.Controller.showSpinner('Logging in...');

        Parse.FacebookUtils.logIn('publish_actions, email, read_stream', {
          // Parse.FacebookUtils.logIn(facebookAuthData, {
            success: function (user) {
                // If it's a new user, let's fetch their name from FB
                if (!user.existed()) {
                    // We make a graph request
                    FB.api('/me', {
                        fields: 'id, name, picture, email'
                    }, function (response) {
                        if (!response.e) {
                            console.log('Parse facebook utils FB.api !response.e');
                            // We save the data on the Parse user
                            user.set("displayName", response.name);
                            user.set("email", response.email);
                            user.set("profilePicture", response.picture.data.url);
                            user.set('roundsCreated', 0); //defaults

                            user.save(null, {
                                success: function (user) {
                                    console.log('user.save into parse; fb log in success');
                                    //user successfully updated to Parse
                                    BGS.StartApp.Start.Controller.loadMainAppWithSuccess();

                                    //track the FB login analytics
                                    Parse.Analytics.track('fbLogin');
                                },
                                error: function (user, e) {
                                    console.log('e saving user into parse for fb: ' + JSON.stringify(e));
                                    console.log(e);
                                    BGS.MainApp.Main.Controller.hideSpinner();
                                    BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Facebook sign up error:", e.message, true, true);
                                    user.destroy(); //delete user and start over
                                    BGS.StartApp.Start.Controller.logOut();
                                }
                            });
                        } else {
                            console.log('Parse facebook utils FB.api response.e: ' + JSON.stringify(response.e));
                            console.log("Oops something went wrong with facebook.");
                            BGS.MainApp.Main.Controller.hideSpinner();
                            BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Error", e.message, true, true);
                            user.destroy(); //delete user and start over
                            BGS.StartApp.Start.Controller.logOut();

                            var codeString = typeof (response.e.code) !== 'undefined' ? '' + response.e.code : '' + JSON.stringify(response.e);
                            Parse.Analytics.track('Parse FB Utils error', {
                                code: codeString
                            });
                        }
                    });
                } else {
                    console.log("User logged in through Facebook!");
                    BGS.StartApp.Start.Controller.loadMainAppWithSuccess();
                }
            },

            error: function (e1, e2) {
                s.uninstallFBApp();
                BGS.StartApp.Start.Controller.logOut();
                console.log("Unable to create/log in as Facebook user");
                console.log("  ERROR1 = " + JSON.stringify(e1));
                console.log("  ERROR2 = " + JSON.stringify(e2));
                BGS.MainApp.Main.Controller.hideSpinner();
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops. Something happened.", 'There was an error logging you in with Facebook. Please try your request again.', true, true);

                var codeString = typeof (e1.code) !== 'undefined' ? '' + e1.code : '' + JSON.stringify(e1);
                Parse.Analytics.track('error', {
                    code: codeString
                });

                var codeString2 = typeof (e2.code) !== 'undefined' ? '' + e2.code : '' + JSON.stringify(e2);
                Parse.Analytics.track('error', {
                    code: codeString2
                });
            }
        });
    };

    this.fbLogIntoParse = function (session) {
        console.log('FacebookAPI: fbLogIntoParse with session: ' + JSON.stringify(session));
        // var date = new Date(session.authResponse.expirationTime);
        BGS.MainApp.Main.Controller.showSpinner('Logging in...');
        //had trouble converting to correct date format from expirationTime passed in from FB;
        //so, since it has a timeout of 60 days, i'll just tack 2 months onto the current day
        var myExpDate = new Date();
        myExpDate.setMonth(myExpDate.getMonth() + 2);
        myExpDate = myExpDate.toISOString();

        var facebookAuthData = {
            "id": session.authResponse.userID + "",
            "access_token": session.authResponse.accessToken,
            "expiration_date": myExpDate
        },
            s = this;

        // console.log('attempt parse fb utils login with authdata = ' + JSON.stringify(facebookAuthData));
        Parse.FacebookUtils.logIn(facebookAuthData, {
            success: function (user) {
                // If it's a new user, let's fetch their name from FB
                if (!user.existed()) {
                    // We make a graph request
                    FB.api('/me', {
                        fields: 'id, name, picture, email'
                    }, function (response) {
                        if (!response.e) {
                            console.log('Parse facebook utils FB.api !response.e');
                            // We save the data on the Parse user
                            user.set("displayName", response.name);
                            user.set("email", response.email);
                            user.set("profilePicture", response.picture.data.url);
                            user.set('roundsCreated', 0); //defaults

                            user.save(null, {
                                success: function (user) {
                                    console.log('user.save into parse; fb log in success');
                                    //user successfully updated to Parse
                                    BGS.StartApp.Start.Controller.loadMainAppWithSuccess();

                                    //track the FB login analytics
                                    Parse.Analytics.track('fbLogin');
                                },
                                error: function (user, e) {
                                    console.log('e saving user into parse for fb: ' + JSON.stringify(e));
                                    console.log(e);
                                    BGS.MainApp.Main.Controller.hideSpinner();
                                    BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Facebook sign up error:", e.message, true, true);
                                    user.destroy(); //delete user and start over
                                    BGS.StartApp.Start.Controller.logOut();
                                }
                            });
                        } else {
                            console.log('Parse facebook utils FB.api response.e: ' + JSON.stringify(response.e));
                            console.log("Oops something went wrong with facebook.");
                            BGS.MainApp.Main.Controller.hideSpinner();
                            BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Error", e.message, true, true);
                            user.destroy(); //delete user and start over
                            BGS.StartApp.Start.Controller.logOut();

                            var codeString = typeof (response.e.code) !== 'undefined' ? '' + response.e.code : '' + JSON.stringify(response.e);
                            Parse.Analytics.track('Parse FB Utils error', {
                                code: codeString
                            });
                        }
                    });
                } else {
                    console.log("User logged in through Facebook!");
                    BGS.StartApp.Start.Controller.loadMainAppWithSuccess();
                }
            },

            error: function (e1, e2) {
                s.uninstallFBApp();
                BGS.StartApp.Start.Controller.logOut();
                console.log("Unable to create/log in as Facebook user");
                console.log("  ERROR1 = " + JSON.stringify(e1));
                console.log("  ERROR2 = " + JSON.stringify(e2));
                BGS.MainApp.Main.Controller.hideSpinner();
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops. Something happened.", 'There was an error logging you in with Facebook. Please try your request again.', true, true);

                var codeString = typeof (e1.code) !== 'undefined' ? '' + e1.code : '' + JSON.stringify(e1);
                Parse.Analytics.track('error', {
                    code: codeString
                });

                var codeString2 = typeof (e2.code) !== 'undefined' ? '' + e2.code : '' + JSON.stringify(e2);
                Parse.Analytics.track('error', {
                    code: codeString2
                });
            }
        });
    };

    // //This will prompt the user to grant you acess to a given permission
    // //usage example:
    // //<div class="button button-requires-connect" onclick="promptPermission('user_status')" />Grant check-in permission</div>
    // this.promptFBPermission = function (permission) {
    //     console.log('FacebookAPI: promptFBPermission');
    //     var s = this;
    //     FB.login(function (response) {
    //         if (response.authResponse) {
    //             s.checkFBUserPermissions(permission)
    //         }
    //     }, {
    //         scope: permission
    //     });
    // };

    //See https://developers.facebook.com/docs/reference/api/user/#permissions
    this.uninstallFBApp = function () {
        console.log('FacebookAPI uninstallFBApp:');
        var s = this;
        FB.api('/me/permissions', 'DELETE', function (response) {
            //window.location.reload();
            // For may instead call logout to clear
            // cache data, ex: using in a PhoneGap app
            console.log('FB APP Uninstalled');
            s.logOut();
        });
    };
});