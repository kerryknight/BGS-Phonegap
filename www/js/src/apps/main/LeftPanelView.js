BGS.module('MainApp.Main', function (Main, BGS, Backbone, Marionette, $, _) {
    Main.LeftPanelView = Backbone.Marionette.ItemView.extend({
        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('left-panel'));
        },

        onShow: function () {
            console.log('on show panel');
        },

        el: '#sliding-sidebar',

        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
            };

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchend .menu-my-scorecard": "goToMyScorecard",
                    "touchend .menu-leaderboard": "goToLeaderboard",
                    "touchend .menu-player": "goToPlayerProfile",
                    "touchend .menu-join-round": "goToJoinRound",
                    "touchend .menu-create-round": "goToCreateRound",
                    "touchend .menu-rules": "goToRules",
                    "touchend .menu-current-round": "goToRoundSetup",
                    "touchend .menu-legal": "goToLegal",
                    "touchend .menu-acknowledgements": "goToAcknowledgements",
                    "touchend .menu-disclaimer": "goToDisclaimer",
                    "touchend .menu-rate": "goToRate",
                    "touchend .menu-free-games": "goToFreeGames",
                    "touchend .menu-logout": "goToLogOut",
                    "touchmove #left-panel": "scrollViewIsScrolling",
                    "touchstart li": 'highlightItem',
                    "touchend li": 'unhighlightItem'
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "click .menu-my-scorecard": "goToMyScorecard",
                    "click .menu-leaderboard": "goToLeaderboard",
                    "click .menu-player": "goToPlayerProfile",
                    "click .menu-join-round": "goToJoinRound",
                    "click .menu-create-round": "goToCreateRound",
                    "click .menu-rules": "goToRules",
                    "click .menu-current-round": "goToRoundSetup",
                    "click .menu-legal": "goToLegal",
                    "click .menu-acknowledgements": "goToAcknowledgements",
                    "click .menu-disclaimer": "goToDisclaimer",
                    "click .menu-rate": "goToRate",
                    "click .menu-free-games": "goToFreeGames",
                    "click .menu-logout": "goToLogOut",
                    "mousemove #left-panel": "scrollViewIsScrolling",
                    "mousedown li": 'highlightItem',
                    "click li": 'unhighlightItem'
                });
            }
            return events_hash;
        },

        showCurrentRoundOptions: function() {
            $('.current-round-options').show();
            if(typeof (this.sv) != 'undefined') this.sv.refresh();
        },

        hideCurrentRoundOptions: function() {
            $('.current-round-options').hide();
            if(typeof (this.sv) != 'undefined') this.sv.refresh();
        },

        goToMyScorecard: function () {
            this.goToMenuItem('.menu-my-scorecard');
        },

        goToLeaderboard: function () {
            this.goToMenuItem('.menu-leaderboard');
        },

        goToPlayerProfile: function () {
            this.goToMenuItem('.menu-player');
        },

        goToJoinRound: function () {
            this.goToMenuItem('.menu-join-round');
        },

        goToLegal: function () {
            this.goToMenuItem('.menu-legal');
        },

        goToAcknowledgements: function () {
            this.goToMenuItem('.menu-acknowledgements');
        },

        goToDisclaimer: function () {
            this.goToMenuItem('.menu-disclaimer');
        },

        goToRate: function () {
            this.goToMenuItem('.menu-rate');
        },

        goToFreeGames: function () {
            this.goToMenuItem('.menu-free-games');
        },

        highlightItem: function(e) {
            var s = this;
            this.isScrolling = false;
            setTimeout(function() {
                if(s.isScrolling === false) {
                    $(e.target).closest('.left-menu-link').css({'-webkit-transform':'scale3d(1.05, 1.05, 1)'});
                    $(e.target).closest('.lt-purple').addClass('accent-color-box-wide').removeClass('accent-color-box');
                }
            }, 200); 
        },

        unhighlightItem: function(e) {
            setTimeout(function() {
                $('.lt-purple').removeClass('accent-color-box-wide').addClass('accent-color-box');
                $(e.target).closest('.left-menu-link').css({'-webkit-transform':'scale3d(1.0, 1.0, 1)'});
                $(e.target).closest('.lt-purple.div').removeClass('accent-color-box-wide').addClass('accent-color-box');
            }, 300); 

            this.isScrolling = false;
        },

        goToCreateRound: function () {
            //since we can cancel creating a new round, we'll treat this menu item a little different than the rest
            //mainly, i don't want to automatically close the side panel on clicking the item as i want to show an
            //alert box and only close the panel if the user accepts creating a new round, leaving it open if they cancel
            //check if we're scrolling the menu panel
            //if so, exit but reset the flag as that means we lifted our finger if we got here
            if (this.isScrolling) {
                this.isScrolling = false;
                return;
            }

            //check our flag to prevent double clicks
            if (!this.hasBeenClicked) {
                var s = this;

                setTimeout(function () {

                    Main.Controller.hideAddressBar();
                    s.hasBeenClicked = false;

                    //show an alert asking the user if they're sure they want to create a new round
                    confirm({
                            header: "Create New Round?",
                            message: "This new round will become the active round. If you have other rounds, they will be deactivated and other players will no longer be able to make scoring updates to them.",
                            confirmButton: "Continue",
                            cancelButton: "No, cancel"
                        },
                        function () {
                            BGS.MainApp.Main.Controller.showSpinner('Creating new round...');
                                setTimeout(function() {
                                    Main.Controller.closeSlidingView(function () {
                                        Main.Controller.loadRSApp(shouldCreateNew = true);
                                    });
                                }, 300);
                        }
                    );


                }, 200); //add a slight delay so user can see their selection highlight
            }
        },

        goToRules: function () {
            this.goToMenuItem('.menu-rules');
        },

        goToRoundSetup: function () {
            this.goToMenuItem('.menu-current-round');
        },

        goToLogOut: function () {
            this.goToMenuItem('.menu-logout');
        },

        goToMenuItem: function (menuItem) {

            //check if we're scrolling the menu panel
            //if so, exit but reset the flag as that means we lifted our finger if we got here
            if (this.isScrolling) {
                this.isScrolling = false;
                return;
            }

            if (!menuItem) return;

            //check our flag to prevent double clicks
            if (!this.hasBeenClicked) {

                var s = this;

                setTimeout(function () {

                    Main.Controller.hideAddressBar();

                    Main.Controller.closeSlidingView(function () {
                        s.hasBeenClicked = false;
                        if (menuItem == '.menu-my-scorecard') {
                            Main.Controller.loadScorecardApp();
                        } else if (menuItem == '.menu-leaderboard') {
                            Main.Controller.showView(Main.Controller.leaderboardView(), Main.Controller.noEffect());
                        } else if (menuItem == '.menu-player') {
                            Main.Controller.showView(Main.Controller.playerView(), Main.Controller.noEffect());
                        } else if (menuItem == '.menu-join-round') {
                            console.log('show join round view');
                        } else if (menuItem == '.menu-rules') {
                            console.log('show rules view');
                        } else if (menuItem == '.menu-current-round') {
                            Main.Controller.loadRSApp(shouldCreateNew = false);
                        } else if (menuItem == '.menu-acknowledgements') {
                            console.log('app acknowledgements');
                        } else if (menuItem == '.menu-disclaimer') {
                            console.log('app disclaimer');
                        } else if (menuItem == '.menu-legal') {
                            console.log('app privacy/tos');
                        } else if (menuItem == '.menu-rate') {
                            Main.Controller.rateApp();
                        } else if (menuItem == '.menu-free-games') {
                            Main.Controller.getMoreFreeGames();
                        } else if (menuItem == '.menu-logout') {
                            BGS.StartApp.Start.Controller.logOut();
                        }
                    });
                }, 200); //add a slight delay so user can see their selection highlight
            }
        },

        scrollViewIsScrolling: function () {
            //remove touch down styling
            $('.lt-purple').removeClass('accent-color-box-wide').addClass('accent-color-box');
            $('.left-menu-link').css({'-webkit-transform':'scale3d(1.0, 1.0, 1)', 'color':'rgb(198, 200, 200)'});
            this.isScrolling = true;
        },

        createMenuScrollView: function (elementToScroll) {
            var s = this;
            setTimeout(function () {
                s.sv = new iScroll(elementToScroll, {
                    hScroll: false,
                    hScrollbar: false,
                    vScrollbar: false,
                    topOffset: 0,
                    hideScrollbar: true,
                    fadeScrollbar: true,
                    lockDirection: true,
                    yMinDistance: -500, //adjust this value to allow for more menu options
                    yMaxDistance: 200
                });

                $('#' + elementToScroll).css('height', '100%');
                s.sv.refresh();

            }, 500);
        },

        onRender: function () {
            this.createMenuScrollView('sliding-sidebar');
            this.hasBeenClicked = false; //flag used to prevent double-clicks attempting double navigation
        }
    });

    //USERNAME
    Main.UsernameView = Backbone.Marionette.ItemView.extend({
        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('username'));
        },

        el: '.username'
    });
});