BGS.module('StartApp.Start', function (Start, BGS, Backbone, Marionette, $, _) {
    Start.LoginView = Backbone.Marionette.ItemView.extend({

        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('login'));
        },

        onRender: function () {
            var s = this;
            s.on('viewActivate', s.viewDidActivate, s); //Backstack event
            s.on('viewDeactivate', s.viewDidDeactivate, s); //Backstack event

            console.log('******************* REMOVE AUTOSETTING LOGIN INFO ***********************');
            s.$("#login-username").val('kerry.a.knight@gmail.com');
            s.$("#login-password").val('jeeps1');
        },

        viewDidActivate: function () {
            // console.log('LoginView: viewDidActivate');
        },

        viewDidDeactivate: function () {
            // console.log('LoginView: viewDidDeactivate');
        },

        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
                'keypress input[type=text]': 'loginOnEnter',
                'keypress input[type=password]': 'loginOnEnter'
            };

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchend .login-button": "loginClicked",
                    "touchend .forgot-password-link": "showForgotPasswordClicked",
                    "touchend .back-button": "cancelClicked"
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "click .login-button": "loginClicked",
                    "click .forgot-password-link": "showForgotPasswordClicked",
                    "click .back-button": "cancelClicked"
                });
            }
            return events_hash;
        },

        showForgotPasswordClicked: function () {
            if (!this.buttonClicked) Start.Controller.showForgotPasswordView();
            this.buttonClicked = true;
        },

        cancelClicked: function() {
            if (!this.buttonClicked) Start.Controller.popView();
            this.buttonClicked = true;
        },

        loginOnEnter: function (e) {
            //check if we hit the enter key, which will allow us to submit as well
            if (e.keyCode != 13) return;
            this.loginClicked(e);
        },

        loginClicked: function (e) {
            $('input:focus').blur(); //to dismiss the keyboard

            var credentials = {
                "username" : this.$("#login-username").val(),
                "password" : this.$("#login-password").val()
            };

            //pass to our controller
            if (!this.buttonClicked) Start.Controller.regularLogin(credentials);
            this.buttonClicked = true;

            var s = this;
            setTimeout(function() {
                //this is a monstrous hack to re-enable button clicks in case of submission failure
                s.buttonClicked = false;
            }, 1000);

            return false;
        }
    });
});