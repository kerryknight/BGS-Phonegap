//NOTES: 
//to check at beforeSave if saving an object that already exits:
//response.object.existed()


//have to include underscore manually on cloud code
var _ = require('underscore')._;

//Verify user's displayName prior to letting the user sign up
Parse.Cloud.beforeSave(Parse.User, function (request, response) {
    var name = request.object.get("displayName");

    if (typeof (name) == 'undefined') {
        console.error('The new Parse user displayname at beforeSave was undefined');
        return response.success();
    }

    name = name.trim(); //clear leading and trailing spaces

    if (name.length < 3) {
        console.error('Display name was too short: ' + name);
        return response.error("Your display name must be at least 3 characters long");
    } else if (name.length > 20) {
        console.log('Display name was truncated: ' + name);
        // Truncate and add a ... instead of erroring out 
        request.object.set("displayName", name.substring(0, 17) + "...");
    }

    response.success();
});

//ensure we have a user set before saving
Parse.Cloud.beforeSave("Round", function (request, response) {
    if (!request.user) {
        return response.error("Must be signed in to save a round.");
    }

    //check if this is a new round; if it's a new round, we need to deactivate the active one(s) if it exists
    if(!request.object.existed()) {
        deactivateOtherRounds(request.user, function() {
            return response.success();
        });
    } else {
        //we're just updating the round so go ahead and return a response
        return response.success();
    }
});

Parse.Cloud.beforeSave("Scorecard", function (request, response) {
    if (!request.user) {
        return response.error("Must be signed in to save a scorecard.");
    }

    //check if this is a new scorecard; if it's a new scorecard, we need to deactivate the active one(s) if it exists
    if(!request.object.existed()) {
        deactivateOtherScorecardsForUser(request.user, function() {
            return response.success();
        });
    } else {
        //we're just updating the round so go ahead and return a response
        return response.success();
    }
});

Parse.Cloud.beforeSave("Player", function (request, response) {
    if (!request.user) {
        return response.error("Must be signed in to save a player.");
    }

    //don't save players without a round, scorecard and user attached and error out
    var user = request.object.get("user"),
        round = request.object.get("round"),
        scorecard = request.object.get("scorecard");

    if ((typeof (user) == 'undefined') || (typeof (round) == 'undefined') || (typeof (scorecard) == 'undefined')) {
        console.error('The new Parse player user, round or scorecard at beforeSave was undefined');
        return response.error('User, round or scorecard was undefined');
    }

    //don't error out if the displayName is too long, just truncate it
    var name = request.object.get("displayName");

    if (typeof (name) == 'undefined') {
        console.error('The new Parse player displayname at beforeSave was undefined');
        return response.error('Display name was undefined');
    }

    name = name.trim(); //clear leading and trailing spaces

    if (name.length < 3) {
        console.error('Display name was too short: ' + name);
        return response.error("Your display name must be at least 3 characters long");
    } else if (name.length > 20) {
        console.log('Display name was truncated: ' + name);
        // Truncate and add a ... instead of erroring out 
        request.object.set("displayName", name.substring(0, 17) + "...");
    }

    response.success();
});

Parse.Cloud.beforeSave("Rule", function (request, response) {
    if (request.object.get('isDefault') == true) {
        console.error('Cannot modify default rules.');
        return response.error("Cannot modify default rules.");
    }
    return response.success();
});

// Parse.Cloud.beforeDelete("Rule", function(request) {
//     //request/response could be undefined if trying to delete object from Parse.com in the data browser
//     if (typeof(request) != 'undefined' && typeof(response) != 'undefined') {
//         if (request.object.get('isDefault') == true) {
//             console.error('Cannot delete default rules.');
//             return response.error("Cannot delete default rules.");
//         }
//         return response.success();
//     }
// });

