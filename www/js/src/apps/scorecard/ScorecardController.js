BGS.module('ScorecardApp.Scorecard', function (Scorecard, BGS, Backbone, Marionette, $, _) {
    Scorecard.Controller = {

        initialize: function (options) {
            var o = {}, //populate a collections object with all our necessary collections
                s = this;

            //if the user does not have an active scorecard, show an warning message and don't query for players
            //we also have the 'userCreatedRound' option property passed in here as well should we need it
            if (options.scorecardIsActive === true) {
                //our scorecard is active
                //get player list first
                BGS.MainApp.Main.Controller.makeRequest("scorecard:player:entities")
                .then(function(players) {
                    o.players = players;
                    //once we have players, get holes
                    return BGS.MainApp.Main.Controller.makeRequest("scorecard:hole:entities");
                })
                .then(function(holes){
                    o.holes = s.holes = holes; //need to store the hole collection locally for querying later at scoring
                    //once we have holes, get scores
                    return BGS.MainApp.Main.Controller.makeRequest("scorecard:score:entities");
                    
                })
                .then(function(scores){
                    // console.log('init scores: ' + JSON.stringify(scores));
                    o.scores = s.scores = scores; //need to store the hole collection locally for querying later at scoring
                    //we've loaded holes, now show our scorecard
                    s.showScorecard(o);
                    
                },
                function(e) {
                    var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                    Parse.Analytics.track('error', { code: codeString });
                    console.log('e: ' + JSON.stringify(e));
                    BGS.MainApp.Main.Controller.hideSpinner();
                    BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops! There was an error:", e, isError = true, showAtBottom = true);
                });
            } else {
                //we don't have an active scorecard so show a warning message 
                console.log('Scorecard Controller init: user does not have an active scorecard; we should show a warning message');
                s.showNoScorecardMessage(o);
            } 
        },

        showNoScorecardMessage: function (options) {
            console.log('showNoScorecardMessage options: ' + JSON.stringify(options));
            var s = this;

            s.options = options;

            if(typeof(s.listLayout) != 'undefined') s.listLayout.close();
            s.listLayout = new Scorecard.Layout();
            
            s.listLayout.on("show", function () {
                //eventhough we don't load these until the 'show' event fires, it still seemed that a 
                //fake delay was necessary to ensure synchronous loading here so the DOM would be ready
                setTimeout(function () {
                    $('#player-region').hide();
                    $('#hole-region').hide();
                    $('#data-region').hide();

                    $('.request-error').remove(); //remove the e div if present already

                    //resize scrollview temporarily so it doesn't disable our ability to click our reload link
                    // $('#iscroll-wrapper').height('125px');
                    $('#error-region').show().height('100%!important');
                    var frag = '';

                    frag = "<div class='request-error'><br><br><br>Almost ready! <br><br>You don't have any active rounds yet! <br>To start playing Bar Golf Stars, you first need to <span id='join-round'><u>join someone else's round</u></span> or <span id='create-round'><u>create a new round</u></span> of your own.</div>";

                    // $(frag).insertAfter('#iscroll-wrapper');
                    $('#error-region').append(frag);

                    $('#join-round').on('click', function(){
                        console.log('ScorecardController showNoScorecardMessage: join round clicked');
                    });

                    $('#create-round').on('click', function(){
                        console.log('create round clicked');
                        BGS.MainApp.Main.Controller.leftPanelView.goToCreateRound();
                    });

                    //hide the View Map Button too
                    $('.right-header-button').hide().unbind();

                    BGS.MainApp.Main.Controller.hideSpinner();
                }, 0);
            });
            // return this.listLayout;

            s.showView(s.listLayout, s.noEffect());
        },

        showView: function (view, effect, cb) {
            BGS.containerRegion.show(view);
            $.isFunction(cb) && cb();
        },

        showScorecard: function (options) {
            var s = this;

            s.options = options;

            if(typeof(s.listLayout) != 'undefined') s.listLayout.close();
            s.listLayout = new Scorecard.Layout();
            
            s.listLayout.on("show", function () {
                //eventhough we don't load these until the 'show' event fires, it still seemed that a 
                //fake delay was necessary to ensure synchronous loading here so the DOM would be ready
                setTimeout(function () {
                    //for some reason, my marionette compositeviews will never render when i set the itemView
                    //from within the view's definition; i always have to pass it in first like this for some reason
                    s.scorecardPlayerList = s.scorecardPlayerListView({collection: s.options.players,
                                                                       itemView: Scorecard.PlayerRowView});

                    s.scorecardHoleNameList = s.scorecardHoleNameListView({collection: s.options.holes,
                                                                           itemView: Scorecard.HoleNameRowView});

                    s.scorecardHoleScoreList = s.scorecardHoleScoreListView({collection: s.options.players,
                                                                             scores: s.options.scores,
                                                                             itemView: Scorecard.HoleScoreRowView
                                                                             });

                    s.enterScoreDataView = s.scorecardEnterDataView(s.options);

                    //create a new instance of the bottom menu panel that will animate in and out when we select a player to edit
                    // s.manualEntryView = s.placesManualEntryView(s.options);

                    s.listLayout.playerRegion.show(s.scorecardPlayerList);
                    s.listLayout.holeNameRegion.show(s.scorecardHoleNameList);
                    s.listLayout.holeScoreRegion.show(s.scorecardHoleScoreList);
                    s.listLayout.dataRegion.show(s.enterScoreDataView);

                    $('#data-region').css('height', '80%');
                    $('#breakdown-region').css('height', '80%');

                    s.listLayout.createScrollView();

                    //used for disabling sliding view in regards to horizontal iscroll
                    document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

                    BGS.MainApp.Main.Controller.hideSpinner('');

                    //workaround to listen for side menu events to fix the bleeding through background that would occur
                    //if entering a scoring item and then opening and closing the menu; there would be ghosting of the 
                    //scorecard appearing sometimes
                    BGS.MainApp.Main.Controller.slidingPanel.sidebar.on('panelOpen', function() {
                        //dismiss the data entry view if we open fully as that's the only time the ghost was appearing
                        s.enterScoreDataView.hideDataView();
                    });

                }, 0);
            });
            // return this.listLayout;

            s.showView(s.listLayout, s.noEffect());
        },

        showEnterScoreDataView: function(e, player, holeNum) {
            console.log('holenum id: ' + holeNum);
            this.enterScoreDataView.showDataView(e, player, holeNum);
        },

        showScoringBreakdown: function (player, hole, currentScore) {
            console.log('Scorecard.Controller showScoringBreakdown:');
            var s = this,
                o = {};

            o.player = player;
            o.hole = hole;
            o.currentScore = currentScore;

            s.enterScoreDataView.hideDataView(function () {
                //callback
                // s.scoringBreakdownView = s.scorecardScoringBreakdownView(o);
                // s.listLayout.breakdownRegion.show(s.scoringBreakdownView);

                //workaround to listen for side menu events to fix the bleeding through background that would occur
                //if entering a scoring item and then opening and closing the menu; there would be ghosting of the 
                //scorecard appearing sometimes
                BGS.MainApp.Main.Controller.slidingPanel.sidebar.on('panelOpen', function () {
                    //dismiss the data entry view if we open fully as that's the only time the ghost was appearing
                    s.scoringBreakdownView.hideScoringBreakdown();
                });

                //start to load our scores for this player immediately
                s.getAllScoresForPlayerForHole(player, hole)
                .then(function (scores) {
                    //once we have our scores, show them in list form in the scoring breakdown view
                    // console.log('scores for player: ' + JSON.stringify(scores));
                    o.scores = scores;
                    s.scoringBreakdownView = s.scorecardScoringBreakdownView(o);
                    s.listLayout.breakdownRegion.show(s.scoringBreakdownView);

                }, function (e) {
                    console.log('e getting scores: ' + JSON.stringify(e));
                });
            });
        },

        getMaxHolePlayedForPlayer: function(player) {
            var s = this,
                scores = s.scores.getScoresForPlayer(player.id);
                maxNum = _.max(scores, function(score) {
                var hid = score.get('hole').id,
                    num = s.holes.get(hid).get('holeNum');
                return num;
            });

            var maxId = maxNum.get('hole').id;
            return s.holes.get(maxId).get('holeNum');
        },

        getRulesForScoring: function(ruleType) {
            var request = '',
                p = new Parse.Promise();

            if (ruleType === 'drink') {
                request = 'scorecard:rule:drink:entities';
            } else if (ruleType === 'bonus') {
                request = 'scorecard:rule:bonus:entities';
            } else {
                request = 'scorecard:rule:penalty:entities';
            }

            BGS.MainApp.Main.Controller.makeRequest(request)
                .then(function(rules){
                    return p.resolve(rules);
                },
                function(e) {
                    var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                    Parse.Analytics.track('error', { code: codeString });
                    console.log('e: ' + JSON.stringify(e));
                    return p.reject(e);
                });

            return p;
        },

        getAllScoresForPlayerForHole: function(player, hole) {
            console.log('ScorecardController getAllScoresForPlayerForHole:');
            var s = this,
                p = new Parse.Promise(),
                pid = player.id,
                hid = hole.id,
                options = {"playerId":pid, "holeId":hid};

            BGS.MainApp.Main.Controller.makeRequest("scorecard:player:scores", options)
            .then(function(success) {
                p.resolve(success);
            }, function(e) {
                console.log('error retrieving scores for player and hole');
                p.reject(e);
            });

            return p;
        },

        saveScore: function(options) {
            var p = new Parse.Promise(),
                Score = Parse.Object.extend('Score'),
                score = new Score(),
                s = this;

            //set all our current round's properties along with the scoring item stuff
            score.set('hole', options.hole);
            score.set('player', options.player);
            score.set('rule', options.rule);
            score.set('count', options.count);
            score.set('user', Parse.User.current());
            score.set('round', BGS.RSApp.RoundSetup.Controller.round);
            score.set('scorecard', BGS.RSApp.RoundSetup.Controller.scorecard);
            score.set('timeAtScore', new Date());
            var scoreACL = new Parse.ACL(Parse.User.current());
            scoreACL.setPublicReadAccess(true); //anyone can read
            score.setACL(scoreACL); //only creator can update

            score.save()
            .then(function(score) {
                //now we need to save our scoring item with our player object in the scores column relation, similar to an array
                var relation = options.player.relation('scores'),
                    oldTotal = options.player.get('totalRoundStrokes'),
                    newTotal = 0;

                //add new relation
                relation.add(score);

                //get the total stroke value of the score we just saved and update our totalRoundStrokes with it
                newTotal = oldTotal + (options.rule.get('value') * options.count);

                // console.log('oldTotal strokes: ' + oldTotal);
                // console.log('newTotal strokes: ' + newTotal);
                options.player.set('totalRoundStrokes', newTotal);
                options.player.addUnique('holesPlayed', options.hole);
                options.player.set('maxHolePlayed', s.calcMaxHolePlayed(options.player));
                options.player.set('parsInPlayTotal', s.calcParsInPlayTotal(options.player));

                return options.player.save();
            })
            .then(function(player){
                //pass our successfully saved score and player back
                p.resolve(score, player);
            },
            function(e){
                console.log('error saving player relation: ' + JSON.stringify(e));
                p.reject(e);
            });

            return p;
        },

        //use this to loop through all the holes played and add up par total
        calcParsInPlayTotal: function(player) {
            var parTotal = 0,
                arr = player.get('holesPlayed'),
                s = this;

                _.each(arr, function(hole) {
                    var par = s.holes.get(hole.id).get('par');
                    parTotal = parTotal + par;
                });

                return parTotal;
        },

        //use this to loop through all the holes played and get the highest hole played
        calcMaxHolePlayed: function(player) {
            var arr = player.get('holesPlayed'),
                s = this,

                maxHole = _.max(arr, function(hole) {
                    return s.holes.get(hole.id).get('holeNum');
                });

                return s.holes.get(maxHole.id).get('holeNum');
        },

        getHoleModel: function(holeNum) {
            var p = new Parse.Promise(),
                s = this;

            var queriedHole = s.holes.getHole(holeNum);
            var hole = new BGS.Entities.Hole();
            //extend our empty model
            _.extend(hole, queriedHole[0]); //it returns an array of models, not a single model collection
            
            if(hole instanceof BGS.Entities.Hole && typeof(hole.get('holeNum')) != 'undefined') {
                p.resolve(hole);
            } else {
                p.reject('nope');
            }

            return p;
        },

        getRuleModelbyId: function(id) {
            var dfd = $.Deferred(),
                p = dfd.promise();

            BGS.request('rule:id', id)
            .then(function(rule){
                dfd.resolve(rule);
            },
            function(e){
                console.log('e: ' + JSON.stringify(e));
                dfd.reject(e);
            });

            return p;
        },

        scorecardPlayerListView: function (options) {
            return new Scorecard.PlayerList(options);
        },

        scorecardHoleNameListView: function (options) {
            return new Scorecard.HoleNameList(options);
        },

        scorecardHoleScoreListView: function (options) {
            return new Scorecard.HoleScoreList(options);
        },

        scorecardEnterDataView: function (options) {
            return new Scorecard.ScorecardEnterDataView(options);
        },

        scorecardScoringBreakdownView: function (options) {
            return new Scorecard.ScorecardScoringBreakdownView(options);
        },

        noEffect: function () {
            return new BackStack.NoEffect();
        },

        disableEvents: function() {
            //this only gets called when we open/close sliding menu panel
            if(this.placesMapView) this.placesMapView.undelegateEvents();    
        },

        enableEvents: function() {

            //this only gets called when we open/close sliding menu panel
            if(this.placesMapView) this.placesMapView.delegateEvents();     
        }

    };
});