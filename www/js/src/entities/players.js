BGS.module('Entities', function (Entities, BGS, Backbone, Marionette, $, _) {

//******************** PLAYER MODELS ***************************************************
    Entities.Round = Parse.Object.extend({
        className: "Round"
    });

    Entities.Scorecard = Parse.Object.extend({
        className: "Scorecard"
    });

    Entities.Player = Parse.Object.extend({
        className: "Player",
    });

// ************************* PLAYER COLLECTIONS ********************************************************
    // these are the players currently added to the local scorecard
    // can only ever be up to 4 players
    Entities.PlayerCollection = Parse.Collection.extend({
        model: Entities.Player,
        comparator: function(player) {
            return player.get('playerNum');
        },

        //remove any default player from display on the scorecard
        filterOutDefaultPlayer: function() {
            var players =  _.filter(this.models, function(model) {
                return model.get('displayName') != 'Touch to Add New Player';
            });

            this.reset(players);
            return this;
        }
    });

    var queryForExistingUserPlayer = function() {
        var p = new Parse.Promise(),
            query = new Parse.Query('Player');
        
        //query to see if we've already set up a user account player
        query.equalTo("isUserAccount", true);
        query.equalTo("user", Parse.User.current());
        query.find()
        .then(function (results) {
            p.resolve(results);
        }, function(e) {
            console.log('error getting player: ' + JSON.stringify(e));
            p.reject(e);
        });

        return p;
    };

    var createNewPlayerForCurrentUser = function() {
        // console.log('createNewPlayerForCurrentUser');
        var p = new Parse.Promise(),
            s = this;

            var player1 = new Entities.Player(),
            user = Parse.User.current();

            //before creating a new player for the current user, check to ensure there doesn't
            //already exist one; if there does, simple reset the pertinent fields
            queryForExistingUserPlayer()
            .then(function(results) {
                if (results.length > 0) {
                    //player for the current user already exists so update it
                    //results will be an Array object but there should only be up to 1 result
                    //that one result will be a Parse.Object for a player
                    player1 = results[0];
                    
                } else {
                    // console.log('set up the new player stuff');
                    //there is no player entry for the current user so set up some default items for the new entry
                    player1.set('user', user);
                    player1.set('displayName', user.get('displayName'));
                    player1.set('playerNum', 1);
                    player1.set('isUserAccount', true);//need this to denote a player object that's an actual user account's player
                    player1.set('handicap', 0);
                    //set security levels
                    var playerACL = new Parse.ACL(user);
                    playerACL.setPublicReadAccess(true); //anyone can read
                    player1.setACL(playerACL); //only creator can update
                }

                //we'll reset these fields every time whether player existed or not
                player1.set('round', BGS.RSApp.RoundSetup.Controller.round);
                player1.set('scorecard', BGS.RSApp.RoundSetup.Controller.scorecard);
                player1.set('maxHolePlayed', 0);
                player1.set('totalRoundStrokes', 0);
                player1.set('parsInPlayTotal', 0);
                player1.set('holesPlayed', []); //empty relation array
                
                s.playersCollection.length === 0 ? s.playersCollection.add(player1) : '';

                p.resolve();

            }, function(e) {
                //error getting player query
                console.log('e: ' + JSON.stringify(e));
                p.reject(e);
                return e;
            });  

        return p;
    };

    var addDefaultPlayer = function() {
        // console.log('addDefaultPlayerCalled');
        //we need to add dummy entries for all players that haven't been entered yet
        //however, we will not actually save those dummy entries to Parse, they're just for show
        //only add a default player if we're less than a full scorecard (4 players)
        var shouldAddNewPlayer = true,
            p = new Parse.Promise(),
            s = this; //assume yes for our flag

        //ensure we have a collection setup; probably only won't be set up if unit testing
        if(typeof (s.playersCollection) === 'undefined') s.playersCollection = new Entities.PlayerCollection();

        if(s.playersCollection.length < 4) {
            //loop through each model first to see if we already have a single dummy entry, if so return
            s.playersCollection.each(function(model) {
                // console.log('player name: ' + model.get('displayName'));
                if (model.get('displayName') === 'Touch to Add New Player') shouldAddNewPlayer = false; //set our flag to false
            });

            //check our flag now
            if (shouldAddNewPlayer === false) {
                p.resolve();
                return;
            }
            //else, it's ok to add a new default player
            var player = new Entities.Player();
            player.set('playerNum', (s.playersCollection.length + 1));
            player.set('displayName', 'Touch to Add New Player');
            player.set('handicap', 0);
            player.set('maxHolePlayed', 0);
            player.set('isUserAccount', false);
            player.set('totalRoundStrokes', 0);
            player.set('parsInPlayTotal', 0);
            player.set('holesPlayed', []); //empty relation array

            var playerACL = new Parse.ACL(Parse.User.current());
            playerACL.setPublicReadAccess(true); //anyone can read
            player.setACL(playerACL); //only creator can update

            s.playersCollection.add(player);
            
            p.resolve();
        } else {
            //just resolve
            p.resolve();
        }

        return p;
    };

    var renumberPlayers = function() {
        var s = this;

        this.playersCollection.each(function(model) {
            var index = this.playersCollection.indexOf(model);
            if (model.get('playerNum') != (index + 1)) {
                model.set('playerNum', (index + 1));
                //make sure to only save *real* players to Parse, not default dummy ones
                //check for the user field to be set to do so
                if (typeof (model.get('user')) != 'undefined') {
                    model.save()
                    .then(function(){
                        // console.log('player renumbered and saved');
                    });
                } 
            }
        });
    };

    //we'll use this as the default starting point for creating a new round
    var initializeScorecard = function (players) {
        // console.log('initializeScorecard');
        var s = this,
            p = new Parse.Promise();

        s.playersCollection = new Entities.PlayerCollection();
        s.playersCollection = players;

        //this will only actually create a player for the current user is one doesn't already exist;
        //otherwise it will return directly back here
        createNewPlayerForCurrentUser()
        .then(function() {
            addDefaultPlayer();
            //we'll asynchronously save our objects by performing ps in parallel
            // Collect one p for each delete into an array.
            var ps = [];
            s.playersCollection.forEach(function (player) {
                // console.log('player incolleciton: ' + JSON.stringify(player));
                if(player.get('isUserAccount') === true) {
                    // Start this save immediately and add its p to the list.
                    ps.push(player.save());
                }
            });
            
            // Return a new p that is resolved when all of the deletes are finished.
            return Parse.Promise.when(ps);

        })
        .then(function() {
            p.resolve(s.playersCollection);
        },
        function(e) {
            BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Error Saving Player", 'There was an error saving player. Please try your request again. If problem persists, try logging out and back in again.', isError = true, showAtBottom = true);

            console.error('Error saving player: ' + JSON.stringify(e));
            p.reject(e);
        });

        return p;
    };

    var API = {
        getAllLocalPlayerEntities: function () {
            var players = new Entities.PlayerCollection(),
                query = new Parse.Query('Player'),
                defer = $.Deferred(),
                p = defer.promise();
            query.equalTo("scorecard", BGS.RSApp.RoundSetup.Controller.scorecard);
            query.equalTo("round", BGS.RSApp.RoundSetup.Controller.round);
            
            players.query = query;

            players.fetch()
            .then(function(players) {
                // console.log('getAllLocalPlayerEntities fetched returned with players = ' + JSON.stringify(players));
                return initializeScorecard(players);   
            })
            .then(function(collection) {
                // console.log('initializeScorecard fetched returned with players = ' + JSON.stringify(collection));
                BGS.MainApp.Main.Controller.hideSpinner();
                defer.resolve(collection);
            },
            function(e) {
                console.log('e with player fetch: ' + JSON.stringify(e));
                defer.reject(e);
            });
            
            return p;
        },

        getScorecardPlayerEntities: function() {
            console.log('getScorecardPlayerEntities');
            BGS.MainApp.Main.Controller.showSpinner('Retrieving players');
            //must use a dfdred to allow for $.when(p).done use at bottom
            var dfd = $.Deferred(),
                p = dfd.promise();

            API.getAllLocalPlayerEntities()
            .then(function(results){
                // console.log('scorecard results count: ' + results.count);
                // console.log('scoreresults: ' + JSON.stringify(results));
                var players = new Entities.PlayerCollection();
                players = results.filterOutDefaultPlayer();

                // console.log('getScorecarePlayerEnttities player count = ' + players.length);
                return dfd.resolve(players);
            },
            function(e){
                return dfd.reject(e);
            });

            $.when(p).done(function() {
                BGS.MainApp.Main.Controller.hideSpinner();
            });

            return p;
        },

    };

    BGS.reqres.setHandler("scorecard:player:entities", function () {
        BGS.MainApp.Main.Controller.showSpinner();
        return API.getScorecardPlayerEntities();
    });

    BGS.reqres.setHandler("rs:player:entities", function () {
        BGS.MainApp.Main.Controller.showSpinner();
        return API.getAllLocalPlayerEntities();
    });

    BGS.reqres.setHandler("rs:player:newcurrent", function () {
        BGS.MainApp.Main.Controller.showSpinner('Loading...');
        return createNewPlayerForCurrentUser();
    });

    BGS.reqres.setHandler("rs:player:new", function () {
        BGS.MainApp.Main.Controller.showSpinner('Loading...');
        return addDefaultPlayer();
    });

    BGS.reqres.setHandler("rs:player:renumber", function () {
        BGS.MainApp.Main.Controller.showSpinner('Loading...');
        return renumberPlayers();
    });

});