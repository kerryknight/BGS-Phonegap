BGS.module('RSApp.RoundSetup', function (RoundSetup, BGS, Backbone, Marionette, $, _) {
    RoundSetup.OptionsListView = Backbone.Marionette.ItemView.extend({
        //each is a list item
        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('round-setup-options'));
        },

        events: function () {
            var events_hash = {};

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchend .rs-options-players": "modifyPlayersClicked",
                    "touchend .rs-options-holes": "modifyHolesClicked",
                    "touchend .rs-options-auto-course-setup": "automaticCourseSetupClicked",
                    "touchend .rs-options-drinks": "customizeDrinksClicked",
                    "touchend .rs-options-bonuses": "customizeBonusesClicked",
                    "touchend .rs-options-penalties": "customizePenaltiesClicked",
                    "touchend .rs-options-reset-defaults": "resetDefaultScoringClicked",
                    "touchend .rs-options-delete-round": "deleteRoundClicked",
                    "touchend #rs-start-round": "startRoundClicked",
                    "touchend #rs-round-id": "roundIdClicked", 
                    "touchstart .rs-option": "setShouldTakeAction",
                    "touchmove .rs-option": "preventTakingAction"
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "click .rs-options-players": "modifyPlayersClicked",
                    "click .rs-options-holes": "modifyHolesClicked",
                    "click .rs-options-auto-course-setup": "automaticCourseSetupClicked",
                    "click .rs-options-drinks": "customizeDrinksClicked",
                    "click .rs-options-bonuses": "customizeBonusesClicked",
                    "click .rs-options-penalties": "customizePenaltiesClicked",
                    "click .rs-options-reset-defaults": "resetDefaultScoringClicked",
                    "click .rs-options-delete-round": "deleteRoundClicked",
                    "click #rs-start-round": "startRoundClicked",
                    "click #rs-round-id": "roundIdClicked", 
                    "mousedown .rs-option": "setShouldTakeAction",
                    "mousemove .rs-option": "preventTakingAction"
                });
            }
            return events_hash;
        },

        initialize: function (options) {

            //hide both bottom buttons initially
            setTimeout(function() {
                $('#rs-start-round').hide();
                $('#rs-round-id').hide();
            }, 0);
            
            // console.log('RoundSetup.OptionsListView initialize');
            var navTitle = options.newRound === true ? 'Creating Round' : 'Modifying Round';

            BGS.MainApp.Main.Controller.setNavBarTitle(navTitle);

            //hide the right header button
            $('.right-header-button').hide().unbind();

            //now check if we have a start date set for the round; if we don't, show the Start Round button
            //if we do, display the round's objectId so we can share it with others so they can play
            if (typeof(RoundSetup.Controller.round) != 'undefined' && typeof(RoundSetup.Controller.round.get('startDate')) != 'undefined' && RoundSetup.Controller.round.get('startDate') > 0) {
                //we have a startdate so show our round id
                this.showRoundIdButton();
            } else {
                //else, we haven't started our round yet so show the start round button
                this.showStartRoundButton();
            }
        },

        remove: function () {
            this.undelegateEvents();
            this.unbind();
        },

        onBeforeRender: function () {
            // console.log('OptionsListView onBeforeRender:');
        },

        onRender: function () {
            // console.log('OptionsListView onRender');
            this.createScrollView();
        },

        showStartRoundButton: function() {
            setTimeout(function() {
                $('#rs-start-round').show();
                $('#rs-round-id').hide();
            }, 0);
        },

        showRoundIdButton: function() {
            setTimeout(function() {
                $('#rs-start-round').hide();
                $('#rs-round-id').show();
                $('.rs-options-button-header').html('Join Round ID: ' + RoundSetup.Controller.round.id);
            }, 0);
        },

        setShouldTakeAction: function (e) {
            // console.log('touchstart on option item');
            //highlight the row
            $(".rs-option").removeClass("ui-highlight-list-row");
            var thisParent = $(e.target).closest('li');
            thisParent.addClass('ui-highlight-list-row');
            this.shouldTakeAction = true;
            thisParent = null; //m.m.
        },

        preventTakingAction: function (e) {
            // console.log('touchmove on option item');
            //unhighlight all rows
            $(".rs-option").removeClass("ui-highlight-list-row");
            this.shouldTakeAction = false;
        },

        modifyPlayersClicked: function() {
            var s = this;
            if (this.shouldTakeAction === true) {
                if (this.buttonClicked !== true) RoundSetup.Controller.modifyPlayers();
                this.buttonClicked = true;
                setTimeout(function(){s.buttonClicked = false;}, 500);//reset our button clicked flag
            } 
        },

        modifyHolesClicked: function() {
            var s = this;
            if (this.shouldTakeAction === true) {
                if (this.buttonClicked !== true) RoundSetup.Controller.modifyHoles();
                this.buttonClicked = true;
                setTimeout(function(){s.buttonClicked = false;}, 500);//reset our button clicked flag
            } 
        },

        automaticCourseSetupClicked: function() {
            var s = this;
            if (this.shouldTakeAction === true) {
                if (this.buttonClicked !== true) RoundSetup.Controller.automaticCourseSetup();
                this.buttonClicked = true;
                setTimeout(function(){s.buttonClicked = false;}, 500);//reset our button clicked flag
            } 
        },

        customizeDrinksClicked: function() {
            var s = this;
            if (this.shouldTakeAction === true) {
                if (this.buttonClicked !== true) RoundSetup.Controller.customizeDrinks();
                this.buttonClicked = true;
                setTimeout(function(){s.buttonClicked = false;}, 500);//reset our button clicked flag
            } 
        },

        customizeBonusesClicked: function() {
            var s = this;
            if (this.shouldTakeAction === true) {
                if (this.buttonClicked !== true) RoundSetup.Controller.customizeBonuses();
                this.buttonClicked = true;
                setTimeout(function(){s.buttonClicked = false;}, 500);//reset our button clicked flag
            } 
        },

        customizePenaltiesClicked: function() {
            var s = this;
            if (this.shouldTakeAction === true) {
                if (this.buttonClicked !== true) RoundSetup.Controller.customizePenalties();
                this.buttonClicked = true;
                setTimeout(function(){s.buttonClicked = false;}, 500);//reset our button clicked flag
            } 
        },

        resetDefaultScoringClicked: function() {
            var s = this;
            if (this.shouldTakeAction === true) {
                confirm({
                    header: "Are you sure?",
                    message: "Resetting scoring rules will remove any custom ones from the current round. However, any custom scoring added to a hole already will remain for that player. There is no undo.",
                    confirmButton: "Yes, reset",
                    cancelButton: "No, cancel"
                    },
                    function () {
                        //delete the round
                        setTimeout(function(){
                            BGS.MainApp.Main.Controller.showSpinner('Resetting...');
                        }, 100);
                        if (s.buttonClicked !== true) RoundSetup.Controller.resetDefaultScoring();
                        s.buttonClicked = true;
                        setTimeout(function(){s.buttonClicked = false;}, 500);//reset our button clicked flag
                    }
                );
            }
        },

        deleteRoundClicked: function() {
            var s = this;
            if (this.shouldTakeAction === true) {
                confirm({
                    header: "Are you sure?",
                    message: "Deleting this round will remove all data for this round and other players will no longer be able to access it. There is no undo.",
                    confirmButton: "Yes, delete",
                    cancelButton: "No, cancel"
                    },
                    function () {
                        //delete the round
                        setTimeout(function(){
                            BGS.MainApp.Main.Controller.showSpinner('Deleting round...');
                        }, 100);
                        if (s.buttonClicked !== true) RoundSetup.Controller.deleteCurrentRound();
                        s.buttonClicked = true;
                        setTimeout(function(){s.buttonClicked = false;}, 500);//reset our button clicked flag
                    }
                );
            } 
        },

        startRoundClicked: function() {
            var s = this;
            if (this.buttonClicked !== true) this.startRound();
            this.buttonClicked = true;
            setTimeout(function(){s.buttonClicked = false;}, 500);//reset our button clicked flag
        },

        roundIdClicked: function() {
            confirm({
                    header: "Unlimited Players in a Round!",
                    message: "Enter the Join Round ID listed below into the Join Round section of the sliding menu on the left to play along with this round. We'll take care of setting up the entire course with the same rules you've just created. Other players just need to add their own players (up to 4 per scorecard) for scorekeeping!",
                    confirmButton: "OK"
                    },
                    function () {
                    //do nothing
                    }
                );
        },

        startRound: function() {
            var s = this;
            confirm({
                    header: "Ready to start?",
                    message: "We'll set up default values for anything you didn't set up here already. Return to this section to modify them later.",
                    confirmButton: "Start!",
                    cancelButton: "Cancel"
                    },
                    function () {
                        //tell our controller to start the round
                        RoundSetup.Controller.startRound()
                        .then(function(success) {
                            //on successfully starting the round, show our round id
                            // s.showRoundIdButton();
                        },
                        function(e) {

                        });
                    }
                );
        },

        refreshScrollView: function () {
            var s = this;
            setTimeout(function () {
                s.sv.refresh();
            }, 500);
        },

        createScrollView: function (elementToScroll, cb) {
            var s = this;
            //create scrollview after a slight delay to ensure DOM fully loaded,
            //a best practice per the original developer of iScroll.js
            setTimeout(function () {
        
                s.sv = new IScroll('#iscroll-wrapper', {
                    mouseWheel: true,
                    tap: true,
                    bottomOffset: 150
                });

                //set the scroll view's height dynamically based on the window height minus the header/footer height
                var containerHeight = parseInt($('#container').css('height'), 10), //strip out 'px' from css property
                    headerHeight = parseInt($('.header').css('height'), 10), //strip out 'px' from css property
                    placesBarHeight = parseInt($('.places-bar').css('height'), 10), //strip out 'px' from css property
                    scrollerHeight = containerHeight - (headerHeight + placesBarHeight); //add 25px of buffer to offset CSS margin of 20px we added to top
                $('#iscroll-wrapper').css('height', scrollerHeight);

                s.sv.enabled = true;
                s.refreshScrollView();

                $.isFunction(cb) && cb();

                containerHeight, headerHeight, placesBarHeight, scrollerHeight = null; //memory management

                BGS.MainApp.Main.Controller.hideSpinner('round setup view');

                //zebra striping
                $('.rs-list li.rs-option:odd').addClass('lt-lt-gray');
                $('.rs-list li.rs-option:even').addClass('no-color');

            }, 100);
        },
    });
});