//delete a User's account on Parse as well as all data not associated with another User/Player
Parse.Cloud.define("deleteUserAccountAndData", function (request, response) {
    var userToDelete = request.user;
    if (!request.user) {
        return response.error("Must be signed in to call this Cloud Function.");
    }
    //delete all the user's other data that doesn't directly affect other players
    //ScoreEntries, Scorecards, Rules, Players, Photos, Holes, Awards, Rounds
    deleteObjectsForUser("Round", userToDelete)
    .then(function () {
        console.log('attempting to delete scorecards in the cloud');
        //Scorecards
        return deleteObjectsForUser("Scorecard", userToDelete);
    })
    .then(function () {
        //Rules
        return deleteObjectsForUser("Rule", userToDelete);
    })
    .then(function () {
        //Players
        return deleteObjectsForUser("Player", userToDelete);
    })
    // .then(function () {
    //     //Activities //the only activities that should be deleted are the one to this user
    //     return deleteObjectsForUser("Activity", userToDelete);  //uncomment when created
    // })
    // .then(function () {
    //     //Photos
    //     return deleteObjectsForUser("Photo", userToDelete);  //uncomment when created
    // })
    .then(function () {
        //Holes
        return deleteObjectsForUser("Hole", userToDelete);
    })
    // .then(function () {
    //     //Awards
    //     return deleteObjectsForUser("Award", userToDelete);  //uncomment when created
    // })
    .then(function () {
        //ScoreEntries
        return deleteObjectsForUser("Score", userToDelete);
    })
    .then(function () {
        //User
        return userToDelete.destroy();
    })
    .then(function () {
        //success
        console.log('Account and data deletion for user ' + userToDelete.id + ' was successful');
        return response.success();
    },
    function (error) {
        console.error('Error deleting user data: ' + JSON.stringify(error) + 'for user: ' + userToDelete.id);
        return response.error(error);
    });
});

//delete a user's round; this will most likely be called
//when the user wants to delete a round that hasn't been started yet
Parse.Cloud.define("deleteRound", function (request, response) {
    if (!request.user) {
        response.error("Must be signed in to call this Cloud Function.");
        return;
    }

    console.log('request.params.round = ' + JSON.stringify(request.params.round));
    var roundToDelete = '',
        user = request.user;

    var query = new Parse.Query("Round");
    query.equalTo("objectId", request.params.round);

    query.find()
        .then(function (results) {
            console.log('deleteRound query results = ' + JSON.stringify(results));
            if(results==0) return response.error('No round found to delete');
            roundToDelete = results[0];
        })
        //delete all objects associated with the round and then finally delete the round
        .then(function () {
            console.log('roundToDelete = ' + JSON.stringify(roundToDelete));
            console.log('user = ' + JSON.stringify(user));
            return deleteObjectsForRound("Scorecard", roundToDelete);
        })
        .then(function () {
            return deleteObjectsForRound("Player", roundToDelete);
        })
        .then(function () {
            return deleteObjectsForRound("Hole", roundToDelete);
        })
        // .then(function () {
        //     return deleteObjectsForRound("Score", roundToDelete);
        // })
        .then(function() {
            //also run through and disable all other scorecards for this round
            return deactivateOtherScorecardsForRound(roundToDelete);
        })
        .then(function() {
            return roundToDelete.destroy();
        })
        .then(function() {
            console.log('Round deletion for user ' + user.id + ' was successful');
            return response.success();
        },
        function (error) {
            console.error('Error deleting round: ' + JSON.stringify(error) + 'for user: ' + user.id);
            return response.error(error);
        });
});

//this is called anytime we attempt to do automatic course setup of holes to clear out any previous holes
Parse.Cloud.define("deleteAllHolesForRound", function (request, response) {
    if (!request.user) {
        response.error("Must be signed in to call this Cloud Function.");
        return;
    }

    console.log('request.params.round = ' + JSON.stringify(request.params.round));
    var round = '',
        user = request.user;

    var query = new Parse.Query("Round");
    query.equalTo("objectId", request.params.round);

    query.find()
        .then(function (results) {
            console.log('deleteAllHolesForRound query results = ' + JSON.stringify(results));
            if(results==0) return response.error('No round found to delete holes for.');
            round = results[0];
        })
        //delete all objects associated with the round 
        .then(function () {
            console.log('round = ' + JSON.stringify(round));
            console.log('user = ' + JSON.stringify(user));
            return deleteObjectsForRound("Hole", round);
        })
        .then(function () {
            return deleteObjectsForRound("Score", round);
        })
        .then(function() {
            console.log('Hole deletion for user ' + user.id + ' was successful');
            return response.success();
        },
        function (error) {
            console.error('Error deleting holes: ' + JSON.stringify(error) + 'for user: ' + user.id);
            return response.error(error);
        });
});

