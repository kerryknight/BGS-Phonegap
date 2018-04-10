BGS.module('RSApp.RoundSetup', function (RoundSetup, BGS, Backbone, Marionette, $, _) {
    RoundSetup.ItemView = Backbone.Marionette.CompositeView.extend({

        setShouldTakeAction: function (e) {
            //our parent view will take care of adding necessary formatting on clicks
            this.shouldTakeAction = true;
        },

        preventTakingAction: function (e) {
            this.shouldTakeAction = false;
        },

        initialize: function(options) {
        },

        remove: function() {
            this.undelegateEvents();
            this.unbind();
        },

        modelEvents: {
            "change": "modelChanged"
        },

        collectionEvents: {
            "add": "modelAdded"
        },

        modelChanged: function () {
            // console.log('RoundSetup.ItemView modelChanged');
            this.render();
        },

        modelAdded: function () {
            // console.log('RoundSetup.ItemView modelAdded');
        },

        onBeforeRender: function () {},

        onRender: function () {}
    });

    //extending the parent RoundSetup.ListView class
    RoundSetup.PlayerItemView = RoundSetup.ItemView.extend({
        model: BGS.Entities.Player,

        initialize: function(options) {
            // console.log('PlayerItemView initialize');
            // this.delegateEvents();
        },

        remove: function() {
            this.undelegateEvents();
            this.unbind();
        },

        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
            };

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchend .rs-options-header": "showPlayerDetails",
                    "touchstart .rs-options-header": "setShouldTakeAction",
                    "touchmove .rs-options-header": "preventTakingAction"
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "click .rs-options-header": "showPlayerDetails",
                    "mousedown .rs-options-header": "setShouldTakeAction",
                    "mousemove .rs-options-header": "preventTakingAction"
                }); 
            }
            return events_hash;
        },

        showPlayerDetails: function(e) {
            //tell the bottom data view to appear
            if (this.shouldTakeAction === true) {
                //tell the data entry view to slide up from bottom
                RoundSetup.Controller.roundSetupPlayerDataView.showDataView(e, this.model);
                //tell the scrollview to scroll the row we just clicked into view above data entry div
                RoundSetup.Controller.roundSetupListPlayersView.sv.scrollToElement(e.currentTarget);
            }
        },

        getTemplate: function () {
            return _.template(BGS.Utilities.templateLoader.get('round-setup-item-list-player'));
        }
    });

    //extending the parent RoundSetup.ListView class; fairly identical to playeritemview
    RoundSetup.RuleItemView = RoundSetup.ItemView.extend({
        model: BGS.Entities.Rule,

        initialize: function(options) {
            // console.log('RuleItemView initialize');
        },

        remove: function() {
            this.undelegateEvents();
            this.unbind();
        },

        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
            };

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchend .rs-options-header": "showRuleDetails",
                    "touchstart .rs-options-header": "setShouldTakeAction",
                    "touchmove .rs-options-header": "preventTakingAction"
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "click .rs-options-header": "showRuleDetails",
                    "mousedown .rs-options-header": "setShouldTakeAction",
                    "mousemove .rs-options-header": "preventTakingAction"
                }); 
            }
            return events_hash;
        },

        modelEvents: {
            "change": "modelChanged"
        },

        collectionEvents: {
            "add": "modelAdded"
        },

        modelChanged: function () {
            // console.log('RoundSetup.RuleItemView modelChanged');
            // this.render();
        },

        modelAdded: function () {
            console.log('RoundSetup.RuleItemView modelAdded');
        },

        showRuleDetails: function(e) {
            //tell the bottom data view to appear
            if (this.shouldTakeAction === true) {
                //tell the data entry view to slide up from bottom
                RoundSetup.Controller.roundSetupRuleDataView.showDataView(e, this.model);
                //tell the scrollview to scroll the row we just clicked into view above data entry div
                RoundSetup.Controller.roundSetupListRulesView.sv.scrollToElement(e.currentTarget);
            }
        },

        getTemplate: function () {
            return _.template(BGS.Utilities.templateLoader.get('round-setup-item-list-rule'));
        }
    });
    
    //extending the parent RoundSetup.ListView class
    RoundSetup.HoleItemView = RoundSetup.ItemView.extend({
        model: BGS.Entities.Hole,

        initialize: function(options) {
            // console.log('HoleItemView initialize');
            // this.delegateEvents();
        },

        remove: function() {
            this.undelegateEvents();
            this.unbind();
        },

        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
            };

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchend .rs-options-header": "goToBarListClicked",
                    "touchstart .rs-options-header": "setShouldTakeAction",
                    "touchmove .rs-options-header": "preventTakingAction"
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "click .rs-options-header": "goToBarListClicked",
                    "mousedown .rs-options-header": "setShouldTakeAction",
                    "mousemove .rs-options-header": "preventTakingAction"
                }); 
            }
            return events_hash;
        },

        goToBarListClicked: function(e) {
            if (this.shouldTakeAction === true) {
                //show our bar list view and pass our bar model in
                RoundSetup.Controller.modifySingleHole(this.model);
            }
        },

        getTemplate: function () {
            return _.template(BGS.Utilities.templateLoader.get('round-setup-item-list-hole'));
        }
    });

});