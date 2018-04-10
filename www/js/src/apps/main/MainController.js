BGS.module('MainApp.Main', function (Main, BGS, Backbone, Marionette, $, _) {
    BGS.addRegions({
        containerRegion: "#nav-container"
    });
    Main.Controller = {

        initialize: function () {
            //UI STUFF
            this.spinner = $("#spinner");
            this.spinner.hide(); //hidden initially
            this.navController = null; //init as empty
            // this.scrollView = null; //init as empty
        },

        //the nav controller isn't really being used at all yet, it's kinda just a container for loading apps right now
        setNavController: function () {
            $('#nav-container').html('');
            this.navController = new BackStack.StackNavigator({
                el: '#nav-container'
            });
        },

        clearNavController: function() {
            var s = this;
             //hide any translucent objects initially; each individual view will know better what to show
            // s.hideBlurryObjects();

            if (s.navController !== null && typeof(s.navController) !== 'undefined' && s.navController.viewsStack.length > 0) s.popView(s.noEffect());
        },

        showView: function (view, effect, cb) {
            var s = this;
            
            setTimeout(function () {
                s.navController.pushView(view, {}, effect);
            }, 0); //ignoring initial options ({}) for now
            $.isFunction(cb) && cb();
        },

        //child view loaded at app start if not logged in
        loadChildViews: function () {
            var s = this;
            // s.hideBlurryObjects();
            //bind the other views to the DOM
            s.headerView = new BGS.MainApp.Main.HeaderView();
            s.placesBarView = new BGS.MainApp.Main.PlacesBarView();
            s.addressBarView = new BGS.MainApp.Main.AddressBarView();
            s.addressBarView.render();
            s.leftPanelView = new BGS.MainApp.Main.LeftPanelView();
            s.leftPanelView.render();
        },

        loadUsername: function () {
            this.usernameView = new BGS.MainApp.Main.UsernameView();
            this.usernameView.render();
        },

        showMainView: function (cb) {
            var s = this;
            s.mainView().render();

            s.loadScorecardApp(function(cb) {
                $.isFunction(cb) && cb();
            });
        },

        popView: function (transition, shouldHideSpinner) {
            this.navController.popView(transition);
            ///sometimes i want to keep the spinner going, like when i'm creating a new round
            if(shouldHideSpinner) BGS.MainApp.Main.Controller.hideSpinner();
        },

        mainView: function () {
            return new BGS.MainApp.Main.MainView({
                el: '#container'
            });
        },

        helpView: function () {
            return new BGS.MainApp.Main.HelpView();
        },

        showHelpView: function (viewToShow) {
            //viewToShow should be a the name of the template to load, e.g. 'handicap', 'rule-value', etc.
            $.modal('', {
                appendTo: '#help-view',
                closeClass: "modalClose",
                closeHTML: '<a class="topcoat-button simplemodal-dismiss-button rs-button anton-font drk-purple white-font">Done</a>',
                containerCss: {
                    opacity: 80,
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                    borderColor: "#fff",
                    height: "90%",
                    padding: "0px",
                    width: "90%",
                    webkitBoxShadow: "0px 0px 12px rgba(50, 50, 50, 1)",
                    mozBoxShadow: "0px 0px 12px rgba(50, 50, 50, 1)",
                    boxShadow: "0px 0px 12px rgba(50, 50, 50, 1)"
                },
                overlayClose: true,
                onOpen: function (dialog) {
                    dialog.overlay.fadeIn('fast', function () {
                        setTimeout(function(){BGS.MainApp.Main.Controller.showSpinner();},0);

                        dialog.data.hide();
                        dialog.container.fadeIn('fast', function () {
                            var cHeight = parseInt($('.simplemodal-container').css('height'), 10), //strip out 'px' from css property
                                bHeight = parseInt($('.simplemodal-dismiss-button').css('height'), 10); //strip out 'px' from css property
                            
                            var renderHelpView = new BGS.MainApp.Main.HelpView({'templateView': viewToShow}).render();

                            dialog.data.fadeIn('fast', function () {
                                //all data has loaded now
                                BGS.MainApp.Main.Controller.hideSpinner();
                            });
                        });
                    });
                },
                onClose: function (dialog) {
                    dialog.data.fadeOut('fast', function () {
                        dialog.container.fadeOut('fast', function () {
                            dialog.overlay.fadeOut('fast', function () {
                                $.modal.close(); // must call this!
                            });
                        });
                    });
                }
            });
        },

        //these will go away as I add them all as app modules
        activityView: function (options) {
            return new BGS.Utilities.Views.ActivityView(options);
        },
        leaderboardView: function (options) {
            return new BGS.Utilities.Views.LeaderboardView(options);
        },
        playerView: function (options) {
            return new BGS.Utilities.Views.PlayerView();
        },



        noEffect: function () {
            return new BackStack.NoEffect();
        },
        fadeEffect: function () {
            return new BackStack.FadeEffect();
        },

        checkForActiveScorecardAndActiveRound: function() {
            // console.log('mainController checkForActiveScorecardAndActiveRound');
            var dfd = $.Deferred(),
                p = dfd.promise();
                s = this,
                o = {};//o will be our options we pass into the ScorecardController for scorecard conditional setup

            //hide the left menu modify current round option initially, we'll only unhide if use created the round
            s.leftPanelView.hideCurrentRoundOptions();

            this.queryForActiveScorecard()
            .then(function(results) {
                if(results.length > 0) {
                    // console.log('user has active scorecard');
                    BGS.RSApp.RoundSetup.Controller.scorecard = results[0]; //get first scorecard returned (should only be 1)
                    o.scorecardIsActive = true;
                    //now q for the round that's listed in the active scorecard's round column
                    return s.queryForParentRoundOfActiveScorecard(BGS.RSApp.RoundSetup.Controller.scorecard);
                } else {
                    // console.log('user does not have active scorecard');
                    o.scorecardIsActive = false;
                    //there is no active scorecard for the current user so show warning message instead of loading players/holes/etc
                    return dfd.reject(o);
                }
            })
            .then(function(results) {
                o.userCreatedRound = false;

                if(typeof(results) != 'undefined' && results.length > 0) {
                    //now that we've returned the round q, we need to check if the current user created the round
                    //if so, we need to enable them to modify the round, otherwise hide those options
                    var a = BGS.RSApp.RoundSetup.Controller.round = results[0]; //get first round returned (should only be 1)

                    if (a.get('user').id == Parse.User.current().id) {
                        // console.log('user created this round');
                        o.userCreatedRound = true;
                        //this current user created this round
                        s.leftPanelView.showCurrentRoundOptions();
                        dfd.resolve(o);
                    } else {
                        // console.log('user did not create this round');
                        //user is just a participant in this round so dont' show additional options to modify
                        dfd.reject(o);
                    }

                } else {
                    // console.log('could not retrieve round for current scorecard');
                    //there is no active scorecard for the current user so show warning message instead of loading players/holes/etc
                    return dfd.reject(o);
                }
            });

            return p;
        },

        queryForActiveScorecard: function() {
            // console.log('MainController queryForActiveScorecard');
            var p = new Parse.Promise(),
                q = new Parse.Query('Scorecard'),
                u = Parse.User.current();

                q.equalTo("user", u);
                q.equalTo("isActive", true);
                        
                q.find()
                .then(function(results) {
                    p.resolve(results);
                },
                function(e) {
                    p.reject(e);
                });

            return p;
        },

        queryForParentRoundOfActiveScorecard: function(scorecard) {
            // console.log('MainController queryForParentRoundOfActiveScorecard');
            var p = new Parse.Promise(),
                q = new Parse.Query("Round");

                q.equalTo("objectId", scorecard.get('round').id); //scorecard's round must match round.id for it to have been created by current user
                q.equalTo("isActive", true);
                        
                q.find()
                .then(function(results) {
                    p.resolve(results);
                },
                function(e) {
                    p.reject(e);
                });

            return p;
        },

        //Different Menu Sections
        loadPlacesApp: function (placeType) {
            // console.log('MainController loadPlacesApp: for placeType: ' + placeType);
            //check if we have anything to pop off first
            this.clearNavController();

            var options = {
                "type": placeType,
                shouldModifySingleHole: false,//we are not modifying, we're using bar finder
            };

            BGS.PlacesApp.Places.Controller.initialize(options);
        },

        loadScorecardApp: function (cb) {
            var s = this;
            //check if we have anything to pop off first
            this.clearNavController();

            //once we've rendered initially, check for an active scorecard and active round
            var getScorecard = s.checkForActiveScorecardAndActiveRound();

            $.when(getScorecard).done(function(opts){
                // console.log('getScorecard done: ' + JSON.stringify(opts));
                $.isFunction(cb) && cb();
                s.activeRoundOpts = opts;
                //then load the scorecard section on login
                BGS.ScorecardApp.Scorecard.Controller.initialize(s.activeRoundOpts);
            });

            $.when(getScorecard).fail(function(opts){
                console.log('getScorecard fail: ' + JSON.stringify(opts));
                $.isFunction(cb) && cb();
                s.activeRoundOpts = opts;
                BGS.ScorecardApp.Scorecard.Controller.initialize(s.activeRoundOpts);
            });

            //track with Parse
            Parse.Analytics.track('loadScorecardApp');
        },

        loadRSApp: function (shouldCreateNewRound) {
            //check if we have anything to pop off first
            this.clearNavController();
            BGS.RSApp.RoundSetup.Controller.initialize(shouldCreateNewRound);

            //track with Parse
            Parse.Analytics.track('loadRSApp');
        },

        makeRequest: function(request, options) {
            var s = this,
                p = new Parse.Promise();
                
            BGS.request(request, options)
            .then(function(results) {
                // if (results.length > 0) {
                    p.resolve(results);
                // } else {
                //     p.resolve('No results available for request: ' + request);
                // }
            }, function(e) {
                p.reject('No results available for request: ' + request);
            });    

            return p;
        },

        createSlidingView: function () {
            if(BGS.Utilities.isUnitTesting === false) {
                var s = this;
                //Setup the sliding panel using slidingview.js
                this.slidingPanel = new SlidingView('sliding-sidebar', 'sliding-body');
                $('.show-sidebar').on('click', function () {
                    s.dismissAnyNotification(); //make sure we dismiss any of the bottom bar notifications before open/close
                    //open or close our panel based on it's body offset position
                    s.slidingPanel.bodyOffset == s.slidingPanel.sidebarWidth ? s.slidingPanel.close() : s.slidingPanel.open();
                });

                //bind to open close event so we can disable main view items anytime the panel is open
                this.slidingPanel.sidebar.on('panelOpen', function() {
                    s.disableTouchInteraction();
                });

                this.slidingPanel.sidebar.on('panelClose', function() {
                    s.enableTouchInteraction();
                });
            }
        },

        closeSlidingView: function (cb) {
            if(BGS.Utilities.isUnitTesting === false) {
                this.slidingPanel.close(function () {
                    $.isFunction(cb) && cb();
                });
            }  
        },

        disableTouchInteraction: function() {
            //disable items in main view while sliding menu is open
            IScroll.prototype.disable();

            //I couldn't figure out a way to disable the below views from an all-encompassing position
            //so i'm having to do it manually here; this is opposed to setting a global flag and checking 
            //manually for the flag in each of the views themselves or I could probably re-architect these
            //views to extend from a 3rd party module (instead of their respective app modules) so that I 
            //can create a parent view or prototype which contains the enable/disable functionality; that's 
            //more work that I choose to do right now though
            this.placesBarView.undelegateEvents();//the find bar/taxis tabbar
            BGS.PlacesApp.Places.Controller.disableEvents();
            BGS.RSApp.RoundSetup.Controller.disableEvents();
        },

        enableTouchInteraction: function() {
            //enable items in main view
            IScroll.prototype.enable();//the find bar/taxis tabbar
            
            this.placesBarView.delegateEvents();
            BGS.PlacesApp.Places.Controller.enableEvents();
            BGS.RSApp.RoundSetup.Controller.enableEvents();  
        },

        calculateNavControllerHeight: function (cb) {
            if(BGS.Utilities.isUnitTesting === false) {
                //set the nav controller's height dynamically based on the window height minus the header/footer height
                var bodyHeight = parseInt($('body').css('height'), 10), //strip out 'px' from css property
                    headerHeight = parseInt($('.header').css('height'), 10), //strip out 'px' from css property
                    placesBarHeight = parseInt($('.places-bar').css('height'), 10), //strip out 'px' from css property
                    navControllerHeight = bodyHeight - (headerHeight + placesBarHeight);
                $('#nav-container').css({
                    'height': navControllerHeight,
                    'margin-top': placesBarHeight,
                    'padding-top': 1//this is a workaround to fix sporadic overlaps at top in scorecard view
                }); //account for service bar height since it's not a stationary header bar

                $.isFunction(cb) && cb(navControllerHeight); //only used in unit testing

                bodyHeight, headerHeight, placesBarHeight, navControllerHeight = null; //memory management
            }
        },

        dismissAnyNotification: function () {
            if(BGS.Utilities.isUnitTesting === false) $('#freeow').empty();
        },

        showNotificationWithDismissDelay: function (title, msg, isError, showAtBottom) {
            if(BGS.Utilities.isUnitTesting === false) {
                var options = {};
                options.classes = [$("#freeow-style").val()];

                //check if it's an error notification
                if (isError) {
                    options.classes.push("freeow-error");
                } else {
                    options.classes.push("freeow-success");
                }

                //check for banner positioning
                if (showAtBottom) {
                    // console.log('show at bottom');
                    $('#freeow').addClass("freeow-bottom-center");
                } else {
                    // console.log('show at nav bar');
                    $('#freeow').addClass("freeow-navbar-center"); //not currently used without a bottom tab bar
                }

                $("#freeow").freeow(title, msg, options);
            }
        },

        showSpinner: function (message) {
            // console.log('show spinner ' + message);
            if(BGS.Utilities.isUnitTesting === false) {
                //add shadow box 
                $('.spinnerMask').css({
                    'visibility': 'visible'
                }).fadeTo(100, 0.45);

                //set our message first
                var $text = $('.spinner-text span');
                !message || message === '' ? $text.html(this.randomLoadingMessage()) : $text.html(message);
                this.spinner.show();
            }
        },

        hideSpinner: function (message) {
            // console.log('hide spinner ' + message)
            if(BGS.Utilities.isUnitTesting === false) {
                //remove shadow box 
                $('.spinnerMask').css({
                    'visibility': 'hidden'
                }).fadeTo(100, 0.0);
                $('.spinner-text span').html('');
                this.spinner.hide();
                $('.spinnerMask').removeAttr('style'); //so we don't keep adding styles from the animation 
            }
        },

        randomLoadingMessage: function () {
            //later i should store these on Parse and pull down when user logs in so that I can update dynamically/seasonally
            var arr = ['Loading...',
                        'Baking cookies...',
                        'Twiddling thumbs...',
                        'Pouring pints...',
                        'Loosening up...',
                        'Waking hamsters...',
                        'Googling it...',
                        'Thinking about cheese...',
                        'Changing station...',
                        'Clipping toenails...',
                        'Ordering takeout...',
                        'Duct taping...',
                        'Making spaghetti...',
                        'Thinking about pizza...',
                        'Brushing teeth...',
                        'Phoning home...',
                        'Greasing axles...',
                        'Checking tire pressure...',
                        'Updating...',
                        'Making mixtape...',
                        'Rotary girdering...',
                        'Flipping burgers...',
                        'Frying twinkies...',
                        'YOLO-ing...',
                        'Making fart noises...',
                        'Cooking ramen noodles...',
                        'Harnessing chi...',
                        'Using the Force...',
                        'Picking nose...',
                        'Recharging karma...',
                        'Pushing the red button...',
                        'Crunching numbers...',
                        'Mashing buttons...',
                        'Pulling levers...',
                        'Getting more info...',
                        'Powering up...',
                        'Counting to 10000...',
                        'Thinking about puppies...',
                        'Thinking about kittens...',
                        'Thinking about ice cream...',
                        'Doing crossword...',
                        'Playing sudoku...',
                        'Contacting mothership...',
                        'Pondering life...',
                        'Checking teeth...',
                        'Buying lottery tickets...',
                        'Double rainbowing...',
                        'Doing algebra...',
                        'Doing calculus...',
                        'Doing long division...',
                        'Flipping record...',
                        'Showering...',
                        'Contemplating...',
                        'Lubricating...',
                        'Making pit stop...',
                        'Visiting restroom...',
                        'Sprocketing sprockets...',
                        'Kicking tires...',
                        'Cutting and pasting...',
                        ''];

            //return a random message from the array
            return arr[Math.floor(Math.random() * arr.length)];
        },

        setNavBarTitle: function (title) {
            if(BGS.Utilities.isUnitTesting === false) $('.nav-bar-title').html(title);
        },

        showAddressBar: function (address) {
            if(BGS.Utilities.isUnitTesting === false) {
                if (address !== null) $('.address-text').html(address);
                if ($(".address-bar").height() > 77) return; //address is already showing
                $(".address-bar").animate({
                    height: "78px"
                }, 100);
            } 
        },

        hideAddressBar: function () {
            if(BGS.Utilities.isUnitTesting === false) {
                $(".address-bar").animate({
                height: "30px"
                }, 100);

                //also, deselect either service bar button
                $('.place-button-active').removeClass('place-button-active ui-state-persist');
            } 
        },

        getMoreFreeGames: function() {
            var s = this;
            s.showSpinner('Retrieving...');
            var successCallback = function (event) {
                var message = "";
                if (event.RevMobAdsEvent == "AD_RECEIVED") {
                    message = "Ad received!";
                }
                else if (event.RevMobAdsEvent == "AD_DISMISS") {
                    message = "Ad dismiss!";
                }
                else if (event.RevMobAdsEvent == "AD_CLICKED") {
                    message = "Ad clicked!";
                }
                else if (event.RevMobAdsEvent == "AD_DISPLAYED") {
                    message = "Ad displayed!";
                }
                else {
                    message = event.RevMobAdsEvent;
                }

                console.log('Revmob message: ' + message);
                s.hideSpinner();
            };

            var errorCallback = function (event) {
                var message = "";
                if (event.RevMobAdsEvent == "AD_NOT_RECEIVED") {
                    message = "Ad not received!";
                }
                else {
                    message = event.RevMobAdsEvent;
                }

                console.log('Revmob error message: ' + message);
                s.hideSpinner();

                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops.", "Something happened. Please try your request again.", true, true);

            };

            window.plugins.revMob.openAdLink(successCallback, errorCallback);
            // console.log('revmob: ' + RevMob);
            // RevMob.openLink();
        },

        rateApp: function() {
            //http://itunes.apple.com/us/app/bar-golf-stars/id397304605?mt=8
            // window.open("http://itunes.apple.com/us/app/bar-golf-stars/id397304605?mt=8", '_blank');
            window.open("http://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?id=397304605&pageNumber=0&sortOrdering=1&type=Purple+Software&mt=8", '_blank');
        },

        deleteAccount: function () {
            //confirm function from jq.simplemodal.js
            confirm({
                    header: "DANGER!!!",
                    message: "Deleting your account will remove ALL your data. Any rounds you've created will be deleted and other players will no longer be able to access them.",
                    confirmButton: "Yes, delete",
                    cancelButton: "No, cancel"
                },
                function () {
                    setTimeout(function() {
                        // confirmation 'yes' cb so delete account
                        confirm({
                                header: "Are you REAALLLLY sure?",
                                message: "Deleting your account is not reversible. There is no undo. This is what it sounds like when doves cry.",
                                confirmButton: "Delete me!",
                                cancelButton: "No, cancel"
                            },
                            function () {
                                //confirmation 'yes' cb so delete account
                                console.log('delete my account called from MainController.js');
                                BGS.Utilities.deleteUserAccountAndDataFromParse()
                                .then(function (success) {
                                    //user successfully deleted
                                },
                                function (e) {
                                    console.log('Main.Controller.deleteAccount eror returned: ' + JSON.stringify(e));
                                    var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                                    Parse.Analytics.track('error', { code: codeString });
                                });
                            }
                        );
                    }, 200);
                }
            );
        }
    };

    //ensure we set up our spinner for all other views to use at app start
    Main.Controller.initialize();
});