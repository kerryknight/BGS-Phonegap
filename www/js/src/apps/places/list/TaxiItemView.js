BGS.module('PlacesApp.Places', function (Places, BGS, Backbone, Marionette, $, _) {
    Places.TaxiItemView = Backbone.Marionette.ItemView.extend({
        //each is a list item
        tagName: "li",

        model: BGS.Entities.FoursquarePlace,

        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
            };

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchend .try-again": "errorReload",
                    "touchend .taxi-list-item": "getPlaceDetails",
                    "touchstart .taxi-list-item": "setShouldTakeAction",
                    "touchmove .taxi-list-item": "preventTakingAction"
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "click .try-again": "errorReload",
                    "click .taxi-list-item": "getPlaceDetails",
                    "mousedown .taxi-list-item": "setShouldTakeAction",
                    "mousemove .taxi-list-item": "preventTakingAction"
                });
            }
            return events_hash;
        },

        getPlaceDetails: function () {
            var s = this;

            //only attempt to get details and make a call if we've removed our finger but not while scrolling
            if (this.shouldTakeAction === true) {
                BGS.MainApp.Main.Controller.showSpinner('Looking up taxi number...');

                BGS.GoogleAPI.googleGetPlaceDetails(this.model, function (taxi, status) {
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        s.callTaxi(taxi);
                    } else {
                        BGS.MainApp.Main.Controller.hideSpinner('get taxi list details e');
                        BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops! There was an error calling this taxi. Try again.", "Error message: " + status, isError = true, showAtBottom = true);
                    }
                });
            }
        },

        callTaxi: function (taxi) {
            BGS.MainApp.Main.Controller.hideSpinner('call taxi');
            if (taxi.get('phone')) {
                document.location = 'tel:' + taxi.get('phone'); //dial the number
            } else {
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops! We had trouble retrieving this taxi's phone number.", "Please try again.", isError = true, showAtBottom = true);
            }
        },

        setShouldTakeAction: function (e) {
            // console.log('touchstart on taxi item');
            //highlight the row
            $(".places-list li").removeClass("ui-highlight-list-row");
            var thisParent = $(e.target).closest('li');
            thisParent.addClass('ui-highlight-list-row');
            this.shouldTakeAction = true;
        },

        preventTakingAction: function (e) {
            // console.log('taxiitemview prevent taking action');
            //unhighlight all rows
            $(".places-list li").removeClass("ui-highlight-list-row");
            this.shouldTakeAction = false;
        },

        getTemplate: function () {
            return _.template(BGS.Utilities.templateLoader.get('taxi-list-item'));
        }
    });
});