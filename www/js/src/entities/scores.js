BGS.module('Entities', function (Entities, BGS, Backbone, Marionette, $, _) {

//******************** HOLE MODELS ***************************************************
    Entities.Score = Parse.Object.extend({
        className: "Score",
    });

// ************************* HOLE COLLECTIONS ********************************************************
    // these are the scores currently added to the round
    // can only ever be up to 9 scores
    Entities.ScorecardScoreCollection = Parse.Collection.extend({
        model: Entities.Score,
        comparator: function(score) {
            return score.get('scoreNum');
        },

        //filter scores by player first, then use this outcome to filter by hole since we populate
        //the scorecard by player, with all holes at the same time
        getScoresForPlayer: function(playerId, holeNum) {
            var scores =  _.filter(this.models, function(model) {
                //get all scores where score.player.id matches player id 
                // return !holeNum ? model.get('player').id === playerId : model.get('player').id === playerId && model.get('holeNum') === holeNum;

                return model.get('player').id === playerId;
            });
            
            return scores;
        },

        //this is used to populate the individual fields of the scorecard
        //requires we pass in the collection of scores filtered by player 
        //this will return an array of scores for a single player and single hole only
        getScoresForHole: function(holeId, playerScores) {
            var scores =  _.filter(playerScores, function(model) {
                //get all scores where score.hole.id matches holeId
                return model.get('hole').id === holeId;
            });

            return scores;
        }
    });

    var API = {
        //@withAutomaticScoreSetup {bool} required; determine if blank course or auto setup
        //@roundId {string} optionsal; optional round.id passed in; mainly used for unit testing
        getScorecardScoreEntities: function () {
            var defer = $.Deferred(),
                p = defer.promise(),
                scores = new Entities.ScorecardScoreCollection(),
                query = new Parse.Query('Score');

            query.equalTo("scorecard", BGS.RSApp.RoundSetup.Controller.scorecard);
            scores.query = query;

            scores.fetch()
            .then(function(data) {
                defer.resolve(data);
            },
            function(e) {
                console.log('e with scores fetch: ' + JSON.stringify(data));
                defer.reject(e);
            });
           
            return p;
        },

        getScoreEntitiesForPlayerForHole: function (playerId, holeId) {
            var defer = $.Deferred(),
                p = defer.promise(),
                scores = new Entities.ScorecardScoreCollection(),
                query = new Parse.Query('Score'),
                Player = Parse.Object.extend("Player"),
                player = new Player(),
                Hole = Parse.Object.extend("Hole"),
                hole = new Hole();
             
            //in order to query on Parse Pointer objects, we have to use actual objects in our query and
            //not just ids or string values so set our newly created objects' objectIds to what we want
            //to query for
            player.set("objectId", playerId);
            hole.set("objectId", holeId);

            query.equalTo("scorecard", BGS.RSApp.RoundSetup.Controller.scorecard);
            query.equalTo("player", player);
            query.equalTo("hole", hole);

            query.find()
            .then(function(data) {
                // console.log('score fetch data returned: ' + JSON.stringify(data));
                defer.resolve(data);
            },
            function(e) {
                console.log('e with scores fetch: ' + JSON.stringify(e));
                defer.reject(e);
            });

            return p;
        },
    };

    BGS.reqres.setHandler("scorecard:score:entities", function () {
        BGS.MainApp.Main.Controller.showSpinner('Fetching scores...');
        return API.getScorecardScoreEntities();
    });

    BGS.reqres.setHandler("scorecard:player:scores", function (options) {
        var pid = options.playerId,
            hid = options.holeId;

        BGS.MainApp.Main.Controller.showSpinner('Fetching hole scores...');
        return API.getScoreEntitiesForPlayerForHole(pid, hid);
    });

});