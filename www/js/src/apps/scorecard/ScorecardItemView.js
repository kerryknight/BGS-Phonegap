BGS.module('ScorecardApp.Scorecard', function (Scorecard, BGS, Backbone, Marionette, $, _) {
    Scorecard.PlayerRowView = Backbone.Marionette.ItemView.extend({
        tagName: "li",

        getTemplate: function () {
            //use getTemplate: instead of template: here to ensure we have access to our model
            return _.template(BGS.Utilities.templateLoader.get('scorecard-player-list-item'));
        },

        remove: function() {
            this.undelegateEvents();
            this.unbind();
        },

        initialize: function(options) {
            // console.log('player item view init options: ' + JSON.stringify(options));
        },

        onRender: function() {
            // console.log('player item view on render');        
        }
    });

    Scorecard.HoleNameRowView = Backbone.Marionette.ItemView.extend({
        tagName: "td",
        getTemplate: function () {
            //use getTemplate: instead of template: here to ensure we have access to our model
            return _.template(BGS.Utilities.templateLoader.get('scorecard-hole-name-list-item'));
        },

        remove: function() {
            this.undelegateEvents();
            this.unbind();
        },

        initialize: function(options) {
            // console.log('hole item view init model: ' + JSON.stringify(this.model));
        }
    });

    //this is the item view for each hole score for each player on the scorecard
    Scorecard.HoleScoreRowView = Backbone.Marionette.ItemView.extend({
        tagName: "tr",

        id: function() {
            return 'p' + this.model.get('playerNum'); //add 'p' for player to our id as $ doesn't like just a number in selectors
        },

        getTemplate: function () {
            //use getTemplate: instead of template: here to ensure we have access to our model; also pass in our scores collection
            //as an extra parameter so we can filter by player within our item view template 
            return _.template(BGS.Utilities.templateLoader.get('scorecard-hole-score-list-item'));
        },

        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
            };

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchend .scorecard-hole-score-number": "enterScoreTouched",
                    "touchstart .scorecard-hole-score-number": "setShouldTakeAction",
                    "touchmove .scorecard-hole-score-number": "preventTakingAction"
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "click .scorecard-hole-score-number": "enterScoreTouched",
                    "mousedown .scorecard-hole-score-number": "setShouldTakeAction",
                    "mousemove .scorecard-hole-score-number": "preventTakingAction"
                }); 
            }
            return events_hash;
        },

        enterScoreTouched: function(e) {
            if (this.shouldTakeAction === true) {
                e.preventDefault();
                var id = $(e.currentTarget).data("id");
                //we'll use the id to know which hole we're on as well as to extract our total score for starting point on data entry
                Scorecard.Controller.showEnterScoreDataView(e, this.model, id);

                setTimeout(function() {
                    $(e.target).closest('td').removeClass('scorecard-hole-score-number-active');
                }, 500);
            }
        },

        setShouldTakeAction: function (e) {
            $('td').removeClass('scorecard-hole-score-number-active');
            //our parent view will take care of adding necessary formatting on clicks
            this.shouldTakeAction = true;

            var s = this;
            setTimeout(function(){
                if(s.shouldTakeAction === true) $(e.target).closest('td').addClass('scorecard-hole-score-number-active');
            }, 100);
        },

        preventTakingAction: function (e) {
            $('td').removeClass('scorecard-hole-score-number-active');
            this.shouldTakeAction = false;
        },

        remove: function() {
            this.undelegateEvents();
            this.unbind();
        },

        initialize: function(options) {
            // console.log('Scorecard.HoleScoreRowView init options: ' + JSON.stringify(options));
            // this.scoreCollection = options.scoreCollection;
            // this.model = options.model;
        },

        onRender: function() {
            // this.getScoreTotalsForHoles();
        }
    });

    //this is the individual rule that populates the scoring rule list in the enter score data view
    Scorecard.DataScoreTypeRowView = Backbone.Marionette.ItemView.extend({
        model: BGS.Entities.Rule,

        tagName: "li",

        className: 'rs-options-header font-size-20',

        getTemplate: function () {
            //use getTemplate: instead of template: here to ensure we have access to our model
            return _.template(BGS.Utilities.templateLoader.get('scorecard-data-score-list-item'));
        },

        remove: function() {
            this.undelegateEvents();
            this.unbind();
        },

        initialize: function(options) {
            // console.log('data score item view init options: ' + JSON.stringify(options));
        },

        onRender:function() {
            //disable clicking on the table as it was causing animation problems
            // $('table').attr('disabled','disabled');
            // $('table').css('background-color','blue');
        },

        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
            };

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchstart .data-score-row": "selectScoringRuleTouched",
                    "touchend #add-score": "incrementScoreTouched",
                    "touchend #remove-score": "decrementScoreTouched",
                    "touchmove .data-score-row": "scrollViewIsScrolling"
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "mousedown .data-score-row": "selectScoringRuleTouched",
                    "click #add-score": "incrementScoreTouched",
                    "click #remove-score": "decrementScoreTouched",
                    "mousemove .data-score-row": "scrollViewIsScrolling"
                }); 
            }
            return events_hash;
        },

        incrementScoreTouched: function(e) {
            e.preventDefault();
            Scorecard.Controller.enterScoreDataView.incrementScoreCount();
        },

        decrementScoreTouched: function(e) {
            e.preventDefault();
            Scorecard.Controller.enterScoreDataView.decrementScoreCount();
        },

        selectScoringRuleTouched: function(e) {
            // console.log('element is data-score-row: ' + $(e.target).is('.data-score-row'));

            //check if we're already selected; exit if so
            if($(e.target).closest('li').hasClass('selected-scoring-item')) return;

            var x = this;
            x.isScrolling = false;

            //clear any selections
            $('.score-data-item-list li').removeClass("transparent").removeClass('selected-scoring-item');
            Scorecard.Controller.enterScoreDataView.unsetScoringRule(e);

            //don't do anything if the use clicks on the score value as it was causing problems
            if (e.target.className === '') return;

            setTimeout(function() {
                //prevent selecting twice
                if(x.isScrolling === false) {
                    $('.score-data-item-list li').addClass("transparent").removeClass('selected-scoring-item');
                    $(e.target).closest('li').removeClass("transparent").addClass('selected-scoring-item');
                    
                    Scorecard.Controller.enterScoreDataView.setScoringRuleSelected(e, x.model);

                } 
            }, 200); 
        },

        scrollViewIsScrolling: function () {
            this.isScrolling = true;
        }
    });

    Scorecard.BreakdownItemRowView = Backbone.Marionette.ItemView.extend({
        model: BGS.Entities.Score,

        tagName: "li",

        className: 'rs-options-header font-size-20',

        getTemplate: function () {
            console.log('get breakdown item view template');
            //use getTemplate: instead of template: here to ensure we have access to our model
            return _.template(BGS.Utilities.templateLoader.get('scorecard-breakdown-list-item'));
        },

        remove: function() {
            this.undelegateEvents();
            this.unbind();
        },

        initialize: function(options) {
            // console.log('options for item view: ' + JSON.stringify(options));

            this.render();
        },

        onRender:function() {
            console.log('item view onRender');
            //disable clicking on the table as it was causing animation problems
            // $('table').attr('disabled','disabled');
            // $('table').css('background-color','blue');
        },

        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
            };

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchstart .data-score-row": "selectScoringRuleTouched",
                    "touchend #add-score": "incrementScoreTouched",
                    "touchend #remove-score": "decrementScoreTouched",
                    "touchmove .data-score-row": "scrollViewIsScrolling"
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "mousedown .data-score-row": "selectScoringRuleTouched",
                    "click #add-score": "incrementScoreTouched",
                    "click #remove-score": "decrementScoreTouched",
                    "mousemove .data-score-row": "scrollViewIsScrolling"
                }); 
            }
            return events_hash;
        },

        // incrementScoreTouched: function(e) {
        //     e.preventDefault();
        //     Scorecard.Controller.enterScoreDataView.incrementScoreCount();
        // },

        // decrementScoreTouched: function(e) {
        //     e.preventDefault();
        //     Scorecard.Controller.enterScoreDataView.decrementScoreCount();
        // },

        selectScoringRuleTouched: function(e) {
            // console.log('element is data-score-row: ' + $(e.target).is('.data-score-row'));

            //check if we're already selected; exit if so
            if($(e.target).closest('li').hasClass('selected-scoring-item')) return;

            var x = this;
            x.isScrolling = false;

            //clear any selections
            $('.score-data-item-list li').removeClass("transparent").removeClass('selected-scoring-item');
            // Scorecard.Controller.enterScoreDataView.unsetScoringRule(e);

            //don't do anything if the use clicks on the score value as it was causing problems
            if (e.target.className === '') return;

            setTimeout(function() {
                //prevent selecting twice
                if(x.isScrolling === false) {
                    $('.score-data-item-list li').addClass("transparent").removeClass('selected-scoring-item');
                    $(e.target).closest('li').removeClass("transparent").addClass('selected-scoring-item');
                    
                    // Scorecard.Controller.enterScoreDataView.setScoringRuleSelected(e, x.model);

                } 
            }, 200); 
        },

        scrollViewIsScrolling: function () {
            this.isScrolling = true;
        }
    });
});