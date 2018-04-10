BGS.module('PlacesApp.Places', function (Places, BGS, Backbone, Marionette, $, _) {
    Places.BarItemView = Backbone.Marionette.ItemView.extend({
        //each is a list item
        tagName: "li",

        model: BGS.Entities.FoursquarePlace,

        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
                "click .try-again": "errorReload",
                "click .bar-list-item": "goToBarDetails",
            };

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchstart .bar-list-item": "setShouldTakeAction",
                    "touchmove .bar-list-item": "preventTakingAction"
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "mousedown .bar-list-item": "setShouldTakeAction",
                    "mousemove .bar-list-item": "preventTakingAction"
                });
            }
            return events_hash;
        },

        goToBarDetails: function (e) {
            // prevent propagation
            e.stopImmediatePropagation();

            // console.log('touchend on bar item');
            if (this.shouldTakeAction === true) {
                // console.log('bar model = ' + JSON.stringify(this.model));

                //we need to pass the show map function a collection, but since we only want to see one item,
                //let's create a whole new collection with just that item and pass that instead; any changes
                //we might possibly make to the model its, will bubble up through all collections it might
                //be a part of as per default functionality of backbone
                var singleItemCollection = new BGS.Entities.FoursquarePlaceCollection();
                singleItemCollection.add(this.model);

                if (this.buttonClicked === false) Places.Controller.showMap(singleItemCollection, {'type':'bars'});
                this.buttonClicked = true;
            }
        },

        setShouldTakeAction: function (e) {

            //highlight the row
            $(".places-list li").removeClass("ui-highlight-list-row");
            var thisParent = $(e.target).closest('li');
            thisParent.addClass('ui-highlight-list-row');
            this.shouldTakeAction = true;
            thisParent = null; //memory management
        },

        preventTakingAction: function (e) {

            //unhighlight all rows
            $(".places-list li").removeClass("ui-highlight-list-row");
            this.shouldTakeAction = false;
        },

        initialize: function (options) {
            this.buttonClicked = false;
        },

        getTemplate: function () {
            return _.template(BGS.Utilities.templateLoader.get('bar-list-item'));
        },

        modelEvents: {
            "change": "modelChanged"
        },

        collectionEvents: {
            "add": "modelAdded"
        },

        modelChanged: function () {
            console.log('bar modelChanged');
        },

        modelAdded: function () {
            console.log('bar modelAdded');
            Places.List.refreshScrollView();
        }
    });
});