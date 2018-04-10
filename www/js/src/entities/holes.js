BGS.module('Entities', function (Entities, BGS, Backbone, Marionette, $, _) {

//******************** HOLE MODELS ***************************************************
    Entities.Hole = Parse.Object.extend({
        className: "Hole",
    });

// ************************* HOLE COLLECTIONS ********************************************************
    // these are the holes currently added to the round
    // can only ever be up to 9 holes
    Entities.ScorecardHoleCollection = Parse.Collection.extend({
        model: Entities.Hole,
        comparator: function(hole) {
            return hole.get('holeNum');
        },

        //this is used for querying the hole to insert player scores for
        getHole: function(holeNum) {
            var hole =  _.filter(this.models, function(model) {
                return model.get('holeNum') === holeNum;
            });

            var selectedHole = new Entities.Hole();
            selectedHole = hole;

            return selectedHole;
        }
    });

    //we'll use this as the default starting point for creating a new round's course
    var initializeCourse = function (holes) {
        var holesCollection = new Entities.ScorecardHoleCollection();
            holesCollection = holes,
            user = Parse.User.current();

        //we'll create entries for all 9 bars/holes initially; unlike our default
        //starting point for holes, we *will* save all 9 holes to Parse as it's not important
        //if the user never chooses an actual location for the bar/hole
        //if we're doing automatic setup, hopefully we've got 9 bars already setup as holes so
        //we'll skip right over this setup of default bars altogether
        for(i = (holesCollection.length + 1); i < 10; i++) {
            var hole = new Entities.Hole();
            hole.set('holeNum', i);
            hole.set('name', 'Hole Name Not Added Yet');
            hole.set('par', 1); //default is par 1
            hole.set('timeAtHole', 1800000); //default to 30 minutes 
            hole.set('location', new Parse.GeoPoint()); //will add 0,0 coordinates
            hole.set('round', BGS.RSApp.RoundSetup.Controller.round);
            hole.set('user', user);
            var holeACL = new Parse.ACL(user);
            holeACL.setPublicReadAccess(true); //anyone can read
            hole.setACL(holeACL); //only creator can update

            holesCollection.add(hole);
        }

        holesCollection.forEach(function (hole) {
            if(hole.get('user') === user) {
                hole.save()//save to Parse
                .then(function(){
                    // console.log('hole saved');
                },
                function(e) {
                    console.log('e saving hole: ' + JSON.stringify(e));
                    BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Error Saving Hole", 'There was an error setting up hole ' + hole.get('holeNum') + '. Be sure to select that hole and attempt saving again manually.', isError = true, showAtBottom = true);
                });
            }
        });
        return holesCollection.models;
    };

    var deleteCurrentCourse = function(roundId) {
        //round id potentially passed in while unit testing
        var round = BGS.RSApp.RoundSetup.Controller.round.id || roundId;

        console.log('deleteCurrentCourse called for');
        var p = new Parse.Promise();

        Parse.Cloud.run('deleteAllHolesForRound', {
            'round': round 
        }, {
            success: function (result) {
                p.resolve(round); //keep passing round's id through for auto setup testing
            },
            error: function (e) {
                p.reject(e);
            }
        });

        return p;
    };

    var parseFoursquarePlacesIntoHoles = function(places, roundId) {
        var holesCollection = new Entities.ScorecardHoleCollection(),
            user = Parse.User.current(),
            round = BGS.RSApp.RoundSetup.Controller.round || roundId;
            

        places.forEach(function(place) {
            var hole = new Entities.Hole(),
                location = new Parse.GeoPoint({latitude: place.get('location').lat, longitude: place.get('location').lng});

            hole.set('holeNum', (places.indexOf(place) + 1));
            hole.set('name', place.get('name'));
            hole.set('location', location);
            hole.set('par', 1); //default is par 1
            hole.set('timeAtHole', 1800000); //default to 30 minutes 
            hole.set('round', round);
            hole.set('user', user);
            var holeACL = new Parse.ACL(Parse.User.current());
            holeACL.setPublicReadAccess(true); //anyone can read
            hole.setACL(holeACL); //only creator can update

            holesCollection.add(hole);
        });

        holesCollection.reset(holesCollection.first(9)); //we only want up to 9 holes

        return holesCollection;
    };

    var getFoursquareBars = function(roundId) {
        var p = new Parse.Promise();

        var options = {searchType: 'bars',
                       refresh: true,
                       showAddressBar: false};

        BGS.PlacesApp.Places.Controller.queryFoursquarePlaces(options, function (status, places) {
            if (status === 'success') {
                return p.resolve(places, roundId);//roundId just passing through for unit testing
            } else {
                //it's an error status from foursquare
                return p.reject(status);
            }
        });

        return p;
    };

    var automaticHoleSetup = function(roundId) {
        var p = new Parse.Promise();

        //always delete any pre-existing holes first
        deleteCurrentCourse(roundId)
        .then(function(roundId) {
            return getFoursquareBars(roundId);
        })
        .then(function(places, roundId) {
            return parseFoursquarePlacesIntoHoles(places, roundId);
        })
        .then(function(holes) {
            p.resolve(holes);
        }, 
        function(e) {
            p.reject(e);
        });

        return p;
    };

    var getSavedHoles = function() {
        var p = new Parse.Promise();
            holes = new Entities.ScorecardHoleCollection(),
            query = new Parse.Query('Hole');

        query.equalTo("user", Parse.User.current());
        query.equalTo("round", BGS.RSApp.RoundSetup.Controller.round);
        holes.query = query;

        holes.fetch()
        .then(function(data) {
                return p.resolve(data);
            },
            function(e) {
                console.log('e with holes fetch: ' + JSON.stringify(data));
                return p.reject(e);
            });
        return p;
    };

    var API = {
        //@withAutomaticHoleSetup {bool} required; determine if blank course or auto setup
        //@roundId {string} optionsal; optional round.id passed in; mainly used for unit testing
        getScorecardHoleEntities: function (withAutomaticHoleSetup, roundId) {
            var defer = $.Deferred(),
                p = defer.promise();

            //based on the value passed in, either fetch any saved bars from Parse or 
            //query foursquare's bar finder and then process those results into holes that 
            //well pass back in here as 'data'
            //little trick to conditionally choose between 2 functions to run without running them first
            var queryToRun = withAutomaticHoleSetup === false ? getSavedHoles : automaticHoleSetup;
            queryToRun(roundId)
            .then(function(data) {
                defer.resolve(data);
            },
            function(e) {
                console.log('e with holes fetch: ' + JSON.stringify(data));
                defer.reject(e);
            });
            
            $.when(p).done(function (holes) {
                //set up all 9 initial holes
                var models = initializeCourse(holes);
                holes.reset(models);

                BGS.MainApp.Main.Controller.hideSpinner();
            });
            return p;
        },
    };

    BGS.reqres.setHandler("scorecard:hole:entities", function () {
        BGS.MainApp.Main.Controller.showSpinner();
        return API.getScorecardHoleEntities(withAutomaticHoleSetup = false);
    });

    BGS.reqres.setHandler("scorecard:hole:entities:automatic-setup", function (roundId) {
        BGS.MainApp.Main.Controller.showSpinner('Setting up...');
        return API.getScorecardHoleEntities(withAutomaticHoleSetup = true, roundId);
    });

});