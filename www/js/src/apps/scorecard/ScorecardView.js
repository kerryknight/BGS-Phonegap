BGS.module('ScorecardApp.Scorecard', function (Scorecard, BGS, Backbone, Marionette, $, _) {

    Scorecard.Layout = Backbone.Marionette.Layout.extend({

        className: 'scorecard-region',

        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('scorecard-layout'));
        },

        regions: {
            playerRegion: '#player-region',
            holeNameRegion: '#hole-name-region',
            holeScoreRegion: '#hole-score-region',
            dataRegion: '#data-region',
            breakdownRegion: '#breakdown-region',
            errorRegion: '#error-region'
        },

        remove: function () {
            console.log('scorecard layout remove');
            this.undelegateEvents();
            this.unbind();
        },

        createScrollView: function () {
            var s = this;
            //create scrollview after a slight delay to ensure DOM fully loaded,
            //a best practice per the original developer of iScroll.js
            setTimeout(function () {

                s.sv = new IScroll('#iscroll-scorecard-wrapper', {
                    scrollX: true,
                    scrollY: false
                });

                s.sv.enabled = true;

                BGS.MainApp.Main.Controller.setNavBarTitle('My Scorecard');

                //bind events to disable our sliding panel whenever we're scrolling the
                //horizontal iscroll as they conflict with each other
                $('#iscroll-scorecard-wrapper').on('touchstart', function () {
                    // console.log('slide view disable');
                    //disable the sliding view swipe when touching the scrollview
                    BGS.MainApp.Main.Controller.slidingPanel.enabled = false;
                });

                $('#iscroll-scorecard-wrapper').on('touchend', function () {
                    // console.log('slide view enable');
                    BGS.MainApp.Main.Controller.slidingPanel.enabled = true;
                });

                $('#iscroll-scorecard-wrapper').on('mousedown', function () {
                    // console.log('slide view disable');
                    //disable the sliding view swipe when touching the scrollview
                    BGS.MainApp.Main.Controller.slidingPanel.enabled = false;
                });

                $('#iscroll-scorecard-wrapper').on('mouseup', function () {
                    // console.log('slide view enable');
                    BGS.MainApp.Main.Controller.slidingPanel.enabled = true;
                });
                //zebra-striping
                $('.scorecard-hole-name-list td:even').css('background-color', 'rgb(198, 205, 205)');

                //zebra-striping
                $('.scorecard-hole-score-list td:odd').css('background-color', 'rgba(57, 62, 64, 0.05)');

            }, 100);
        },
    });

    Scorecard.PlayerList = Backbone.Marionette.CompositeView.extend({

        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('scorecard-player-list'));
        },

        itemViewContainer: ".scorecard-player-list",

        modelEvents: {
            "change": "modelChanged"
        },

        collectionEvents: {
            "add": "modelAdded"
        },

        modelChanged: function () {
            console.log('Scorecard.PlayerList modelChanged');
        },

        modelAdded: function () {
            console.log('Scorecard.PlayerList modelAdded');
        },

        initialize: function (options) {
            // console.log('Scorecard.PlayerList initialize');
            var $playerList = $("scorecard-player-list");
            $playerList.html(""); //clear the list out
            $playerList.css('height', 0);
            $playerList = null; //m.m.
        },

        onRender: function () {
            //zebra striping
            setTimeout(function () {
                $('.scorecard-player-list li:even table').addClass('even-gray');
            }, 0);
        },

        remove: function () {
            console.log('player list remove');
            this.undelegateEvents();
            this.unbind();
        },
    });

    Scorecard.HoleNameList = Backbone.Marionette.CompositeView.extend({

        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('scorecard-hole-name-list'));
        },

        itemViewContainer: ".scorecard-hole-name-list",

        modelEvents: {
            "change": "modelChanged"
        },

        collectionEvents: {
            "add": "modelAdded"
        },

        modelChanged: function () {
            console.log('Scorecard.HoleNameList modelChanged');
        },

        modelAdded: function () {
            console.log('Scorecard.HoleNameList modelAdded');
        },

        initialize: function (options) {
            // console.log('Scorecard.HoleList initialize');
            // console.log('Scorecard.HoleList collect: ' + JSON.stringify(this.collection));
        },

        remove: function () {
            this.undelegateEvents();
            this.unbind();
        },
    });

    Scorecard.HoleScoreList = Backbone.Marionette.CompositeView.extend({

        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('scorecard-hole-score-list'));
        },

        itemViewContainer: ".scorecard-hole-score-list",

        modelEvents: {
            "change": "modelChanged"
        },

        collectionEvents: {
            "add": "modelAdded"
        },

        modelChanged: function () {
            console.log('Scorecard.HoleScoreList modelChanged');
        },

        modelAdded: function () {
            console.log('Scorecard.HoleScoreList modelAdded');
        },

        initialize: function (options) {
            this.scores = options.scores;
        },

        remove: function () {
            this.undelegateEvents();
            this.unbind();
        },

        onRender: function () {
            this.getScoresForAllPlayers();
        },

        getScoresForAllPlayers: function () {
            var s = this;

            //this.collection is set when this view is loaded from Controller.showScorecard() 
            //and is a collection entity of players; here we loop through each player to get his scores
            this.collection.each(function (player) {
                    //get each player's scores from the s.scores collection entity
                    var ps = s.scores.getScoresForPlayer(player.id);
                    //skip over if there are no scores to begin with
                    if (ps.length > 0) {
                        s.allScoresForPlayer = 0;

                        //loop through once for each hole, 1-9
                        for (i = 1; i < 10; i++) {
                            // console.log('i='+i);
                            //get each hole model by number, 1-9
                            Scorecard.Controller.getHoleModel(i)
                            .then(function (hole) {
                                //filter our scores into collections by hole for each player
                                s.getPlayerTotalScoreForHole(hole, player);
                            });
                        }
                    }
            });
        },

        getStrokeValueForRule: function (ruleId) {
            var dfd = $.Deferred(),
                p = dfd.promise();

            BGS.request('rule:id', ruleId)
                .then(function (rule) {
                        // console.log('rule returned:' + JSON.stringify(rule))
                        dfd.resolve(rule.get('value'));
                    },
                    function (e) {
                        console.log('e: ' + JSON.stringify(e));
                        dfd.reject(e);
                    });

            return p;
        },

        getPlayerTotalScoreForHole: function(hole, player) {
            var s = this;

            if(s.scores.getScoresForPlayer(player.id).length > 0) {
                //filter our scores into collections by hole for each player
                var playerSingleHoleScores = s.scores.getScoresForHole(hole.id, s.scores.getScoresForPlayer(player.id));

                //also update the scorecard ui itself
                playerSingleHoleScores.length > 0 ? s.updateUIForHoleScores(hole, player, playerSingleHoleScores) : ''; 
            } //else do nothing
        },

        updateTotalScoreForPlayer: function(player) {
            var num = player.get('playerNum'),
                sel = '.p-row-' + num, //create our dynamic $ selector based on the playerNum
                total = player.get('totalRoundStrokes') - player.get('handicap') + player.get('parsInPlayTotal');
                s = this;

                //enter the player's total score and format it
                s.formatScoreEntry(total, sel);
        },

        updateUIForHoleScores: function (hole, player, playerSingleHoleScores) {
            //1. update the par value at top of scorecard
            var par = hole.get('par'),
                num = hole.get('holeNum'),
                sel = '.scorecard-hole-par #hole-' + num, //build selector dynamically based on par value for hole
                s = this,
                scs = playerSingleHoleScores,
                i = 0;//create our own iterator so we can keep track of what object in the scores collection we're on; _.last() is for arrays

            //this will update the par number at top of scorecard under hole name
            $(sel).html('Par ' + par + '/Handicap ' + 10 - Number(par));

            //2. update scores for each player
            var playerNum = player.get('playerNum'),
                //each row has an id of 1-4, use the playerNum as the selector
                scoreSel = 'tr#p' + playerNum + ' [data-id="' + num + '"]', //$ selector for current hole and player box
                totalScoreForHole = 0 + Number(par); //add par initially

            //now that we have at least 1 score for this player, loop through them
            _.each(scs, function (score) {
                i++; //increment our counter
                s.getStrokeValueForRule(score.get('rule').id)
                    .then(function (strokeValue) {
                        var totalRuleStrokeValue = strokeValue * score.get('count');
                        totalScoreForHole = totalScoreForHole + totalRuleStrokeValue;

                        //if we're on our last iteration of scores and gone through all holes
                        if (i === scs.length) {
                            //enter the total score for this hole now that we've gone through all scores for the hole
                            s.formatScoreEntry(totalScoreForHole, scoreSel);

                            //update the total score if we've reached the last score on the last hole played
                            if (hole.get('holeNum') === player.get('maxHolePlayed')) s.updateTotalScoreForPlayer(player);
                        } 
                    });
            });
        },

        formatScoreEntry: function(score, selector) {
            // console.log('formatScoreEntry');
            var $sel = $(selector);

            // console.log('scoreSel: ' + selector + ' and score: ' + score);

            //clear red font out
            $sel.removeClass('red-font');

            if (score < 0) {
                //under par
                $sel.html(score);
                
            } else if (score === 0 || score == 'E') {
                //even par
                $sel.html('E');
            } else if (score > 0) {
                //over par, add + and make red
                $sel.html('+' + score).addClass('red-font');
            } else {
                //no score yet
                $sel.html('--');
            }

            $sel = null; //m.m.
        }
    });

    //parent view scorecardEnterDataView and scorecardScoringBreakdownView inherit from
    Scorecard.ScorecardDataViewParent = Backbone.Marionette.ItemView.extend({

        //highlight/unhighlight big right side button
        selectItem: function (e) {
            var s = this,
                // $scb = $('#sc-back-to-scorecard');
                $scb = $(e.target);

            $scb.css({
                '-webkit-transform': 'scale3d(0.9, 0.9, 1)'
            });
            $scb.addClass('score-choice-button-active');
            setTimeout(function () {
                $scb.css({
                    '-webkit-transform': 'scale3d(1.0, 1.0, 1)' //this is the Scorecard Breakdown button
                });
                $scb.removeClass('score-choice-button-active');

                $scb = null; //m.m.
            }, 500);
        },

        enableAddScoreBtn: function() {
            //be sure to show our How Many? box and the Add Score button
            setTimeout(function(){
                $('#sc-enter-score-data').show("fast");
                $('.score-save-button').show("fast");
            },0);
        },

        disableAddScoreBtn: function() {
            //be sure to show our How Many? box and the Add Score button until a rule in the list is clicked
            setTimeout(function(){
                $('#sc-enter-score-data').hide("fast");
                $('.score-save-button').hide("fast");
            },0);
        },

        //hides entire data view
        hideSelf: function (cb, el) {
            var $dataRegion = $(el),
                s = this;

            //disable the How Many? and Add Score button
            s.disableAddScoreBtn();

            $('#player-region').css('opacity', '1.0');
            $('#iscroll-scorecard-wrapper').css('opacity', '1.0');

            $dataRegion.slideUp(200, function() {
                // $(el).html('');//clear the DOM node
                $.isFunction(cb) && cb();
                s.dataViewIsShowing = false;
            }); //slide up seems reversed

            $dataRegion = null;//m.m.
        },

        validateForm: function () {
            var isValidated = true;

            if ($('#score-count').closest('input').hasClass('e')) {
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Quantity not entered", "Looks like you forgot to put in how many scoring items you want to add under 'How Many?' This should be a positive whole number.", isError = true, showAtBottom = true);
                isValidated = false;
                return isValidated;
            }

            if (Number($('#score-count').val()) <= 0) {
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Scoring item quantity error", "When you enter how many scoring items you wish to add, please enter a positive whole number. If you wish to delete a scoring item, go to Scoring Breakdown.", isError = true, showAtBottom = true);
                isValidated = false;
                return isValidated;
            }

            if (typeof (this.rule) == 'undefined' || !this.rule) { //will check for null or undefined
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("No scoring item selected", "Please select a scoring item from the list above and enter how many you wish to add for it.", isError = true, showAtBottom = true);
                isValidated = false;
                return isValidated;
            }

            return isValidated;
        },
    });

    Scorecard.ScorecardEnterDataView = Scorecard.ScorecardDataViewParent.extend({
        className: 'scorecard-enter-score-data',

        getTemplate: function () {
            return _.template(BGS.Utilities.templateLoader.get('scorecard-enter-score-data'));
        },

        initialize: function (options) {
            // console.log('ScorecardEnterDataView init');
            this.dataViewIsShowing = false;
            var s = this;

            Scorecard.Controller.getRulesForScoring('drink')
                .then(function (rules) {
                    s.collection = rules;
                    //set our header
                    $('.subheader-name').html('Drink Name');
                });
        },

        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
                'keypress input[type=number]': 'saveOnEnter'
            };

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchend .score-save-button": "saveScoreClicked",
                    "touchend .score-cancel-button": "hideDataView",
                    "touchend .score-drink-button": "showDrinksClicked",
                    "touchend .score-bonus-button": "showBonusesClicked",
                    "touchend .score-penalty-button": "showPenaltiesClicked",
                    "touchend #sc-scoring-breakdown": "scoringBreakdownClicked",
                    "touchstart #sc-scoring-breakdown": "selectItem",
                    "touchstart .score-choice-button": 'highlightItem'
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "click .score-save-button": "saveScoreClicked",
                    "click .score-cancel-button": "hideDataView",
                    "click .value-link": "valueExplanationClicked",
                    "click .score-drink-button": "showDrinksClicked",
                    "click .score-bonus-button": "showBonusesClicked",
                    "click .score-penalty-button": "showPenaltiesClicked",
                    "click #sc-scoring-breakdown": "scoringBreakdownClicked",
                    "mousedown #sc-scoring-breakdown": "selectItem",
                    "mousedown .score-choice-button": 'highlightItem'
                });
            }
            return events_hash;
        },

        saveOnEnter: function (e) {
            //check if we hit the enter key, which will allow us to submit as well
            if (e.keyCode != 13) return;
            e.preventDefault();
            this.saveScoreClicked(e);
        },

        saveScoreClicked: function (e) {
            $('input:focus').blur(); //to dismiss the keyboard

            var s = this,
                o = {};

            if (!s.validateForm()) {
                return;
            }

            //create our options object to pass to our controller for saving
            o.player = s.player;
            o.hole = s.hole;
            o.rule = s.rule;
            o.count = Number($('#score-count').val());

            var strokes = o.count * o.rule.get('value'),
                msg = "This will add " + strokes + " strokes to this player's score."; 

            confirm({
                    header: "Are you sure?",
                    message: msg,
                    confirmButton: "Yes",
                    cancelButton: "Cancel"
                    },
                    function () {
                        BGS.MainApp.Main.Controller.showSpinner();
                        Scorecard.Controller.saveScore(o)
                            .then(function (score, player) {
                                    //reset player
                                    o.player = player;
                                    //update our ui with the added scoring value
                                    s.addScoreToTotal(score);
                                    //reset our data view back to default appearance
                                    s.resetDataView();
                                    BGS.MainApp.Main.Controller.hideSpinner();

                                    //ROADMAP  get a random success message from a success message table in parse and use that here
                                    BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Success!", 'This score was successfully added. Touch the Done button when finished adding scores for this player.', isError = false, showAtBottom = true);
                                },
                                function (e) {
                                    BGS.MainApp.Main.Controller.hideSpinner();
                                    BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Error Saving Score", JSON.stringify(e) + ' Please try again.', isError = true, showAtBottom = true);
                                });
                    }
                );
        },

        //this adds the newly saved rule's total value to whatever's already
        //been added for this hole in the data entry view
        addScoreToTotal: function (score) {
            var s = this,
                scoreCt = score.get('count'),
                scorePlayerId = score.get('player').id;
            ruleId = score.get('rule').id,
            sId = s.player.id,
            par = s.hole.get('par'),
            $scoreBox = $('#scorecard-total-score'),
            // ct = $scoreBox.html() != '--' ? Number($scoreBox.html()) + par : 0,
            scoreSel = 'tr#p' + s.player.get('playerNum') + ' [data-id="' + s.hole.get('holeNum') + '"]'; //$ selector for current hole and player box

            if (sId != scorePlayerId) return;

            Scorecard.Controller.getRuleModelbyId(ruleId)
                .then(function (rule) {
                    var value = rule.get('value'),
                        newTotalToAdd = Number(value * scoreCt),
                        curTotal = 0;

                    setTimeout(function () {
                        $scoreBox.stop().animate({
                            fontSize: '46px'
                        }, 100, null, function () {

                            //determine our current hole total strokes; if our current score is not listed as '--', 
                            //we've added in par already so remove par; 
                            if ($scoreBox.html() == '--') {
                                //we haven't played this hole yet so par has not been added to the score, no need to remove
                                curTotal = 0;
                            } else if($scoreBox.html() == 'E') {
                                //remove par when we're at even
                                curTotal = -par;
                            } else {
                                //above or below par and par has been added; 
                                curTotal = Number($scoreBox.html()) - par;
                            }

                            //set the new total; adding par back in
                            var newTotal = Number(curTotal + newTotalToAdd + par);

                            if(newTotal < 0) {
                                $scoreBox.html(newTotal);
                                //also, update the score in the pertinent entry box on the scorecard itself
                                Scorecard.Controller.scorecardHoleScoreList.formatScoreEntry(newTotal, scoreSel);
                            } else if(newTotal === 0) {
                                //if we're even par, show an 'E' instead of 0
                                $scoreBox.html('E');
                                //also, update the score in the pertinent entry box on the scorecard itself
                                Scorecard.Controller.scorecardHoleScoreList.formatScoreEntry('E', scoreSel);
                            } else {
                                //over par
                                $scoreBox.html('+' + newTotal);
                                //also, update the score in the pertinent entry box on the scorecard itself
                                Scorecard.Controller.scorecardHoleScoreList.formatScoreEntry(newTotal, scoreSel);
                            }

                            $scoreBox.stop().animate({
                                fontSize: '40px'
                            }, 200);

                            //also, update our player total on the scorecard view
                            Scorecard.Controller.scorecardHoleScoreList.updateTotalScoreForPlayer(s.player);

                            $scoreBox, curTotal, newTotalToAdd, newTotal = null; //m.m.
                        });
                    }, 100);
                });
        },

        resetDataView: function () {
            //reset how many score count back to 1
            $('#score-count').val(1);
            $('.score-data-item-list li').removeClass("transparent").removeClass('selected-scoring-item');
            this.unsetScoringRule();
        },

        remove: function () {
            this.undelegateEvents();
            this.unbind();
        },

        highlightItem: function (e) {
            var s = this;
            setTimeout(function () {
                $('.topcoat-button div').css({
                    '-webkit-transform': 'scale3d(1.0, 1.0, 1)'
                });
                $('.topcoat-button').removeClass('score-choice-button-active');
                $(e.target).closest('.topcoat-button div').css({
                    '-webkit-transform': 'scale3d(0.9, 0.9, 1)'
                });
                $(e.target).closest('.topcoat-button').addClass('score-choice-button-active');
            }, 0);
        },

        showDrinksClicked: function (e) {
            var s = this;
            Scorecard.Controller.getRulesForScoring('drink')
                .then(function (rules) {
                    BGS.MainApp.Main.Controller.showSpinner();
                    s.dataViewList.collection = rules;
                    s.dataViewList.render();
                    //refresh wasn't working so null and recreate
                    s.createDataScrollView();
                    //set our header
                    $('.subheader-name').html('Drink Name');
                });
        },

        showBonusesClicked: function (e) {
            var s = this;
            Scorecard.Controller.getRulesForScoring('bonus')
                .then(function (rules) {
                    BGS.MainApp.Main.Controller.showSpinner();
                    s.dataViewList.collection = rules;
                    s.dataViewList.render();
                    //refresh wasn't working so null and recreate
                    s.createDataScrollView();
                    //set our header
                    $('.subheader-name').html('Bonus Name');
                });
        },

        showPenaltiesClicked: function (e) {
            var s = this;
            Scorecard.Controller.getRulesForScoring('penalty')
                .then(function (rules) {
                    BGS.MainApp.Main.Controller.showSpinner();
                    s.dataViewList.collection = rules;
                    s.dataViewList.render();
                    //refresh wasn't working so null and recreate
                    s.createDataScrollView();
                    //set our header
                    $('.subheader-name').html('Penalty Name');
                });
        },

        scoringBreakdownClicked: function (e) {
            Scorecard.Controller.showScoringBreakdown(this.player, this.hole, $('#scorecard-total-score').html());
        },

        setScoringRuleSelected: function (e, model) {
            var s = this;
            //this is called from the item view for each of the scoring item rules in the choose score type list;
            s.rule = model;
            setTimeout(function(){
                s.enableAddScoreBtn();
                s.showAddRemoveButtons(e);
            },0);
        },

        unsetScoringRule: function (e) {
            var s = this;
            this.rule = null;
            setTimeout(function(){
                s.disableAddScoreBtn();
                s.hideAddRemoveButtons(e);
            },0);
        },

        incrementScoreCount: function () {
            var $count = $('#score-count');
            ct = $count.val();
            ct++; //add 1

            this.animateCount(ct);
            $count, ct = null; //m.m.
        },

        decrementScoreCount: function () {
            var $count = $('#score-count');
            ct = $count.val();
            if (ct > 0) ct--; //subtract 1
            this.animateCount(ct);
            $count, ct = null; //m.m.
        },

        animateCount: function (ct) {
            var $count = $('#score-count');
            setTimeout(function () {
                // var size = $score.css(fontSize);
                $count.stop().animate({
                    fontSize: '20px'
                }, 50, null, function () {
                    //set the new total
                    $count.val(ct);
                    $count.stop().animate({
                        fontSize: '18px'
                    }, 100);
                });
            }, 0);
        },

        showAddRemoveButtons: function (e) {
            var s = this;

            setTimeout(function() {
                //get initial width of row so we can reset it
                var $textBox = $(e.target).is('.data-score-row') === true ? $(e.target).find('.data-score-item-name') : $(e.target).closest('.data-score-item-name'),
                    $valueBox = $textBox.next(), //get the sibling div
                    $table = $textBox.next('table'), //get the table
                    $minus = $table.find('#remove-score');

                if (typeof ($minus) == 'undefined' || !$minus || $minus === [] || $minus === {}) return;

                s.didAnimateIn = false;

                //only animate the buttons if they're offscreen
                if (!$minus.isOnScreen()) {
                    s.didAnimateIn = true;
                    s.w = $textBox.width();
                    s.e = e; //remember our target

                    $textBox.animate({
                        width: '145%'
                    }, 'fast');
                }

                $textBox, $valueBox, $table, $minus = null; //m.m.
            }, 100);
        },

        hideAddRemoveButtons: function (e) {
            var s = this;
            setTimeout(function() {
                if (typeof (s.e) != 'undefined' && s.didAnimateIn === true) {
                    $('.data-score-item-name').animate({
                        width: '' + s.w
                    }, 'fast');
                }
            },0);
        },

        createDataScrollView: function (elementToScroll, bottomOffset, cb) {
            var s = this;

            //hide the list while we refresh so we don't see the score values formatting themselves
            $('.score-data-item-list').css('visibility', 'hidden');
            //create scrollview after a slight delay to ensure DOM fully loaded,
            //a best practice per the original developer of iScroll.js
            setTimeout(function () {
                if (typeof (s.sv) != 'undefined') s.sv = null;
                s.sv = new IScroll('#iscroll-score-data-wrapper', {
                    mouseWheel: true,
                    tap: true,
                    bottomOffset: bottomOffset //knightka 21Aug2013 added this options to iscroll5.js
                });

                s.sv.enabled = true;
                s.refreshScrollView();

                $.isFunction(cb) && cb();

            }, 100);
        },

        refreshScrollView: function () {
            // console.log('refreshScrollview');
            var s = this;
            setTimeout(function () {
                // s.sv.refresh();
                var containerHeight = parseInt($('#data-region').css('height'), 10), //strip out 'px' from css property
                    headerHeight = parseInt($('.form-data-table-header').css('height'), 10), //strip out 'px' from css property
                    footerHeight = parseInt($('.form-data-table-footer').css('height'), 10),
                    containerWidth = parseInt($('#data-region').css('width'), 10), //strip out 'px' from css property
                    scrollerHeight = containerHeight - (headerHeight + footerHeight);

                $('#iscroll-score-data-wrapper').css('height', scrollerHeight);
                $('.form-data-row').css('height', (scrollerHeight - 2)); //slight correction

                // s.sv.refresh();

                //make sure we can see whatever we clicked on
                var max = $('.rs-list').height();
                s.sv.maxScrollY = (-max + headerHeight + footerHeight - 32); //add some buffer (30 for green bar)

                var w = '' + containerWidth - 110; //icon width + score value width = 90
                $('.data-score-item-name').css('width', w);

                containerHeight, headerHeight, footerHeight, scrollerHeight, max = null; //memory management
                s.sv.refresh();

                $('.score-data-item-list').css('visibility', 'visible');

                //reset our how many count to 1
                $('#score-count').val(1);

                //use this function to check if our scrollview list loaded but without any data so we can 
                //attempt to load it again; this seemed to happen sporadically during development
                function isEmpty(el) {
                    // console.log('isEmpty: ' + !$.trim(el.html()));//true or false
                    return !$.trim(el.html());
                }

                //do a check to make sure our scrollview properly populated; if it didn't, attempt refresh
                s.attempts = 1;
                setTimeout(function () {
                    if (s.attempts > 0 && isEmpty($('.score-data-item-list'))) {
                        console.log('scrollview did not populate correctly; refreshing...');
                        s.sv.refresh();
                        s.attempts = s.attempts - 1;
                    }

                    setTimeout(function() {
                        //zebra stripe
                        $('.score-data-item-list li:even').addClass('lt-lt-gray');
                        //set our header text
                        $('#score-edit-heading').html('Enter ' + s.player.get('displayName') + "'s score for hole #" +s.hole.get('holeNum'));
                    },0);
                }, 200);

                s.disableAddScoreBtn();
                BGS.MainApp.Main.Controller.hideSpinner();

            }, 500);
        },

        showDataView: function (e, model, holeNum) {
            BGS.MainApp.Main.Controller.showSpinner();

            //had to set x instead of s b/c s was getting nulled by other view with s
            var x = this,
                rules = x.collection; //need to save into a local variable

            x.delegateEvents();
            x.player = model; //set our player from the selected score entry

            //reset display to showing the Drinks list anytime data entry view appears
            setTimeout(function() {
                $('.topcoat-button').removeClass('score-choice-button-active');
                $('.score-drink-button').addClass('score-choice-button-active');
                $('.subheader-name').html('Drink Name');

                //fill in our Hole Score field in our data entry view with the score entered on scorecard
                $('#scorecard-total-score').html($('tr#p' + x.player.get('playerNum') + ' [data-id="' + holeNum + '"]').html());
            },0);
            
            Scorecard.Controller.getHoleModel(holeNum)
                .then(function (selectedHole) {
                        x.hole = selectedHole; //set our hole from the selected score entry

                        x.dataViewList = new Scorecard.DataScoreTypeList({
                            itemViewContainer: ".score-data-item-list",
                            collection: rules,
                            itemView: Scorecard.DataScoreTypeRowView,
                            el: '#iscroll-score-data-wrapper',
                            template: function () {
                                return _.template(BGS.Utilities.templateLoader.get('scorecard-data-score-list'));
                            }
                        });

                        //render the list view
                        x.dataViewList.render();

                        var s = this,
                            $editScoreSpan = $('#score-edit-heading'),
                            $dataRegion = $('#data-region');
                        x.model = model;

                        setTimeout(function () {
                            x.createDataScrollView(null, 0, function () {

                                setTimeout(function () {
                                    x.refreshScrollView();
                                }, 0);

                                //disable the How Many? and Add Score button
                                x.disableAddScoreBtn();

                                setTimeout(function() {
                                    //set our header text
                                    $editScoreSpan.html('Enter ' + x.player.get('displayName') + "'s score for hole #" + x.hole.get('holeNum'));
                                },0);
                                
                                setTimeout(function () {
                                    $dataRegion.slideDown(200, function () {
                                        $('#player-region').css('opacity', '0.4');
                                        $('#iscroll-scorecard-wrapper').css('opacity', '0.4');
                                        BGS.MainApp.Main.Controller.hideSpinner();

                                        $editScoreSpan, $dataRegion = null;//m.m.
                                    }); //this seems reversed in browser for some reason
                                }, 300);
                            });
                        }, 200);
                    },
                    function (e) {
                        console.log('failed to get hole: ' + JSON.stringify(e));
                        BGS.MainApp.Main.Controller.hideSpinner();
                    });
        },

        hideDataView: function (cb, el) {
            //tell parent to hide view
            this.hideSelf(cb, '#data-region');
        }
    });

    Scorecard.ScorecardScoringBreakdownView = Scorecard.ScorecardDataViewParent.extend({
        className: 'scorecard-breakdown-score-data',

        getTemplate: function () {
            return _.template(BGS.Utilities.templateLoader.get('scorecard-scoring-breakdown-data'));
        },

        initialize: function (options) {
            // console.log('ScorecardScoringBreakdownView init o: ' + JSON.stringify(options));
            var s = this;
            s.dataViewIsShowing = false;
            s.player = options.player;
            s.hole = options.hole;
            s.currentScore = options.currentScore;
            s.scores = options.scores;
        },

        onRender: function() {
            this.showScoringBreakdown();
        },

        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
                // 'keypress input[type=number]': 'saveOnEnter'
            };

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchend .score-drink-button": "showDrinksClicked",
                    "touchend .score-bonus-button": "showBonusesClicked",
                    "touchend .score-penalty-button": "showPenaltiesClicked",
                    "touchend .score-cancel-button": "backToScorecard",
                    "touchend #sc-back-to-score-entry": "backToEnterScoreView",
                    "touchstart #sc-back-to-scorecard": "selectItem",
                    // "touchstart .score-choice-button": 'highlightItem'
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "click .score-drink-button": "showDrinksClicked",
                    "click .score-bonus-button": "showBonusesClicked",
                    "click .score-penalty-button": "showPenaltiesClicked",
                    "click .score-cancel-button": "backToScorecard",
                    "click #sc-back-to-score-entry": "backToEnterScoreView",
                    "mousedown #sc-back-to-scorecard": "selectItem",
                    // "mousedown .score-choice-button": 'highlightItem'
                });
            }
            return events_hash;
        },

        remove: function () {
            this.undelegateEvents();
            this.unbind();
        },

        highlightItem: function (e) {
            var s = this;
            setTimeout(function () {
                $('.topcoat-button div').css({
                    '-webkit-transform': 'scale3d(1.0, 1.0, 1)'
                });
                $('.topcoat-button').removeClass('score-choice-button-active');
                $(e.target).closest('.topcoat-button div').css({
                    '-webkit-transform': 'scale3d(0.9, 0.9, 1)'
                });
                $(e.target).closest('.topcoat-button').addClass('score-choice-button-active');
            }, 0);
        },

        setScoringRuleSelected: function (e, model) {
            var s = this;
            //this is called from the item view for each of the scoring item rules in the choose score type list;
            s.rule = model;
            setTimeout(function(){
                s.enableAddScoreBtn();
                s.showAddRemoveButtons(e);
            },0);
        },

        unsetScoringRule: function (e) {
            var s = this;
            this.rule = null;
            setTimeout(function(){
                s.disableAddScoreBtn();
                s.hideAddRemoveButtons(e);
            },0);
        },

        showDrinksClicked: function (e) {
            console.log('ScorecardBreakdown showDrinksClicked:');
        },

        showBonusesClicked: function (e) {
            console.log('ScorecardBreakdown showBonusesClicked:');
        },

        showPenaltiesClicked: function (e) {
            console.log('ScorecardBreakdown showPenaltiesClicked:');
            var s = this;
            Scorecard.Controller.getRulesForScoring('penalty')
                .then(function (rules) {
                    BGS.MainApp.Main.Controller.showSpinner();
                    s.dataViewList.collection = rules;
                    s.dataViewList.render();
                    //refresh wasn't working so null and recreate
                    s.createDataScrollView();
                    //set our header
                    $('.subheader-name').html('Penalty Name');
                });
        },

        // enableAddScoreBtn: function() {
        //     //be sure to show our How Many? box and the Add Score button
        //     setTimeout(function(){
        //         $('#sc-enter-score-data').show("fast");
        //         $('.score-save-button').show("fast");
        //     },0);
        // },

        // disableAddScoreBtn: function() {
        //     //be sure to show our How Many? box and the Add Score button until a rule in the list is clicked
        //     setTimeout(function(){
        //         $('#sc-enter-score-data').hide("fast");
        //         $('.score-save-button').hide("fast");
        //     },0);
        // },

        // incrementScoreCount: function () {
        //     var $count = $('#score-count');
        //     ct = $count.val();
        //     ct++; //add 1

        //     this.animateCount(ct);
        //     $count, ct = null; //m.m.
        // },

        // decrementScoreCount: function () {
        //     var $count = $('#score-count');
        //     ct = $count.val();
        //     if (ct > 0) ct--; //subtract 1
        //     this.animateCount(ct);
        //     $count, ct = null; //m.m.
        // },

        animateCount: function (ct) {
            var $count = $('#score-count');
            setTimeout(function () {
                // var size = $score.css(fontSize);
                $count.stop().animate({
                    fontSize: '20px'
                }, 50, null, function () {
                    //set the new total
                    $count.val(ct);
                    $count.stop().animate({
                        fontSize: '18px'
                    }, 100);
                });
            }, 0);
        },

        showAddRemoveButtons: function (e) {
            var s = this;

            setTimeout(function() {
                //get initial width of row so we can reset it
                var $textBox = $(e.target).is('.data-score-row') === true ? $(e.target).find('.data-score-item-name') : $(e.target).closest('.data-score-item-name'),
                    $valueBox = $textBox.next(), //get the sibling div
                    $table = $textBox.next('table'), //get the table
                    $minus = $table.find('#remove-score');

                if (typeof ($minus) == 'undefined' || !$minus || $minus === [] || $minus === {}) return;

                s.didAnimateIn = false;

                //only animate the buttons if they're offscreen
                if (!$minus.isOnScreen()) {
                    s.didAnimateIn = true;
                    s.w = $textBox.width();
                    s.e = e; //remember our target

                    $textBox.animate({
                        width: '145%'
                    }, 'fast');
                }

                $textBox, $valueBox, $table, $minus = null; //m.m.
            }, 100);
        },

        hideAddRemoveButtons: function (e) {
            var s = this;
            setTimeout(function() {
                if (typeof (s.e) != 'undefined' && s.didAnimateIn === true) {
                    $('.data-score-item-name').animate({
                        width: '' + s.w
                    }, 'fast');
                }
            },0);
        },

        createDataScrollView: function (elementToScroll, bottomOffset, cb) {
            console.log('ScoringBreakdown createDataScrollView:');
            var s = this;

            //hide the list while we refresh so we don't see the score values formatting themselves
            $('.score-data-item-list').css('visibility', 'hidden');
            //create scrollview after a slight delay to ensure DOM fully loaded,
            //a best practice per the original developer of iScroll.js
            setTimeout(function () {
                if (typeof (s.sv) != 'undefined') s.sv = null;
                s.sv = new IScroll('#iscroll-score-data-wrapper', {
                    mouseWheel: true,
                    tap: true,
                    bottomOffset: bottomOffset //knightka 21Aug2013 added this options to iscroll5.js
                });

                s.sv.enabled = true;
                s.refreshScrollView();

                $.isFunction(cb) && cb();

            }, 100);
        },

        refreshScrollView: function () {
            console.log('ScoringBreakdown refreshScrollview:');
            var s = this;
            setTimeout(function () {
                // s.sv.refresh();
                var containerHeight = parseInt($('#data-region').css('height'), 10), //strip out 'px' from css property
                    headerHeight = parseInt($('.form-data-table-header').css('height'), 10), //strip out 'px' from css property
                    footerHeight = parseInt($('.form-data-table-footer').css('height'), 10),
                    containerWidth = parseInt($('#data-region').css('width'), 10), //strip out 'px' from css property
                    scrollerHeight = containerHeight - (headerHeight + footerHeight);

                $('#iscroll-score-data-wrapper').css('height', scrollerHeight);
                $('.form-data-row').css('height', (scrollerHeight - 2)); //slight correction

                // s.sv.refresh();

                //make sure we can see whatever we clicked on
                var max = $('.rs-list').height();
                s.sv.maxScrollY = (-max + headerHeight + footerHeight - 32); //add some buffer (30 for green bar)

                var w = '' + containerWidth - 110; //icon width + score value width = 90
                $('.data-score-item-name').css('width', w);

                containerHeight, headerHeight, footerHeight, scrollerHeight, max = null; //memory management
                s.sv.refresh();

                $('.score-data-item-list').css('visibility', 'visible');

                //reset our how many count to 1
                $('#score-count').val(1);

                //use this function to check if our scrollview list loaded but without any data so we can 
                //attempt to load it again; this seemed to happen sporadically during development
                function isEmpty(el) {
                    // console.log('isEmpty: ' + !$.trim(el.html()));//true or false
                    return !$.trim(el.html());
                }

                //do a check to make sure our scrollview properly populated; if it didn't, attempt refresh
                s.attempts = 1;
                setTimeout(function () {
                    if (s.attempts > 0 && isEmpty($('.score-data-item-list'))) {
                        console.log('scrollview did not populate correctly; refreshing...');
                        s.sv.refresh();
                        s.attempts = s.attempts - 1;
                    }

                    setTimeout(function() {
                        //zebra stripe
                        $('.score-data-item-list li:even').addClass('lt-lt-gray');
                    },0);
                }, 200);

                s.disableAddScoreBtn();
                BGS.MainApp.Main.Controller.hideSpinner();

            }, 500);
        },

        showScoringBreakdown: function () {
            BGS.MainApp.Main.Controller.showSpinner();

            var s = this;

            setTimeout(function () {
                //had to set x instead of s b/c s was getting nulled by other view with s
                var $editScoreSpan = $('#score-breakdown-heading'),
                    $breakdownRegion = $('#breakdown-region');

                $breakdownRegion.slideDown(200, function () {
                    $('#player-region').css('opacity', '0.4');
                    $('#iscroll-scorecard-wrapper').css('opacity', '0.4');
                    BGS.MainApp.Main.Controller.hideSpinner();
                    s.dataViewIsShowing = true;

                    s.delegateEvents();

                    //set the data view's header info
                    $editScoreSpan.html('Hole #' + s.hole.get('holeNum') + ' Scoring Breakdown for ' + s.player.get('displayName'));

                    //set the total score box
                    $('#breakdown-total-score').html(s.currentScore);

                    $editScoreSpan, $breakdownRegion = null; //m.m.
                 
                    //build our scoring breakdown collection with various rule model properties
                    s.buildScoringBreakdownCollection()
                    .then(function(scores) {
                        
                        //and pass into our scoring breakdown view list
                        s.breakdownViewList = new Scorecard.DataScoreTypeList({
                            itemViewContainer: ".breakdown-item-list",
                            collection: s.scoresWithRules,
                            itemView: Scorecard.BreakdownItemRowView,
                            el: '#iscroll-score-breakdown-wrapper',
                            template: function () {
                                return _.template(BGS.Utilities.templateLoader.get('scorecard-breakdown-score-list'));
                            }
                        });

                        //then render the list view
                        s.breakdownViewList.render();

                        BGS.MainApp.Main.Controller.hideSpinner();
                    }, function(e) {
                        BGS.MainApp.Main.Controller.hideSpinner();

                        BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Request Failed with Error:", JSON.stringify(e) + " Please try again.", isError = true, showAtBottom = true);
                        
                        var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                        Parse.Analytics.track('error', { code: codeString });
                        console.log('e: ' + JSON.stringify(e));
                    });
                }); //this seems reversed in browser for some reason
            }, 300);
        },

        buildScoringBreakdownCollection: function() {
            var s = this,
                promises = [];
                //s.scores is an array at this point, so loop through it 
                //grabbing each model's rule pointer's id so we can look it
                //up and add the rule's name, value and type to our score
                s.scoresWithRules = new BGS.Entities.ScorecardScoreCollection();

            _.each(s.scores, function(score) {
                promises.push(Scorecard.Controller.getRuleModelbyId(score.get('rule').id)
                        .then(function(rule) {
                            //extend our current score object with the rule's name, value and type and add to collection
                            score.set('ruleName', rule.get('name'));
                            score.set('ruleType', rule.get('type'));
                            score.set('ruleValue', rule.get('value'));

                            s.scoresWithRules.add(score);

                        }, function(e){
                            console.log('e: ' + JSON.stringify(e));

                        }));
                        
            });

            return Parse.Promise.when(promises);//returns when all are done
        },

        hideScoringBreakdown: function(cb) {
            //tell parent to hide view
            this.hideSelf(cb, '#breakdown-region');
        },

        backToScorecard: function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.hideScoringBreakdown();
        },

        backToEnterScoreView: function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var s = this;
            this.hideScoringBreakdown(function() {
                Scorecard.Controller.showEnterScoreDataView(e, s.player, s.hole.get('holeNum'));
            });
        }
    });

    //this is the list of all scoring rules view that fits inside the data entry view 
    Scorecard.DataScoreTypeList = Backbone.Marionette.CompositeView.extend({

        // el: '#iscroll-score-data-wrapper',

        // template: function () {
        //     return _.template(BGS.Utilities.templateLoader.get('scorecard-data-score-list'));
        // },

        // itemViewContainer: ".score-data-item-list",

        modelEvents: {
            "change": "modelChanged"
        },

        collectionEvents: {
            "add": "modelAdded"
        },

        modelChanged: function () {
            console.log('Scorecard.DataScoreTypeList modelChanged');
        },

        modelAdded: function () {
            console.log('Scorecard.DataScoreTypeList modelAdded');
        },

        initialize: function (options) {
            var s = this;
            console.log('Scorecard.DataScoreTypeList initialize');
            s.itemViewContainer = options.itemViewContainer;
            s.collection = options.collection;
            s.delegateEvents();
            _.bindAll(this);
        },

        remove: function () {
            this.undelegateEvents();
            this.unbind();
        }
    });

});