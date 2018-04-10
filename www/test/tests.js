window.jQuery(function () {
    // see http://qunitjs.com/cookbook/#efficient-development for more info on using QUnit.js testing

    var appID = 'PG4Fpi5KFo5RBN3RM0vK5bY19hqjXOYgATlwTdYo';
    var jsID = 'oM6sHrsY67LsfQAhXNDTG9SbWz9qKJZeh8LTGFXc';

    var testuser = 'testuser';
    var testpass = 'testuser';

    var self = this;

    console.log('REMEMBER: If tests do not appear to be running correctly, check that proper start()s have been added');

    function returnedResponseFromParse(returnResponse) {
        ok(true, returnResponse);
    }

    // //**************************** APPLICATION LOAD ***************************************************************//
    // //*************************************************************************************************************//
    // module('Application Load', {
    //     setup: function () {
    //         //all our tests are run while user is logged out
    //         Parse.User.logOut();
    //         console.log('********** Remember: Do not duplicate events you plan to trigger; i.e. only 1 "loggedIn" event is allowed or out of context errors will occur *************');
    //     }
    // });

    // test("App initilization", function () {
    //     equal(Parse.applicationId, appID, "Parse applicationID is set correctly");
    //     equal(Parse.javaScriptKey, jsID, "Parse javaScriptKey is set correctly");
    //     equal(Parse.User.current(), null || undefined, 'User is not logged into Parse');
    //     ok(BGS.Utilities.isMobileDevice() != true, 'These unit tests are being run in a browser');
    //     equal(BGS.Utilities.rootTemplateAddress, '../templates/', "The root address for view templates is correct");
    // });

    // //**************************** VIEW TEMPLATES *****************************************************************//
    // //*************************************************************************************************************//
    // module('View Templates', {
    //     setup: function () {
    //         //all our tests are run while user is logged out
    //         Parse.User.logOut();
    //     }
    // });
    // //this test counts the number of DIVs in the loaded template and compares against what we expect;
    // //this is not a 100% accurate test as some templates have the same number of DIVs but, but ensuring
    // //templates with the same number of DIVs aren't placed sequentially in the array, and thus won't be
    // //tested in succession in our loop, this method is certainly a good spot checker
    // asyncTest("Template Loading", function () {
    //     var $fixture = $("#qunit-fixture");

    //     $('#qunit').on("templatesLoaded", function () {
    //         var templateList = {
    //             'start': 9, //really only 5 in the template, but we need to account for our added divs in the #qunit-fixture div we added for testing
    //             'welcome': 10,
    //             'login': 5,
    //             'signup': 7,
    //             'main': 12,
    //             'username': 2,
    //             'forgot-password': 5,
    //             'left-panel': 12,
    //             'activity': 1,
    //             'leaderboard': 1,
    //             'player': 1,
    //             'places-list': 5,
    //             'places-map' : 2,
    //             'places-map-layout' : 2,
    //             'places-map-menu' : 1,
    //             'bar-list-item': 7,
    //             'taxi-list-item': 5,
    //             'round-setup-options' : 20,
    //             'round-setup-item-list': 3,
    //             'round-setup-item-list-player': 3,
    //             'round-setup-item-list-hole': 3,
    //             'list-layout': 2,
    //             'round-setup-player-data': 10,
    //             'round-setup-rul-data': 5,
    //             'places-manual-entry-hole-data', : 10,
    //             'address-bar': 1
    //         };

    //         equal(BGS.Utilities.templateCount, _.size(templateList), "Our template array and testing array have the same length");

    //         _.each(templateList, function (value, key) {
    //             $fixture.append(BGS.Utilities.templateLoader.get(key));
    //             equal($("div", $fixture).length, value, key + " template added successfully; if failure, check DIV counts."); //testing number of divs in the template
    //             $fixture.empty();
    //         });

    //         start(); //call start when ready for ok test to be run
    //     });
    // });

    // //**************************** PARSE AUTHENTICATION ************************************************************//
    // //*************************************************************************************************************//
    // module('Parse Authentication', {
    //     setup: function () {
    //         //be sure Parse is setup and user logged out
    //         Parse.initialize(appID, jsID);
    //         Parse.User.logOut();
    //     },
    //     teardown: function () {
    //         //do stuff after each test runs as needed
    //         Parse.User.logOut();
    //     }
    // });

    // asyncTest("Incorrectly Logging into Parse", function () {
    //     expect(1); //# of assertions expected to be run

    //     //attempt to log user into Parse system with incorrect credentials
    //     var fakeuser = 'unknown-user';

    //     BGS.StartApp.Start.Controller.logIn(fakeuser, testpass)
    //         .then(function (success) {
    //             start(); //this shouldn't happen in this test
    //         }, function (error) {
    //             console.log('login error = ' + JSON.stringify(error));
    //             returnedResponseFromParse("User login failed");
    //             start();
    //         });
    // });

    // asyncTest("Successfully Logging into Parse", function () {
    //     expect(1); //# of assertions expected to be run

    //     BGS.StartApp.Start.Controller.logIn(testuser, testpass)
    //         .then(function (success) {
    //             console.log('success returned = ' + JSON.stringify(success));
    //             returnedResponseFromParse("User logged in correctly");
    //             start();
    //         }, function (error) {
    //             console.log('login error = ' + error.message);
    //             start(); //this shouldn't happen unless network issues or account deleted on parse
    //         });
    // });

    // asyncTest("Successfully Logging into and out of Parse", function () {
    //     expect(2); //# of assertions expected to be run

    //     BGS.StartApp.Start.Controller.logIn(testuser, testpass)
    //         .then(function (success) {
    //             returnedResponseFromParse("User logged in correctly");
    //         })
    //         .then(BGS.StartApp.Start.Controller.logOut)
    //         .then(function (facebook) {
    //             if (BGS.Utilities.isMobileDevice()) {
    //                 equal(facebook, false, 'Logged out: facebook is logged out');
    //             } else {
    //                 equal(facebook, undefined || null, 'Running on desktop: Facebook never initialized');
    //             }
    //             start();
    //         }, function (error) {
    //             console.log('login error = ' + error.message);
    //             start(); //this shouldn't happen unless network issues or account deleted on parse
    //         });
    // });

    // asyncTest("Sending Forgotten email", function () {
    //     expect(1); //# of assertions expected to be run
    //     BGS.StartApp.Start.Controller.resetPasswordForEmail('kerry.a.knight@gmail.com', function (response) {
    //         equal('success', response, 'Sent forgotten password email successfully');
    //         start();
    //     });
    // });


    // // **************************** PARSE SIGN UP ******************************************************************//
    // // *************************************************************************************************************//
    module('Parse Sign Up', {
        setup: function () {
            //be sure Parse is setup and user logged out
            Parse.initialize(appID, jsID);
            Parse.User.logOut();
        },
        teardown: function () {
            //do stuff after each test runs as needed
            Parse.User.logOut();
        }
    });

    function createNewDummyUser() {
        //create our new user and set up all our initial details
        var user = new Parse.User();
        user.set("username", 'dummyuser');
        user.set("password", 'dummyuser');
        user.set("email", 'kerry@bargolfstars.com');
        user.set("displayName", 'Dummy User');
        user.set("ACL", new Parse.ACL());

        return user;
    }

    // asyncTest("Successfully Signing up and Deleting a user with Parse", function () {
    //     expect(1); //# of assertions expected to be run
    //     var user = createNewDummyUser();

    //     // //we'll attempt to requery for the user to see if they still exist; if not, delete was successful
    //     var query = new Parse.Query(Parse.User);
    //     query.equalTo("email", "kerry@bargolfstars.com"); // see if our user still exists
    //     BGS.StartApp.Start.Controller.signUp(user)
    //     .then(function() {
    //         return BGS.Utilities.deleteUserAccountAndDataFromParse();
    //     }) //pass the user from signup process into our delete function
    //     .then(function (user) {
    //         query.find(); //not sure why i can't chain queries like other functions; must be an issue with Parse SDK v1.2.8
    //     })
    //     .then(function (results) {
    //         console.log('query results = ' + JSON.stringify(results));
    //         equal(null || undefined, results, 'Dummy user successfully deleted from Parse');
    //         start();
    //     }, function (error) {
    //         console.log('query error = ' + JSON.stringify(error));
    //     });
    // });

    // asyncTest("Unsuccessfully Signing up a user with an existing email in Parse", function () {
    //     expect(1); //# of assertions expected to be run

    //     var user = createNewDummyUser();
    //     user.set("email", 'woozykk@hotmail.com');//this address should already be in Parse

    //     BGS.StartApp.Start.Controller.signUp(user)
    //         .then(function (success) {
    //             console.log('success should never if I still have a Facebook account linked into Parse');
    //             ok(false, 'Failed because I may not have a Facebook account linked into Parse');
    //         }, function (error) {
    //             ok(true, 'Failed to sign up a user with Parse');
    //             start();
    //         });
    // });

    // asyncTest("Unsuccessfully Signing up a user with a short display name in Parse", function () {
    //     expect(1); //# of assertions expected to be run

    //     var user = createNewDummyUser();
    //     user.set("displayName", 'Bo');//this address should already be in Parse

    //     BGS.StartApp.Start.Controller.signUp(user)
    //         .then(function (success) {
    //             console.log('success should never happen');
    //             start();
    //         }, function (error) {
    //             console.log('error returned: ' + JSON.stringify(error));
    //             equal(error.message, 'Your display name must be at least 3 characters long', 'Your display name must be at least 3 characters long');
    //             start();
    //         });
    // });

    module('Parse Add and Delete Data', {
        setup: function () {
            //be sure Parse is setup and user logged out
            Parse.initialize(appID, jsID);
        },
        teardown: function () {
            //do stuff after each test runs as needed
        }
    });

    asyncTest("Successfully Signing up a user with a long display name in Parse", function () {
        expect(1); //# of assertions expected to be run
        Parse.User.logOut();
        var user = createNewDummyUser();
        user.set("displayName", 'This name is more than 20 characters long');//this address should already be in Parse

        BGS.StartApp.Start.Controller.signUp(user)
            .then(function (success) {
                // console.log('success at signup: ' + JSON.stringify(success));
                var name = success.get('displayName');
                equal(name, 'This name is more...', 'Display name successfully truncated to: ' + name);
                start();
            },
            function (error) {
                console.log('error returned: ' + JSON.stringify(error));
                ok(false, 'This should never happen');
                start();
            });
    });

    asyncTest("Successfully adding a new Round in Parse", function () {
        expect(2); //# of assertions expected to be run
        
        var user = Parse.User.current();
        BGS.RSApp.RoundSetup.Controller.createNewRound(user)
            .then(function (success) {
                self.round = success;
                equal(Parse.User.current(), success.get('user'), 'New round successfully created by current user');
                equal(true, success.get('isActive'), 'Newly created round is active');
                start();
            },
            function (error) {
                console.log('error returned: ' + JSON.stringify(error));
                ok(false, 'This should never happen');
                start();
            });
    });

    asyncTest("Successfully adding a 2nd new Round and new Scorecard in Parse", function () {
        expect(4); //# of assertions expected to be run
        
        var user = Parse.User.current(),
            newround = '';

        BGS.RSApp.RoundSetup.Controller.createNewRound(user)
            .then(function (success) {
                equal(Parse.User.current(), success.get('user'), 'New round successfully created by current user');
                equal(true, success.get('isActive'), 'Newly created round is active');
                newround = success;
                return BGS.RSApp.RoundSetup.Controller.createNewScorecard(user);
            })
            .then(function(success) {
                self.round = newround;
                self.scorecard = success;
                equal(Parse.User.current(), success.get('user'), 'New scorecard successfully created with current user');
                equal(newround, success.get('round'), 'New scorecard successfully created with current round');
                start();
            }, 
            function(error) {
                console.log('error returned: ' + JSON.stringify(error));
                ok(false, 'This should never happen');
                start();
            });
    });

    asyncTest("Successfully adding current user as Player 1 in Parse", function () {
        expect(4); //# of assertions expected to be run

            self.player = BGS.request("rs:player:newcurrent");
            self.player.set('round', self.round);
            self.player.set('scorecard', self.scorecard);

            BGS.RSApp.RoundSetup.Controller.savePlayer(self.player)
            .then(function (success){
                // console.log('player success = ' + JSON.stringify(success));
                equal(1, success.get('playerNum'), 'New player successfully created with current user');
                equal(true, success.get('isUserAccount'), 'New player successfully created with current user');
                equal(self.round, success.get('round'), 'New player successfully created with current round');
                equal(1, success.get('playerNum'), 'Current user successfully added as player 1');
                start();
            },
            function (error) {
                console.log('error returned: ' + JSON.stringify(error));
                ok(false, 'This should never happen');
                start();
            });
    });

    // asyncTest("Successfully adding a new player as Player 3 and then deleting Player in Parse", function () {
    //     expect(4); //# of assertions expected to be run
        
    //     var user = Parse.User.current(),
    //         Player = Parse.Object.extend("Player");
    //         player = new Player();

    //         player.set("playerNum", 3);
    //         player.set('displayName', 'Here is Player 3');
    //         player.set('handicap', 0); //default handicap for non-logged in users
    //         player.set('round', self.round);
    //         player.set('scorecard', self.scorecard);
    //         player.set('user', user);

    //     BGS.RSApp.RoundSetup.Controller.savePlayer(player)
    //         .then(function(success){
    //             equal('Here is Player 3', success.get('displayName'), 'New player successfully created for Player 3');
    //             equal(self.round, success.get('round'), 'New player successfully created with current round');
    //             equal(3, success.get('playerNum'), 'New player successfully added as player 3');
            
    //             return BGS.RSApp.RoundSetup.Controller.deletePlayer(player);
    //         })
    //         .then(function(success) {
    //             console.log('success at delete = ' + JSON.stringify(success));
    //             equal('Here is Player 3', success.get('displayName'), "Successfully deleted player 3");
    //             start();
    //         },
    //         function(error) {
    //             console.log('error returned: ' + JSON.stringify(error));
    //             ok(false, 'This should never happen');
    //             start();
    //         });
    // });

    // asyncTest("Successfully adding a new course of 9 holes in Parse", function () {
    //     expect(2); //# of assertions expected to be run
        
    //     var fetchingHoles = BGS.request("scorecard:hole:entities");

    //     $.when(fetchingHoles).done(function(holes){
    //         equal(9, holes.length, '9 holes created');

    //         var isDefault = true;
    //         holes.forEach(function (hole) {
    //             if(hole.get('name') != 'Hole Name Not Added Yet') isDefault = false;
    //             if(hole.get('par') != 1) isDefault = false;
    //         });

    //         equal(isDefault, true, 'All holes created as default holes');
    //         start();
    //     });
    // });

    // asyncTest("Successfully adding an automatically generated course of 9 holes in Parse", function () {
    //     expect(2); //# of assertions expected to be run
        
    //     var roundId = self.round.id; //round id is only needed when unit testing
    //     var fetchingHoles = BGS.request("scorecard:hole:entities:automatic-setup", roundId);

    //     $.when(fetchingHoles).done(function(holes){
    //         equal(9, holes.length, '9 automatic holes created');

    //         var setupCorrect = true;
    //         holes.forEach(function (hole) {
    //             //all none-default holes should have a location
    //             if((hole.get('name') != 'Hole Name Not Added Yet') && ((hole.get('location').latitude == '') || (hole.get('location').longitude == ''))) setupCorrect = false;
    //             if(hole.get('par') != 1) setupCorrect = false;
    //         });

    //         equal(setupCorrect, true, 'All holes automatically created properly holes');
    //         start();
    //     });
    // });

    // asyncTest("Successfully modifying a default and saving as new rule in Parse", function () {
    //     expect(1);

    //     var query = new Parse.Query('Rule'),
    //         dataView = new BGS.RSApp.RoundSetup.RuleDataView(),
    //         defaultRule = new BGS.Entities.Rule();

    //         query.equalTo("isDefault", true)

    //         query.first()
    //         .then(function (data) {
    //             defaultRule = data;
    //             return dataView.saveDefaultRule(data);
    //         })
    //         .then(function(success){

    //             var ruleIsPresent = false;
    //             success.each(function(successRule) {
    //                 if(successRule.id == defaultRule.id) {

    //                     ruleIsPresent = true;
    //                     ok(false, 'Default rule was still present');
    //                     start();
    //                 }
    //             });
                
    //             if(ruleIsPresent === false) {
    //                 ok(true, 'Default rule was not present in returned list of active rules');
    //                 start();
    //             }
    //         },
    //         function(error){
    //             console.log('error: ' + JSON.stringify(error));
    //             ok(false, 'failed');
    //             start();
    //         });
    // });

    // asyncTest("Successfully adding and deleting a new custom drink rule Parse", function () {
    //     expect(7); //# of assertions expected to be run
        
    //     var user = Parse.User.current(),
    //         Rule = Parse.Object.extend("Rule");
    //         rule = new Rule();

    //         rule.set("type", "drink");
    //         rule.set('description', 'A new drink description');
    //         rule.set('isDefault', false); //should ALWAYS be false
    //         rule.set('name', 'A new drink name');
    //         rule.set('round', self.round);
    //         rule.set('user', user);
    //         rule.set('value', -5);

    //     BGS.RSApp.RoundSetup.Controller.saveRule(rule)
    //         .then(function (success) {
    //             var ruleIsPresent = false;
    //             success.each(function(successRule) {
    //                 if(successRule.id == rule.id) {
    //                     ruleIsPresent = true;
    //                     // console.log('player success = ' + JSON.stringify(success));
    //                     equal('drink', successRule.get('type'), 'Rule type is drink');
    //                     equal('A new drink description', successRule.get('description'), 'Drink description set');
    //                     equal(false, successRule.get('isDefault'), 'Drink is not a default');
    //                     equal('A new drink name', successRule.get('name'), 'Drink name set');
    //                     equal(-5, successRule.get('value'), 'Drink value added');
    //                     equal(true, _.contains(self.round.get('rules'), successRule.id), 'Round rules array contains new rule');
    //                     BGS.RSApp.RoundSetup.Controller.deleteRule(successRule)
    //                     .then(function(success) {
    //                         //loop through returned array and check if our supposedly deleted rule is in it
    //                         var isPresent = false;
    //                         success.each(function(newRule) {
    //                             if(newRule.id == successRule.id) {
    //                                 isPresent = true;
    //                             }
    //                         });

    //                         equal(isPresent, false, 'Successfully deleted new custom rule');
    //                         start();
    //                     },
    //                     function(error) {
    //                         console.log('error returned: ' + JSON.stringify(error));
    //                         ok(false, 'This should never happen either');
    //                         start();
    //                     });
    //                 }
    //             });
                
    //             if(ruleIsPresent === false) {
    //                 ok(false, 'Rule was not present');
    //                 start();
    //             }
    //         },
    //         function (error) {
    //             console.log('error returned: ' + JSON.stringify(error));
    //             ok(false, 'This should never happen');
    //             start();
    //         });
    // });

    // asyncTest("Successfully adding a new custom bonus rule Parse", function () {
    //     expect(6); //# of assertions expected to be run
        
    //     var user = Parse.User.current(),
    //         Rule = Parse.Object.extend("Rule");
    //         rule = new Rule();

    //         rule.set("type", "bonus");
    //         rule.set('description', 'A new bonus description');
    //         rule.set('isDefault', false); //should ALWAYS be false
    //         rule.set('name', 'A new bonus name');
    //         rule.set('round', self.round);
    //         rule.set('user', user);
    //         rule.set('value', -7);

    //     BGS.RSApp.RoundSetup.Controller.saveRule(rule)
    //         .then(function (success) {
    //             var ruleIsPresent = false;
    //             success.each(function(successRule) {
    //                 if(successRule.id == rule.id) {
    //                     ruleIsPresent = true;
    //                     // console.log('player success = ' + JSON.stringify(success));
    //                     equal('bonus', successRule.get('type'), 'Rule type is bonus');
    //                     equal('A new bonus description', successRule.get('description'), 'Bonus description set');
    //                     equal(false, successRule.get('isDefault'), 'Bonus is not a default');
    //                     equal('A new bonus name', successRule.get('name'), 'Bonus name set');
    //                     equal(-7, successRule.get('value'), 'Bonus value added');
    //                     equal(true, _.contains(self.round.get('rules'), successRule.id), 'Round rules array contains new rule');
    //                     BGS.RSApp.RoundSetup.Controller.deleteRule(successRule);//delete it after
    //                     start();
    //                 }
    //             });
                
    //             if(ruleIsPresent === false) {
    //                 ok(false, 'Rule was not present');
    //                 start();
    //             }
    //         },
    //         function (error) {
    //             console.log('error returned: ' + JSON.stringify(error));
    //             ok(false, 'This should never happen');
    //             start();
    //         });
    // });

    // asyncTest("Successfully adding a new custom penalty rule Parse", function () {
    //     expect(6); //# of assertions expected to be run
        
    //     var user = Parse.User.current(),
    //         Rule = Parse.Object.extend("Rule");
    //         self.rule = new Rule();

    //         self.rule.set("type", "penalty");
    //         self.rule.set('description', 'A new penalty description');
    //         self.rule.set('isDefault', false); //should ALWAYS be false
    //         self.rule.set('name', 'A new penalty name');
    //         self.rule.set('round', self.round);
    //         self.rule.set('user', user);
    //         self.rule.set('value', 3);

    //     BGS.RSApp.RoundSetup.Controller.saveRule(self.rule)
    //         .then(function (success) {
    //             var ruleIsPresent = false;
    //             success.each(function(successRule) {
    //                 if(successRule.id == self.rule.id) {
    //                     ruleIsPresent = true;
    //                     // console.log('player success = ' + JSON.stringify(success));
    //                     equal('penalty', successRule.get('type'), 'Rule type is penalty');
    //                     equal('A new penalty description', successRule.get('description'), 'Penalty description set');
    //                     equal(false, successRule.get('isDefault'), 'Penalty is not a default');
    //                     equal('A new penalty name', successRule.get('name'), 'Penalty name set');
    //                     equal(3, successRule.get('value'), 'Penalty value added');
    //                     equal(true, _.contains(self.round.get('rules'), successRule.id), 'Round rules array contains new rule');
    //                     BGS.RSApp.RoundSetup.Controller.deleteRule(successRule);//delete it after
    //                     start();
    //                 }
    //             });
                
    //             if(ruleIsPresent === false) {
    //                 ok(false, 'Rule was not present');
    //                 start();
    //             }
    //         },
    //         function (error) {
    //             console.log('error returned: ' + JSON.stringify(error));
    //             ok(false, 'This should never happen');
    //             start();
    //         });
    // });

    asyncTest("Successfully resetting custom scoring to default values", function () {
        expect(2);
        console.log('starting default rules TEST***************************************************************');
        BGS.RSApp.RoundSetup.Controller.resetDefaultScoring()
        .then(function() {
            console.log('test 2 returned');
            return BGS.request("round:rule:all:entities");
        })
        .then(function(success) {
            var areDefaults = true;
            success.each(function(rule) {
                if(rule.get('isDefault') == false) {
                    areDefaults = false;
                    ok(false, 'Non-default rule was still present');
                    start();
                }
            });

            if(areDefaults === true) {
                equal(success.length, 22, '21 default rules with dummy rule returned');
                ok(true, 'All returned rules are defaults');
                start();
            }
        },
        function(error) {
            console.log('error: ' + JSON.stringify(error));
            ok(false, 'failed');
            start();
        });
    });

    // asyncTest("Successfully adding a new score entry for current player in Parse", function () {
    //     expect(5); //# of assertions expected to be run
        
    //     var user = Parse.User.current(),
    //         Score = Parse.Object.extend("Score");
    //         scoreEntry = new Score();

    //         scoreEntry.set('round', self.round);
    //         scoreEntry.set('user', user);
    //         scoreEntry.set('player', self.player);
    //         scoreEntry.set('rule', self.rule);
    //         scoreEntry.set('hole', self.hole);

    //     scoreEntry.save()
    //         .then(function (success) {
    //             // console.log('player success = ' + JSON.stringify(success));
    //             equal(user, success.get('user'), 'Score entry added by current user');
    //             equal(self.round, success.get('round'), 'Score entry added for current round');
    //             equal(self.player, success.get('player'), 'Score entry added for self.player');
    //             equal(self.rule, success.get('rule'), 'Score entry added for self.rule');
    //             equal(self.hole, success.get('hole'), 'Score entry added for self.hole');
    //             start();
    //         },
    //         function (error) {
    //             console.log('error returned: ' + JSON.stringify(error));
    //             ok(false, 'This should never happen');
    //             start();
    //         });
    // });

    // asyncTest("Successfully Querying for Default Drink Rules in Parse", function () {
    //     expect(2); //# of assertions expected to be run
    //     //this should only return defaults now
    //     BGS.request("rule:default:drink:entities")
    //     .then(function(drinks) {
    //         var isDrink = true;
    //         _.each(drinks, function(drink) {
    //             if(drink.get('type') != 'drink') isDrink = false; 
    //         });

    //         equal(drinks.length, 8, 'Successfully retrieved ' + drinks.length + ' default drinks');
    //         equal(isDrink, true, 'Successfully retrieved default drinks');
    //         start();
    //     },
    //     function(error){
    //         console.log('error:' + JSON.stringify(error));
    //         ok(false, 'Getting default drinks test failed');
    //         start();
    //     });
    // });

    // asyncTest("Successfully Querying for Default Bonus Rules in Parse", function () {
    //     expect(2); //# of assertions expected to be run
    //     //this should only return defaults now
    //     BGS.request("rule:default:bonus:entities")
    //     .then(function(bonuses) {
    //         var isBonus = true;
    //         _.each(bonuses, function(bonus) {
    //             if(bonus.get('type') != 'bonus') isBonus = false; 
    //         });

    //         equal(bonuses.length, 7, 'Successfully retrieved ' + bonuses.length + ' default bonuses');
    //         equal(isBonus, true, 'Successfully retrieved default bonuses');
    //         start();
    //     },
    //     function(error){
    //         console.log('error:' + JSON.stringify(error));
    //         ok(false, 'Getting default bonuses test failed');
    //         start();
    //     });
    // }); 

    // asyncTest("Successfully Querying for Default Penalty Rules in Parse", function () {
    //     expect(2); //# of assertions expected to be run
    //     //this should only return defaults now
    //     BGS.request("rule:default:penalty:entities")
    //     .then(function(penalties) {
    //         var isPenalty = true;
    //         _.each(penalties, function(penalty) {
    //             if(penalty.get('type') != 'penalty') isPenalty = false; 
    //         });

    //         equal(penalties.length, 6, 'Successfully retrieved ' + penalties.length + ' default penalties');
    //         equal(isPenalty, true, 'Successfully retrieved default penalties');
    //         start();
    //     },
    //     function(error){
    //         console.log('error:' + JSON.stringify(error));
    //         ok(false, 'Getting default bonuses test failed');
    //         start();
    //     });
    // });   

    asyncTest("Successfully Deleting the current user in Parse", function () {
        expect(1); //# of assertions expected to be run

            BGS.Utilities.deleteUserAccountAndDataFromParse()
                .then(function (success) {
                    ok(true, 'User was successfully deleted');
                    start();
                },
                function (error) {
                    console.log('error returned: ' + JSON.stringify(error));
                    ok(false, 'This should never happen');
                    start();
                });
    });

    // //**************************** PARSE QUERYING *****************************************************************//
    // //*************************************************************************************************************//    
    // module('Parse Querying', {
    //     setup: function () {
    //         BGS.StartApp.Start.Controller.logIn(testuser, testpass)
    //             .then(function (success) {
    //                 $('#qunit').trigger('loggedIn');
    //             });
    //     },
    //     teardown: function () {
    //         //do stuff after each test runs as needed
    //         Parse.User.logOut();
    //     }
    // });

    // asyncTest("Parse Foursquare API retrieval", function () {
    //     expect(1);
    //     $('#qunit').on("loggedIn", function () {
    //         BGS.Utilities.retrieveAPIInfoFromParse('foursquare', function (api) {
    //             returnedResponseFromParse('foursquare API = ' + JSON.stringify(api));
    //             start(); //call start when ready for test to be run
    //         });
    //     });
    // });

    // //**************************** FOURSQUARE QUERYING ************************************************************//
    // //*************************************************************************************************************//    
    // module('Foursquare', {
    //     setup: function () {
    //         //make sure we haven't init'd foursquare
    //         BGS.Utilities.fsqIsInitialized = false;
    //     },
    //     teardown: function () {
    //         //do stuff after each test runs as needed
    //         BGS.FoursquareAPI.fsqClearBarCache();
    //     }
    // });

    // asyncTest("Initialization", function () {
    //     expect(1);
    //     BGS.FoursquareAPI.fsqInitialize()
    //         .then(function (apiObject) {
    //             equal(BGS.Utilities.fsqIsInitialized, true, 'Foursquare is initialized');
    //             start();
    //         });
    // });

    // asyncTest("Fetching default # of US bars", function () {
    //     expect(5);

    //     //1. get user's current location
    //     BGS.Utilities.getCurrentLocation()
    //         .then(function (returnedLocation) {
    //             //successfully retrieved user's location
    //             ok(true, 'Successfully retrieved user location');

    //             //2. initialize foursquare
    //             BGS.FoursquareAPI.fsqInitialize()
    //                 .then(function (apiObject) {
    //                     //successfully initialized Foursquare
    //                     equal(BGS.Utilities.fsqIsInitialized, true, 'Foursquare is initialized');

    //                     //3. create our authorization request using the api object we got back from initializing foursquare
    //                     BGS.FoursquareAPI.fsqCreateRequestAuthorizationObjects(apiObject)
    //                         .then(function (endpoint, authString) {
    //                             //successfully retrieved foursquare endpoint and authstring
    //                             ok(true, 'Successfully retrieved Foursquare endpoint and authString');

    //                             var bars = new BGS.Entities.FoursquarePlaceCollection({
    //                                 'type': 'bars',
    //                                 'endpoint': endpoint,
    //                                 'authString': authString,
    //                                 'options': {
    //                                     'location': returnedLocation
    //                                 }
    //                             });

    //                             //4. attempt to query foursquare for our bar list
    //                             bars.fetch({
    //                                 success: function (response) {
    //                                     //we successfully retrieved our bar list and our bars collection object has been updated
    //                                     ok(response != (null || undefined), 'Successfully returned a response from Foursquare');
    //                                     ok(bars instanceof BGS.Entities.FoursquarePlaceCollection, 'We have a collection of ' + bars.length + ' US bars; First bar returned: ' + JSON.stringify(bars.first()));
    //                                     start();
    //                                 }
    //                             });
    //                         });
    //                 });
    //         }, function(error) {
    //             console.log('Getting user location timed out');
    //             ok(1==2, 'Getting user location failed');
    //         });
    // });

    // asyncTest("Fetching default # of London bars", function () {
    //     expect(5);

    //     var london = {'lat' : 51.514483, 'lng' : -0.134926};

    //     //1. get user's current location
    //     BGS.Utilities.getCurrentLocation(london)
    //         .then(function (returnedLocation) {
    //             //successfully retrieved user's location
    //             ok(true, 'Successfully retrieved user location');

    //             //2. initialize foursquare
    //             BGS.FoursquareAPI.fsqInitialize()
    //                 .then(function (apiObject) {
    //                     //successfully initialized Foursquare
    //                     equal(BGS.Utilities.fsqIsInitialized, true, 'Foursquare is initialized');

    //                     //3. create our authorization request using the api object we got back from initializing foursquare
    //                     BGS.FoursquareAPI.fsqCreateRequestAuthorizationObjects(apiObject)
    //                         .then(function (endpoint, authString) {
    //                             //successfully retrieved foursquare endpoint and authstring
    //                             ok(true, 'Successfully retrieved Foursquare endpoint and authString');

    //                             var bars = new BGS.Entities.FoursquarePlaceCollection({
    //                                 'type': 'bars',
    //                                 'endpoint': endpoint,
    //                                 'authString': authString,
    //                                 'options': {
    //                                     'location': returnedLocation
    //                                 }
    //                             });

    //                             //4. attempt to query foursquare for our bar list
    //                             bars.fetch({
    //                                 success: function (response) {
    //                                     //we successfully retrieved our bar list and our bars collection object has been updated
    //                                     ok(response != (null || undefined), 'Successfully returned a response from Foursquare');
    //                                     ok(bars instanceof BGS.Entities.FoursquarePlaceCollection, 'We have a collection of ' + bars.length + ' London bars; First bar returned: ' + JSON.stringify(bars.first()));
    //                                     start();
    //                                 }
    //                             });
    //                         });
    //                 });
    //         }, function(error) {
    //             console.log('Getting user location timed out');
    //             ok(1==2, 'Getting user location failed');
    //         });
    // });

    // asyncTest("Fetching default # of Australian bars", function () {
    //     expect(5);

    //     var pyrmont = {'lat' : -33.8665433, 'lng' : 151.1956316};

    //     //1. get user's current location
    //     BGS.Utilities.getCurrentLocation(pyrmont)
    //         .then(function (returnedLocation) {
    //             //successfully retrieved user's location
    //             ok(true, 'Successfully retrieved user location');

    //             //2. initialize foursquare
    //             BGS.FoursquareAPI.fsqInitialize()
    //                 .then(function (apiObject) {
    //                     //successfully initialized Foursquare
    //                     equal(BGS.Utilities.fsqIsInitialized, true, 'Foursquare is initialized');

    //                     //3. create our authorization request using the api object we got back from initializing foursquare
    //                     BGS.FoursquareAPI.fsqCreateRequestAuthorizationObjects(apiObject)
    //                         .then(function (endpoint, authString) {
    //                             //successfully retrieved foursquare endpoint and authstring
    //                             ok(true, 'Successfully retrieved Foursquare endpoint and authString');

    //                             var bars = new BGS.Entities.FoursquarePlaceCollection({
    //                                 'type': 'bars',
    //                                 'endpoint': endpoint,
    //                                 'authString': authString,
    //                                 'options': {
    //                                     'location': returnedLocation
    //                                 }
    //                             });

    //                             //4. attempt to query foursquare for our bar list
    //                             bars.fetch({
    //                                 success: function (response) {
    //                                     //we successfully retrieved our bar list and our bars collection object has been updated
    //                                     ok(response != (null || undefined), 'Successfully returned a response from Foursquare');
    //                                     ok(bars instanceof BGS.Entities.FoursquarePlaceCollection, 'We have a collection of ' + bars.length + ' Australian bars; First bar returned: ' + JSON.stringify(bars.first()));
    //                                     start();
    //                                 }
    //                             });
    //                         });
    //                 });
    //         }, function(error) {
    //             console.log('Getting user location timed out');
    //             ok(1==2, 'Getting user location failed');
    //         });
    // });

    // asyncTest("Testing bar list caching", function () {
    //     expect(5);

    //     var elapsed1 = elapsed2 = null,
    //         cacheIsFaster = true,
    //         startTime = new Date().getTime();

    //     //1. query foursquare for our bar list
    //     BGS.FoursquareAPI.fsqGetNearbyResults()
    //         .then(function (barList, isCached) {
    //             ok(true, 'Retrieved bar list via Foursquare API');
    //             ok(isCached == false, 'Bars were not cached');
    //             //2. calculate the time it took to return
    //             elapsed1 = new Date().getTime() - startTime;

    //             //3. call our async methoad again 100 times; all 100 should be faster than the actual call
    //             for (var i = 0; i < 100; i++) {
    //                 //reset our start time on each loop through
    //                 startTime = new Date().getTime();

    //                 var usedCache = true;//set a flag for checking if we used the cache the whole time
    //                 BGS.FoursquareAPI.fsqGetNearbyResults()
    //                     .then(function (barList, isCached) {
    //                         if (isCached == false) usedCache = false;//this should always be true here
    //                         //we should only be querying foursquare the first request; the rest should
    //                         //use the cached object on foursquare.js and significantly faster
    //                         elapsed2 = new Date().getTime() - startTime;

    //                         //check if our asynch request ever returned faster than our cache of bars
    //                         if (elapsed1 != null && elapsed2 != null && elapsed1 < elapsed2) cacheIsFaster = false;

    //                         //check our boolean setting at the end of looping through i times
    //                         if (i == 99) {
    //                             ok(true, 'Finished looping through all 99 additional fsqGetNearbyResults() requests');
    //                             ok(cacheIsFaster == true, 'Bar list cache always faster than async foursquare api requests');
    //                             ok(usedCache == true, 'We used the cached bar list the whole time');
    //                             start();
    //                         }

    //                     }, function (error) {
    //                         ok(false, 'there was an error retrieving bar list');
    //                         console.log('login error = ' + JSON.stringify(error));
    //                         start();
    //                     });
    //             }
    //         }, function (error) {
    //             ok(false, 'there was an error retrieving bar list');
    //             console.log('login error = ' + JSON.stringify(error));
    //             start();
    //         });
    // });

    // asyncTest("Fetch bars with names containing the word: Fibber", function () {
    //     expect(6);

    //     //1. get user's current location
    //     BGS.Utilities.getCurrentLocation()
    //         .then(function (returnedLocation) {
    //             console.log('got the user location for Fibbers');
    //             //successfully retrieved user's location
    //             ok(true, 'Successfully retrieved user location');

    //             //2. initialize foursquare
    //             BGS.FoursquareAPI.fsqInitialize()
    //                 .then(function (apiObject) {
    //                     //successfully initialized Foursquare
    //                     equal(BGS.Utilities.fsqIsInitialized, true, 'Foursquare is initialized');

    //                     //3. create our authorization request using the api object we got back from initializing foursquare
    //                     BGS.FoursquareAPI.fsqCreateRequestAuthorizationObjects(apiObject)
    //                         .then(function (endpoint, authString) {
    //                             //successfully retrieved foursquare endpoint and authstring
    //                             ok(true, 'Successfully retrieved Foursquare endpoint and authString');

    //                             var bars = new BGS.Entities.FoursquarePlaceCollection({
    //                                 'type': 'bars',
    //                                 'endpoint': endpoint,
    //                                 'authString': authString,
    //                                 'options': {
    //                                     'location': returnedLocation,
    //                                     'query': 'Fibber'
    //                                 }
    //                             });

    //                             //4. attempt to query foursquare for our bar list
    //                             bars.fetch({
    //                                 success: function (response) {
    //                                     ok(response != (null || undefined), 'Successfully returned a response from Foursquare');
    //                                     ok(bars instanceof BGS.Entities.FoursquarePlaceCollection, 'We have a collection of ' + bars.length + ' bars');

    //                                     //check if we returned any results; at this point, our bars collection will have
    //                                     //been populated with the returned response items, so we can just look at its length
    //                                     if (bars.length > 0) {
    //                                         //we successfully retrieved our bar list and our bars collection has been updated
    //                                         var firstResult = bars.at(0); //could also use bars.first(); but this allow indexing
    //                                         var barName = firstResult.get('name');
    //                                         ok(barName.match(/Fibber/), "The first bar returned is named: " + barName);
    //                                     } else {
    //                                         //there were no results for our search item
    //                                         ok(true, "Foursquare couldn't find any matching results for a bar by that name.");
    //                                     }
    //                                     start();
    //                                 }
    //                             });
    //                         });
    //                 });
    //         }, 
    //         function(error) {
    //             ok(1==2, 'Getting user location failed because of a timeout so we fail test.');
    //             start();
    //         });
    // });

    // asyncTest("Get user's location", function () {
    //     expect(1);

    //     //1. get user's current location
    //     BGS.Utilities.getCurrentLocation()
    //         .then(function (returnedLocation) {
    //             ok(true, 'returned users location');
    //             start();
    //         }, 
    //         function(error) {
    //             console.log('Getting user location timed out');
    //             ok(1==2, 'Getting user location failed');
    //             start();
    //         });

    //     });

    // //**************************** GOOGLE QUERYING ****************************************************************//
    // //*************************************************************************************************************// 

    // module('Google', {
    //     setup: function () {
    //         BGS.GoogleAPI.googleClearTaxiCache();
    //     },
    //     teardown: function () {
    //         //do stuff after each test runs as needed
    //     }
    // });

    // asyncTest("Reverse geocode user's address", function () {
    //     expect(1);

    //     //1. get user's current location
    //     BGS.Utilities.getCurrentLocation()
    //         .then(function (returnedLocation) {
    //                 BGS.GoogleAPI.googleGetUsersAddress(returnedLocation, true, function (response) {
    //                     equal(response, 'Success getting user address', "Successfully reverse geocoded user location");
    //                     start();
    //                 });
    //             },
    //             function (error) {
    //                 console.log('Getting user location timed out');
    //                 ok(1 == 2, 'Getting user location failed');
    //                 start();
    //             });
    // });

    // var taxiToGetDetailsFor; //use this for testing the google get details service in subsequent test

    // asyncTest("Google Places search for US taxis", function () {
    //     expect(1);

    //     BGS.GoogleAPI.googleGetNearbyResults()
    //         .then(function (taxis, isCached, status) {
    //                 //store first taxi model in our created var simply to use for the later test where we query details
    //                 taxiToGetDetailsFor = taxis.first();
    //                 ok(status == google.maps.places.PlacesServiceStatus.OK, 'Google returned our US taxi list successfully; First taxi returned; ' + JSON.stringify(taxis.first()));
    //                 start();
    //             },
    //             function (error) {
    //                 ok(error != google.maps.places.PlacesServiceStatus.OK, 'Google failed to return our taxi list');
    //                 start();
    //             });

    // });

    // asyncTest("Google Places search for London taxis", function () {
    //     expect(1);

    //     var london = {'lat' : 51.514483, 'lng' : -0.134926};

    //     BGS.GoogleAPI.googleGetNearbyResults(searchType = null, searchTerm = null, refresh = true, london)
    //         .then(function (taxis, isCached, status) {
    //                 ok(status == google.maps.places.PlacesServiceStatus.OK, 'Google returned our London taxi list successfully; First taxi returned; ' + JSON.stringify(taxis.first()));
    //                 start();
    //             },
    //             function (error) {
    //                 ok(error != google.maps.places.PlacesServiceStatus.OK, 'Google failed to return London taxi list');
    //                 start();
    //             });

    // });

    // asyncTest("Google Places search for Australian taxis", function () {
    //     expect(1);

    //     var pyrmont = {'lat' : -33.8665433, 'lng' : 151.1956316};

    //     BGS.GoogleAPI.googleGetNearbyResults(searchType = null, searchTerm = null, refresh = true, pyrmont)
    //         .then(function (taxis, isCached, status) {
    //                 ok(status == google.maps.places.PlacesServiceStatus.OK, 'Google returned our Australian taxi list successfully; First taxi returned; ' + JSON.stringify(taxis.first()));
    //                 start();
    //             },
    //             function (error) {
    //                 ok(error != google.maps.places.PlacesServiceStatus.OK, 'Google failed to return London our taxi list');
    //                 start();
    //             });

    // });

    // asyncTest("Testing taxi list caching", function () {
    //     expect(5);
    //     var elapsed1 = null,     
    //         elapsed2 = null,
    //         cacheIsFaster = true,
    //         startTime = new Date().getTime();

    //     //1. query foursquare for our bar list
    //     BGS.GoogleAPI.googleGetNearbyResults()
    //         .then(function (taxiList, isCached, status) {
    //             ok(true, 'Retrieved taxi list via Google Places API');
    //             ok(isCached == false, 'Taxis were not cached');
    //             //2. calculate the time it took to return
    //             elapsed1 = new Date().getTime() - startTime;

    //             //3. call our async methoad again 100 times; all 100 should be faster than the actual call
    //             for (var i = 0; i < 100; i++) {
    //                 //reset our start time on each loop through
    //                 startTime = new Date().getTime();

    //                 var usedCache = true; //set a flag for checking if we used the cache the whole time
    //                 BGS.GoogleAPI.googleGetNearbyResults()
    //                     .then(function (taxiList, isCached) {
    //                         if (isCached == false) usedCache = false; //this should always be true here
    //                         //we should only be querying foursquare the first request; the rest should
    //                         //use the cached object on foursquare.js and significantly faster
    //                         elapsed2 = new Date().getTime() - startTime;

    //                         //check if our asynch request ever returned faster than our cache of bars
    //                         if (elapsed1 != null && elapsed2 != null && elapsed1 < elapsed2) cacheIsFaster = false;

    //                         //check our boolean setting at the end of looping through i times
    //                         if (i == 99) {
    //                             ok(true, 'Finished looping through all 99 additional googleGetNearbyResults() requests');
    //                             ok(cacheIsFaster == true, 'Taxi list cache always faster than async google places api requests');
    //                             ok(usedCache == true, 'We used the cached taxi list the whole time');
    //                             start();
    //                         }

    //                     }, function (error) {
    //                         ok(false, 'there was an error retrieving taxi list');
    //                         console.log('login error = ' + JSON.stringify(error));
    //                         start();
    //                     });
    //             }
    //         }, function (error) {
    //             ok(false, 'there was an error retrieving taxi list');
    //             console.log('login error = ' + JSON.stringify(error));
    //             start();
    //         });

    // });

        // asyncTest("Google Places get taxi details", function () {
        //     expect(1);

        //     BGS.GoogleAPI.googleGetPlaceDetails(taxiToGetDetailsFor, function(taxi, status) {
        //         ok(status == google.maps.places.PlacesServiceStatus.OK, 'Google returned our taxi details successfully');
        //         start();
        //     });
        // });

    

    // //**************************** UI TESTING *********************************************************************//
    // //*************************************************************************************************************//    
    // module('UI Layout', {
    //     setup: function () {
    //         BGS.StartApp.Start.Controller.logIn(testuser, testpass)
    //             .then(function (success) {
    //                 $('#qunit').trigger('nav-controller');
    //             });
    //     },
    //     teardown: function () {
    //         //do stuff after each test runs as needed
    //         Parse.User.logOut();
    //     }
    // });

    // asyncTest("Calculating and Setting NavController Height", function () {
    //     expect(1);
    //     $('#qunit').on("nav-controller", function () {
    //         ///artificially set the heights of our UI pieces' CSS properties
    //         $('body').css({
    //             'height': '400'
    //         });
    //         $('.header').css({
    //             'height': '25'
    //         });
    //         $('.places-bar').css({
    //             'height': '35'
    //         });

    //         BGS.MainApp.Main.Controller.calculateNavControllerHeight(function (navControllerHeight) {
    //             equal(navControllerHeight, 340, 'Navigation controller height properly calculated');
    //             start(); //call start when ready for test to be run
    //         });
    //     });
    // });
});