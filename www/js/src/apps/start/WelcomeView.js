BGS.module('StartApp.Start', function (Start, BGS, Backbone, Marionette, $, _) {
    Start.WelcomeView = Backbone.Marionette.ItemView.extend({

        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('welcome'));
        },

        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
            };

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchend .facebook-button-bg": "facebookLoginClicked",
                    "touchend .goto-login-button": "showLoginClicked",
                    "touchend .goto-signup-button": "showSignupClicked",
                    "touchend .skip-login-button-bg": "skipLoginClicked"
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "click .facebook-button-bg": "facebookLoginClicked",
                    "click .goto-login-button": "showLoginClicked",
                    "click .goto-signup-button": "showSignupClicked",
                    "click .skip-login-button-bg": "skipLoginClicked"
                });
            }
            return events_hash;
        },

        facebookLoginClicked: function () {
            var s = this;
            if (!s.buttonClicked) BGS.FacebookAPI.facebookLogin();
            s.buttonClicked = true;

            setTimeout(function() {
                //this is a monstrous hack to put functionality back in case the user clicked to 
                //login with facebook but then canceled the permissions screen once there; otherwise,
                //the view never reinitializes and all the buttons are disabled still
                s.buttonClicked = false;
            }, 1000);
        },

        showLoginClicked: function () {
            if (!this.buttonClicked) Start.Controller.showLoginView();
            this.buttonClicked = true;
        },

        showSignupClicked: function () {
            if (!this.buttonClicked) Start.Controller.showSignupView();
            this.buttonClicked = true;
        },

        skipLoginClicked: function () {
            if (!this.buttonClicked) Start.Controller.skipLogin();
            this.buttonClicked = true;
        },

        onRender: function () {
            var s = this;
            s.on('viewActivate', s.viewDidActivate, s); //Backstack event
            s.on('viewDeactivate', s.viewDidDeactivate, s); //Backstack event
            $('#container').css({
                'visibility': 'visible'
            }); //make parent view visible now
        },

        viewDidActivate: function () {
            // console.log('WelcomeView: viewDidActivate');
        },

        viewDidDeactivate: function () {
            // console.log('WelcomeView: viewDidDeactivate');
        }

    });
});