BGS.module('RSApp.RoundSetup', function (RoundSetup, BGS, Backbone, Marionette, $, _) {
    RoundSetup.Controller = {
        initialize: function (shouldCreateNewRound) {
            // console.log('RoundSetup initialize:');
            var s = this;

            if (shouldCreateNewRound === true) {
                //at this point, the user will have confirmed they want to create a new round so do it for them
                s.createNewRound()
                    .then(function () {
                        return s.createNewScorecard();
                    })
                    .then(function () {
                            s.showRoundSetupOptions(shouldCreateNewRound = true);
                            BGS.MainApp.Main.Controller.leftPanelView.showCurrentRoundOptions();
                            BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Success!", "Your new round was successfully created.", isError = false, showAtBottom = true);
                        },
                        function (e) {
                            var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                            Parse.Analytics.track('error', { code: codeString });
                            console.log('createNewRound e = ' + JSON.stringify(e));
                            BGS.MainApp.Main.Controller.hideSpinner();
                            BGS.MainApp.Main.Controller.leftPanelView.hideCurrentRoundOptions();
                            BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops! Something happened", "Creating your new round failed. Please try again.", isError = true, showAtBottom = true);

                            //delete our round and scorecard so we can start over
                            s.round.destroy();
                            s.scorecard.destroy();
                        });
            } else {
                s.showRoundSetupOptions(shouldCreateNewRound = false);
                BGS.MainApp.Main.Controller.leftPanelView.showCurrentRoundOptions();
            }

        },

        showView: function (view, effect, cb) {
            BGS.MainApp.Main.Controller.showSpinner('Loading...');
            BGS.containerRegion.show(view);
            $.isFunction(cb) && cb();
        },

        showRoundSetupOptions: function (shouldCreateNewRound) {
            this.showView(this.roundSetupOptions({'newRound': shouldCreateNewRound}), this.noEffect());
        },

        modifyPlayers: function () {
            var s = this;
            var fetchingPlayers = BGS.request("rs:player:entities");

            $.when(fetchingPlayers).done(function(players){
                s.showView(s.roundSetupPlayerView({
                    itemView: RoundSetup.PlayerItemView,
                    collection: players
                }), s.noEffect());
            });
        },

        //also called when we press the Touch Here To Start Round button on RoundSetupOptionsView in case we didn't set up players
        getPlayers: function() {
            var s = this,
                p = new Parse.Promise();
                fetchingPlayers = BGS.request("rs:player:entities");

            $.when(fetchingPlayers).done(function(players){
                console.log('when fetchingPlayers done called');
                if (players.length > 0) {
                    p.resolve('Players available.');
                } else {
                    p.reject('No players available.');
                }
            });

            return p;
        },

        modifyHoles: function () {
            // console.log('RoundSetup.Controller modifyHoles');
            var fetchingHoles = BGS.request("scorecard:hole:entities"),
                s = this;

            $.when(fetchingHoles).done(function(holes){
                s.goToHolesView(holes); 
            }); 
        },

        //called when we press the Touch Here To Start Round button on RoundSetupOptionsView in case we didn't set up holes
        getHoles: function() {
            var s = this,
                p = new Parse.Promise();
                fetchingHoles = BGS.request("scorecard:hole:entities");

            $.when(fetchingHoles).done(function(holes){
                if (holes.length > 0) {
                    p.resolve('Holes available.');
                } else {
                    p.reject('No holes available.');
                }
            });

            return p;
        },

        modifySingleHole: function(hole) {
            setTimeout(function(){BGS.MainApp.Main.Controller.showSpinner();}, 0);
            var options = {type: 'bars',
                           shouldModifySingleHole: true,
                           refresh: true,
                           hole: hole};
            BGS.PlacesApp.Places.Controller.showBars(options);
        },

        automaticCourseSetup: function () {
            var s = this;
            //show an alert asking the user if they're sure they want to create a new round
            confirm({
                header: "Are you sure?",
                message: "This action will overwrite any current holes and scores added. Also, we'll do our best to find the nearest bars to you and populate the course automatically. However, we can't guarantee perfect results so you might wanna double-check our efforts.",
                confirmButton: "Continue",
                cancelButton: "No, cancel"
            },
            function () {
                var fetchingHoles = BGS.request("scorecard:hole:entities:automatic-setup");

                $.when(fetchingHoles).done(function(holes){
                    s.goToHolesView(holes); 
                });

                //track with Parse
                Parse.Analytics.track('automaticCourseSetup');
            }
            );
        },

        goToHolesView: function(holes) {
            this.showView(this.roundSetupHoleView({
                    itemView: RoundSetup.HoleItemView,
                    collection: holes
                }), this.noEffect());
        },

        customizeDrinks: function () {
            var s = this;
            BGS.MainApp.Main.Controller.makeRequest("round:rule:drink:entities")
            .then(function(drinks){
                s.showView(s.roundSetupRuleView({
                    itemView: RoundSetup.RuleItemView,
                    type: 'drink',
                    collection: drinks
                }), s.noEffect());
            });
        },

        customizeBonuses: function () {
            var s = this;
            BGS.MainApp.Main.Controller.makeRequest("round:rule:bonus:entities")
            .then(function(bonuses){
                s.showView(s.roundSetupRuleView({
                    itemView: RoundSetup.RuleItemView,
                    type: 'bonus',
                    collection: bonuses
                }), s.noEffect());
            });
        },

        customizePenalties: function () {
            var s = this;
            BGS.MainApp.Main.Controller.makeRequest("round:rule:penalty:entities")
            .then(function(penalties){
                s.showView(s.roundSetupRuleView({
                    itemView: RoundSetup.RuleItemView,
                    type: 'penalty',
                    collection: penalties
                }), s.noEffect());
            });
        },

        roundSetupOptions: function (options) {
            return new RoundSetup.OptionsListView(options);
        },

        roundSetupPlayerView: function (options) {
            var s = this;

            if(typeof(this.listLayout) != 'undefined') this.listLayout.close();
            this.listLayout = new RoundSetup.Layout();
            
            this.listLayout.on("show", function () {
                //eventhough we don't load these until the 'show' event fires, it still seemed that a 
                //fake delay was necessary to ensure synchronous loading here so the DOM would be ready
                setTimeout(function () {
                    //create a new instance of our Map item view adn pass in our options
                    s.roundSetupListPlayersView = new RoundSetup.ListPlayersView(options);

                    //create a new instance of the bottom menu panel that will animate in and out when we select a player to edit
                    s.roundSetupPlayerDataView = new RoundSetup.PlayerDataView();

                    $('#data-region').css('height', '60%');

                    s.listLayout.listRegion.show(s.roundSetupListPlayersView);
                    s.listLayout.dataRegion.show(s.roundSetupPlayerDataView);
                }, 0);
            });
            return this.listLayout;
        },

        roundSetupHoleView: function (options) {
            var s = this;

            if(typeof(this.listLayout) != 'undefined') this.listLayout.close();
            this.listLayout = new RoundSetup.Layout();

            this.listLayout.on("show", function () {
                //eventhough we don't load these until the 'show' event fires, it still seemed that a 
                //fake delay was necessary to ensure synchronous loading here so the DOM would be ready
                setTimeout(function () {
                    //create a new instance of our Map item view adn pass in our options
                    s.roundSetupListHolesView = new RoundSetup.ListHolesView(options);
                    s.listLayout.listRegion.show(s.roundSetupListHolesView);
                }, 0);
            });
            return this.listLayout;
        },

        roundSetupRuleView: function (options) {
            var s = this;

            if(typeof(this.listLayout) != 'undefined') this.listLayout.close();
            this.listLayout = new RoundSetup.Layout();
            
            this.listLayout.on("show", function () {
                //eventhough we don't load these until the 'show' event fires, it still seemed that a 
                //fake delay was necessary to ensure synchronous loading here so the DOM would be ready
                setTimeout(function () {
                    //create a new instance of our Map item view adn pass in our options
                    s.roundSetupListRulesView = new RoundSetup.ListRulesView(options);
                    //create a new instance of the bottom menu panel that will animate in and out when we select a player to edit
                    s.roundSetupRuleDataView = new RoundSetup.RuleDataView();

                    $('#data-region').css('height', '60%');

                    s.listLayout.listRegion.show(s.roundSetupListRulesView);
                    s.listLayout.dataRegion.show(s.roundSetupRuleDataView);
                }, 0);
            });
            return this.listLayout;
        },

        noEffect: function () {
            return new BackStack.NoEffect();
        },
        fadeEffect: function () {
            return new BackStack.FadeEffect();
        },

        savePlayer: function(model) {
            BGS.MainApp.Main.Controller.showSpinner('Saving...');
            var p = new Parse.Promise();

            model.save()
            .then(function(player) {
                // console.log('saved player controller success = ' + JSON.stringify(player));
                var addingDefaultPlayer = BGS.request("rs:player:new");
                $.when(addingDefaultPlayer).done(function(players){
                    BGS.MainApp.Main.Controller.hideSpinner();
                    return p.resolve(player);
                });
            },
            function(e) {
                var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                Parse.Analytics.track('error', { code: codeString });
                BGS.MainApp.Main.Controller.hideSpinner();
                return p.reject(e);
            });

            return p;
        },

        deletePlayer: function(model) {
            var p = new Parse.Promise();

            model.destroy()
            .then(function(result) {
                //default players will only actually be added under certain conditions here
                //otherwise, the function will return here without having done anything
                var addingDefaultPlayer = BGS.request("rs:player:new");
                $.when(addingDefaultPlayer).done(function(players){
                    console.log('deletePlayer addingDefaultPlayer returned');
                    var renumberPlayers = BGS.request("rs:player:renumber");
                    $.when(renumberPlayers).done(function(){
                        return p.resolve(result);
                    });
                });
            },
            function(e) {
                var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                Parse.Analytics.track('error', { code: codeString });
                return p.reject(e);
            });

            return p;
        },

        deleteCurrentRound: function() {
            var s = this,
                user = Parse.User.current();
            //pass our delete payload params to our Parse cloud code function; it'll take care of the rest
            Parse.Cloud.run('deleteRound', {
                'round': s.round.id 
            }, {
                success: function (result) {
                    // console.log('user is: ' + JSON.stringify(user));
                    //update our user for round info
                    user.set('currentActiveRound', null);//remove active round
                    user.save();

                    if (BGS.Utilities.isUnitTesting === false) {
                        BGS.MainApp.Main.Controller.hideSpinner();
                        BGS.MainApp.Main.Controller.leftPanelView.hideCurrentRoundOptions();
                        BGS.MainApp.Main.Controller.loadScorecardApp();
                        BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Round deleted.", "Successfully deleted round and all associated data.", isError = false, showAtBottom = true);
                    }
                    return result;
                },
                error: function (e) {
                    var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                    Parse.Analytics.track('error', { code: codeString });
                    console.log('RoundSetup.deleteCurrentRound cloud code called back e ' + JSON.stringify(e));
                    setTimeout(function() {
                        if (BGS.Utilities.isUnitTesting === false) {
                            BGS.MainApp.Main.Controller.hideSpinner();
                            BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Error", "Delete round failed with error: " + JSON.stringify(e), isError = true, showAtBottom = true);
                        }
                    }, 300);
                    return e;
                }
            });
        },

        createNewRound: function (user) {
            var this_user = Parse.User.current() || user, //user will be passed in for unit tests
                s = this,
                p = new Parse.Promise();
            Round = Parse.Object.extend("Round");
            s.round = new Round();

            s.round.set("user", this_user);
            s.round.set("title", this_user.get('displayName') + "'s Awesome Round");
            s.round.set('isPublic', false);
            s.round.set('isActive', true);
            var roundACL = new Parse.ACL(Parse.User.current());
            roundACL.setPublicReadAccess(true); //anyone can read
            s.round.setACL(roundACL); //only creator can update


            //track with Parse
            Parse.Analytics.track('createNewRound');

            //add our default rules to the new round
            BGS.MainApp.Main.Controller.makeRequest("rule:default:entities")
                .then(function (success) {
                    //create an array to hold all our default rule ids
                    var ruleArray = [];
                    success.each(function(rule) {
                        //we use this array to compare against all rules we try to pull in from the Round query
                        //only rules with ids in this array will be used in a round
                        if(typeof(rule.id) != 'undefined') ruleArray.push(rule.id);
                    });

                    s.round.set('rules', ruleArray);
                })
                .then(function() {
                    //once we have default rules, save the new round 
                    return s.round.save();
                })
                .then(function (success) {
                        p.resolve(success);

                        //update our round totals for the current user
                        this_user.increment('roundsCreated');
                        this_user.set('currentActiveRound', success); //set a pointer to our round so we can always find it
                        this_user.save();
                },
                function (e) {
                    var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                    Parse.Analytics.track('error', { code: codeString });
                    p.reject(e);
                });

            return p;
        },

        startRound: function() {
            // console.log('roundSetup.Controller startRound');
            BGS.MainApp.Main.Controller.showSpinner('Starting round...');
            var p = new Parse.Promise(),
                s = this;

            //before we can start a round, we need to ensure we have set up at least 1 player, our 9 holes
            //and pulled down our default rules
            BGS.MainApp.Main.Controller.showSpinner('Percolating...');
            s.getPlayers()
            .then(function(){
                BGS.MainApp.Main.Controller.showSpinner('Oiling widgets...');
                //we successfully have set up player
                return s.getHoles();
            })
            .then(function() {
                BGS.MainApp.Main.Controller.showSpinner('Scratching itches...');
                //we have successfully set up holes
                //to start a round, all we have to do is set the startDate field and save
                s.round.set('startDate', new Date());
                return s.round.save();

            })
            .then(function(success){
                console.log('startRound saveRound returned');
                setTimeout(function(){
                    BGS.MainApp.Main.Controller.loadScorecardApp();
                    BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Success!", "Your new round was successfully created. Share round ID: " + success.id + ' with other players for them to join your round.', isError = false, showAtBottom = true);
                    BGS.MainApp.Main.Controller.hideSpinner();
                    p.resolve(success);

                    //track with Parse
                    Parse.Analytics.track('startRound');

                }, 100);
            },
            function(e){
                console.log('starting round failed with error: ' + JSON.stringify(e));
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops! Something happened", "Starting your round failed. Please try again.", isError = true, showAtBottom = true);
                BGS.MainApp.Main.Controller.hideSpinner();
                p.reject(e);
                var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                Parse.Analytics.track('error', { code: codeString });
            });

            return p;
        },

        createNewScorecard: function (user) {
            var this_user = Parse.User.current() || user, //user will be passed in for unit tests
                s = this,
                p = new Parse.Promise();
            Scorecard = Parse.Object.extend("Scorecard");
            s.scorecard = new Scorecard();

            console.log('Be sure to verify the scorecard creator and the round creator can modify/save the scorecard so it can be set to inactive if round creator deletes round or creates new one.');
            s.scorecard.set("user", this_user);
            s.scorecard.set('round', s.round);
            s.scorecard.set('isActive', true);
            var scACL = new Parse.ACL(Parse.User.current());
            scACL.setPublicReadAccess(true); //anyone can read
            scACL.setWriteAccess(this_user, true); //current user has write access
            scACL.setWriteAccess(s.round.get('user'), true); //round creator has write access
            s.scorecard.setACL(scACL); //only creator can update

            s.scorecard.save()
            .then(function (success) {
                p.resolve(success);
            },
            function (e) {
                p.reject(e);
                var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                Parse.Analytics.track('error', { code: codeString });
            });

            return p;
        },

        saveRule: function(model) {

            BGS.MainApp.Main.Controller.showSpinner('Saving...');
            var p = new Parse.Promise(),
                s = this;

            model.save()
            .then(function(){
                //we need to add the saved model's id to the Round.rules array if it's a new one
                if(typeof(s.round.get('rules')) == 'undefined') return;
                s.round.addUnique('rules', model.id);
                return s.round.save();
            })
            .then(function(rule) {
                if(model.get('type') === 'drink') {
                    return BGS.MainApp.Main.Controller.makeRequest("round:rule:drink:entities");
                } else if (model.get('type') === 'bonus') {
                    return BGS.MainApp.Main.Controller.makeRequest("round:rule:bonus:entities");
                } else {
                    return BGS.MainApp.Main.Controller.makeRequest("round:rule:penalty:entities");
                }
            })
            .then(function(success) {
                //for unit testing purposes
                if(BGS.Utilities.isUnitTesting === false) {
                    s.roundSetupListRulesView.collection = success;
                    s.roundSetupListRulesView.render(); //for some reason, view wasn't binding to collection events so manually re-render
                } 
                return p.resolve(success);
            },
            function(e) {
                BGS.MainApp.Main.Controller.hideSpinner();
                var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                Parse.Analytics.track('error', { code: codeString });
                return p.reject(e);
            });

            return p;
        },

        deleteRule: function(model) {
            var p = new Parse.Promise(),
                s = this,
                modelId = model.id,
                modelType = model.get('type');

            //remove deleted model's id from Round.rules array
            this.round.remove('rules', modelId);
            //now save the round
            this.round.save()
            .then(function(){
                //once we successfully removed model id from round.rules array and saved round, attempt to delete the rule its
                return model.get('isDefault') !== true ? model.destroy() : ''; //only delete non-default models
            })
            .then(function() {
                if(modelType === 'drink') {
                    return BGS.MainApp.Main.Controller.makeRequest("round:rule:drink:entities");
                } else if (modelType === 'bonus') {
                    return BGS.MainApp.Main.Controller.makeRequest("round:rule:bonus:entities");
                } else {
                    return BGS.MainApp.Main.Controller.makeRequest("round:rule:penalty:entities");
                }
            })
            .then(function(success) {
                if(BGS.Utilities.isUnitTesting === false) {
                    s.roundSetupListRulesView.collection = success;
                    s.roundSetupListRulesView.render(); //for some reason, view wasn't binding to collection events so manually re-render
                } 
                return p.resolve(success);
            },
            function(e) {
                BGS.MainApp.Main.Controller.hideSpinner();
                var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                Parse.Analytics.track('error', { code: codeString });
                return p.reject(e);
            });

            return p;
        },

        resetDefaultScoring: function() {
            var s = this,
                p = new Parse.Promise();

            //clear the Round.rules array first (so we don't accidentally filter by it)
            this.round.unset('rules');
            //once we've cleared the round.rules array, reset defaults as they compare against that array
            BGS.MainApp.Main.Controller.makeRequest("rule:default:entities", defaultsOnly = true)
            .then(function(success){
                console.log('RS Controller success count for reset: ' + success.length);
                //create an array to hold all our default rule ids
                    var ruleArray = [];
                    success.each(function(rule) {
                        //we use this array to compare against all rules we try to pull in from the Round query
                        //only rules with ids in this array will be used in a round
                        if(typeof(rule.id) != 'undefined') ruleArray.push(rule.id);
                    });

                    s.round.set('rules', ruleArray);
                    //save our array back to Parse
                    return s.round.save();
            })
            .then(function(success) {
                if(BGS.Utilities.isUnitTesting === false) {
                    BGS.MainApp.Main.Controller.hideSpinner();
                    BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Success!", "Custom scoring has been reset to default values.", isError = false, showAtBottom = true);
                }
                return p.resolve(success);
            },
            function(e) {
                var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                Parse.Analytics.track('error', { code: codeString });
                if(BGS.Utilities.isUnitTesting === false) {
                    BGS.MainApp.Main.Controller.hideSpinner();
                    BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops! Something happened", "Resetting defaults failed. Please try again.", isError = true, showAtBottom = true);
                }
                return p.reject(e);
            });

            return p;
        },

        disableEvents: function() {
            //this only gets called when we open/close sliding menu panel
            if(this.roundSetupListHolesView) this.roundSetupListHolesView.undelegateEvents();
            if(this.roundSetupListPlayersView) this.roundSetupListPlayersView.undelegateEvents(); 
            if(this.roundSetupPlayerDataView) this.roundSetupPlayerDataView.undelegateEvents();  
        },

        enableEvents: function() {
            //this only gets called when we open/close sliding menu panel
            if(this.roundSetupListHolesView) this.roundSetupListHolesView.delegateEvents();
            if(this.roundSetupListPlayersView) this.roundSetupListPlayersView.delegateEvents(); 
            if(this.roundSetupPlayerDataView) this.roundSetupPlayerDataView.delegateEvents();  
        }
    };
});