BGS.module('StartApp.Start', function (Start, BGS, Backbone, Marionette, $, _) {
    Start.ForgotPasswordView = Backbone.Marionette.ItemView.extend({
        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('forgot-password'));
        },

        onRender: function () {
            this.on('viewActivate', this.viewDidActivate, this); //Backstack event
            this.on('viewDeactivate', this.viewDidDeactivate, this); //Backstack event
        },

        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
                'keypress input[type=text]': 'sendPasswordResetLinkOnEnter'
            };

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchend .send-password-button": "sendPasswordResetLinkClicked",
                    "touchend .back-button": "cancelClicked"
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "click .send-password-button": "sendPasswordResetLinkClicked",
                    "click .back-button": "cancelClicked"
                });
            }
            return events_hash;
        },

        viewDidActivate: function () {
            // console.log('ForgotPasswordView: viewDidActivate');
        },

        viewDidDeactivate: function () {
            // console.log('ForgotPasswordView: viewDidDeactivate');
        },

        cancelClicked: function() {
            if (!this.buttonClicked) Start.Controller.popView();
            this.buttonClicked = true;
        },

        sendPasswordResetLinkOnEnter: function (event) {
            //check if we hit the enter key, which will allow us to submit as well
            if (event.keyCode != 13) return;

            //we must prevent the default event trigger that happens when hitting Enter key here;
            //otherwise, Parse/Backbone will attempt to re-trigger this same route and we'll get an
            //e when we try to reload this same view and Parse will never get the reset email request
            //this is different than hitting enter to submit the login form or sign up form because neither
            //of those views are reached via and actual route triggered by a link <a href="">, while this
            //view is reached via the link on the login view that triggers the "/forgotPassword" route
            event.preventDefault();

            // $('input:focus').blur(); //to dismiss the keyboard

            this.sendPasswordResetLinkClicked();
        },

        sendPasswordResetLinkClicked: function () {
            $('input:focus').blur(); //to dismiss the keyboard
            //ensure we've entered all info before doing anything
            if (!$('#forgot-password-email').val() || $('#forgot-password-email').closest('input').hasClass('e')) {
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops!", "Please enter a valid email address", isError = true, showAtBottom = true);
                return;
            }
            
            var emailToSendTo = this.$("#forgot-password-email").val();

            if (!this.buttonClicked) Start.Controller.sendPasswordResetLink(emailToSendTo);
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