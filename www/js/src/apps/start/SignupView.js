BGS.module('StartApp.Start', function (Start, BGS, Backbone, Marionette, $, _) {
    Start.SignupView = Backbone.Marionette.ItemView.extend({
        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
                'keypress input[type=text]': 'signUpOnEnter',
                'keypress input[type=email]': 'signUpOnEnter',
                'keypress input[type=password]': 'signUpOnEnter'
            };
            if (BGS.Utilities.isMobileDevice()) {
                _.extend(events_hash, {
                    "touchend .signup-button": "signUpClicked",
                    "touchend .back-button": "cancelClicked"
                });
            } else {
                _.extend(events_hash, {
                    "click .signup-button": "signUpClicked",
                    "click .back-button": "cancelClicked"
                });
            }
            return events_hash;
        },

        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('signup'));
        },

        cancelClicked: function() {
            if (!this.buttonClicked) Start.Controller.popView();
            this.buttonClicked = true;
        },

        validateForm: function () {
            var isValidated = true;
            if (!$('#signup-username').val() || $('#signup-username').closest('input').hasClass('e')) {
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops!", "Please enter a valid email address", isError = true, showAtBottom = true);
                isValidated = false;
                return isValidated;
            }

            if (!$('#signup-password').val() || $('#signup-password').closest('input').hasClass('e')) {
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops!", "You must create a password at least 5 characters long with at least 1 number.", isError = true, showAtBottom = true);
                isValidated = false;
                return isValidated;
            }

            if ($('#signup-password').val() != $('#signup-password-confirm').val()) {
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops!", "Please re-enter your password to confirm it.", isError = true, showAtBottom = true);
                isValidated = false;
                return isValidated;
            }

            if (!$('#signup-displayname').val() || $('#signup-displayname').closest('input').hasClass('e')) {
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops!", "Please enter a display name that will be used as your username on leaderboards and scorecards.", isError = true, showAtBottom = true);
                isValidated = false;
                return isValidated;
            }

            return isValidated;
        },

        signUpOnEnter: function (e) {
            //check if we hit the enter key, which will allow us to submit as well
            if (e.keyCode != 13) return;
            // $('input:focus').blur(); //to dismiss the keyboard
            this.signUpClicked(e);
        },

        signUpClicked: function (e) {
            $('input:focus').blur(); //to dismiss the keyboard
            //ensure we've entered all info before doing anything
            if (!this.validateForm()) {
                return;
            }

            BGS.MainApp.Main.Controller.showSpinner('Signing up...');

            //create our new user and set up all our initial details
            var user = new Parse.User();
            user.set("username", this.$("#signup-username").val());
            user.set("password", this.$("#signup-password").val());
            user.set("email", this.$("#signup-username").val()); //email is our username for this app
            user.set("displayName", this.$("#signup-displayname").val());
            user.set("ACL", new Parse.ACL());

            if (!this.buttonClicked) Start.Controller.signUp(user);
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