//HELPER FUNCTIONS
function deleteObjectsForUser(objectType, user) {
    var p = new Parse.Promise(),
        query = new Parse.Query(objectType);
    query.equalTo("user", user);

    //we'll asynchronously delete our objects by performing ps in parallel
    query.find()
    .then(function (results) {
        console.log('Results count of query to get ' + objectType + 's to delete: ' + results.length);
        // Collect one p for each delete into an array.
        var ps = [];
        _.each(results, function (result) {
            // Start this delete immediately and add its p to the list.
            ps.push(result.destroy());
        });
        // Return a new p that is resolved when all of the deletes are finished.
        return Parse.Promise.when(ps);

    })
    .then(function () {
        console.log('Success deleting every ' + objectType + ' for user: ' + user.id);
        // Every comment was deleted.
        p.resolve();
    },
    function (error) {
        console.error('Error deleting all user ' + objectType + ' :' + JSON.stringify(error) + 'for user: ' + user.id);
        p.reject(error);
    });

    return p;
}

function deleteObjectsForRound(objectType, round) {
    var p = new Parse.Promise(),
        query = new Parse.Query(objectType);
    query.equalTo("round", round);

    //if we're deleting a round and looping through players in the round, we don't want to delete 
    //any user account players; we want to keep those around so we can keep historical stats on them so
    //add that additional parameter to our query to ensure we do skip it
    objectType == 'Player' ? query.notEqualTo('isUserAccount', true) : '';

    //we'll asynchronously delete our objects by performing ps in parallel
    query.find()
    .then(function (results) {
        console.log('Results count of query to get ' + objectType + 's to delete: ' + results.length);
        // Collect one p for each delete into an array.
        var ps = [];
        _.each(results, function (result) {
            // Start this delete immediately and add its p to the list.
            ps.push(result.destroy());
        });
        // Return a new p that is resolved when all of the deletes are finished.
        return Parse.Promise.when(ps);

    })
    .then(function () {
        console.log('Success deleting every ' + objectType + ' for round: ' + round.id);
        // Every comment was deleted.
        p.resolve();
    },
    function (error) {
        console.error('Error deleting all user ' + objectType + ' :' + JSON.stringify(error) + 'for round: ' + round.id);
        p.reject(error);
    });

    return p;
}

function deactivateOtherRounds(user, callback) {
  
    var query = new Parse.Query("Round");
    query.equalTo("user", user);
    query.equalTo("isActive", true);

    query.find()
        .then(function (results) {
            callbackResults = results;
            // console.log('Results count of query to get objects to delete: ' + results.length);
            var p = Parse.Promise.as();
            _.each(results, function (result) {
                // For each item, extend the p with a function to delete it.
                p = p.then(function() {
                    //we also need to deactivate all scorecards associated with this round
                    deactivateOtherScorecardsForRound(result);
                    result.set('isActive', false);
                    return result.save()
                });
            });

            return p;
        })
        .then(function () {
            console.log('Success deactivating every other object');
             // Every comment was deleted.
            callback();
        });
}

function deactivateOtherScorecardsForUser(user, callback) {
    var query = new Parse.Query("Scorecard");
    query.equalTo("user", user);
    query.equalTo("isActive", true);

    query.find()
        .then(function (results) {
            // console.log('Results count of query to get objects to delete: ' + results.length);
            var p = Parse.Promise.as();
            _.each(results, function (result) {
                // For each item, extend the p with a function to delete it.
                p = p.then(function() {
                    result.set('isActive', false);
                    return result.save()
                });
            });

            return p;
        })
        .then(function () {
            console.log('deactivateOtherScorecardsForUser finished');
             // Every object was deactivated.
            callback();
        });
}

//this will be called whenever a user deletes a round they created or they delete a round they created
function deactivateOtherScorecardsForRound(round, callback) {
    var p1 = new Parse.Promise();
        query = new Parse.Query("Scorecard");
    query.equalTo("round", round);
    query.equalTo("isActive", true);

    query.find()
        .then(function (results) {
            console.log('scorecards for round count from run query = ' + results.length);
            // console.log('Results count of query to get objects to delete: ' + results.length);
            var p = Parse.Promise.as();
            _.each(results, function (result) {
                console.log('result from scorecards for round query = ' + JSON.stringify(result));
                // For each item, extend the p with a function to delete it.
                p = p.then(function() {
                    result.set('isActive', false);
                    result.save()
                    .then(function() {
                        p.resolve();
                    });
                });
            });

            return p;
        })
        .then(function () {
            console.log('deactivateOtherScorecardsForRound Success deactivating every other scorecard for round');
             // Every object was deactivated
            // callback();
            p1.resolve();
        });

        return p1;
}
