var BGS = new Marionette.Application();//create our namespace; all objects will be referenced with this var as a prefix

//we're extending a Router, but it's acting more like a generic controller so I'm calling it that
BGS.Controller = Parse.Router.extend({
    routes: {"":"default"},

    initialize: function(options){
        // console.log('index.js initialize');
        BGS.routeHistory = [];//create an array to store all triggered routes in
        var s = this;
        //bind all route events that occur from our router to call the storeRoute() function
        //we do this to keep our own history for navigation as the router and Parse aren't
        //properly popping items out of the history upon calling a Back button or Cancel button
        //function; this is possibly related to our use of the Backstack/Backstack-Parse library
        //for navigation but I don't have time to sift through all that code to figure it out
        Parse.history.bind("all", function (route, router) {
            // console.log('attempt to add to parse history');
            //this function is called anytime Parse.history is added to
            s.storeRoute(window.location.hash);
        });
    },
    
    storeRoute: function(route) {
        // console.log('index.js storeRoute');
        //store the route that just got triggered in our route history array
        BGS.routeHistory.push(route);
    },

    //call previousRoute() anytime we call BGS.Utilities.navController.pop() in order to also
    //pop the route off the Parse.history stack and not just the route's view off the UI stack
    previousRoute: function() {
        // console.log('index.js previousRoute');
        if(BGS.routeHistory.length > 1) {
            this.navigate(BGS.routeHistory[BGS.routeHistory.length-2], {trigger: false, replace: true});
            BGS.routeHistory.pop();//pop route off the stack
        } else {
            //no routes in history, trigger default route
            this.navigate("", {trigger: false, replace: true});
        }
    },

    resetNavController: function() {
        BGS.Utilities.navController = new BackStack.StackNavigator({el:'#nav-container'});
    },

    default: function () {
        // $('#container').show();
    },

    showView: function (view, effect, cb) {
        setTimeout(function(){BGS.Utilities.navController.pushView(view, {}, effect);}, 0);//ignoring initial options ({}) for now
        $.isFunction(cb) && cb();
    },

    popView: function (transition) {
        BGS.Utilities.navController.popView(transition);
        BGS.controller.previousRoute();
        BGS.MainApp.Main.Controller.hideSpinner();
    },

    //Transition Effects
    noEffect: function () {
        return new BackStack.NoEffect();
    },

    fadeEffect: function () {
        return new BackStack.FadeEffect();
    },

});

window.addEventListener('load', function () {
    console.log('window load event called');
    //once everything has loaded, tell our template loader to load all our templates
    //from our templates folder and then create our router along with our Parse history
    BGS.Utilities.templateLoader.load(['start',
                             'welcome',
                             'login', 
                             'signup', 
                             'main', 
                             'username', 
                             'forgot-password',
                             'left-panel',
                             'activity',
                             'leaderboard',
                             'player',
                             'places-list',
                             'places-map',
                             'places-map-layout',
                             'places-map-menu',
                             'bar-list-item',
                             'taxi-list-item',
                             'round-setup-options',
                             'round-setup-item-list',
                             'round-setup-item-list-player',
                             'round-setup-item-list-hole',
                             'round-setup-item-list-rule',
                             'list-layout',
                             'round-setup-player-data',
                             'round-setup-rule-data',
                             'places-manual-entry-hole-data',
                             'scorecard-layout',
                             'scorecard-player-list',
                             'scorecard-player-list-item',
                             'scorecard-hole-name-list',
                             'scorecard-hole-score-list',
                             'scorecard-hole-name-list-item',
                             'scorecard-hole-score-list-item',
                             'scorecard-enter-score-data',
                             'scorecard-data-score-list',
                             'scorecard-breakdown-score-list',
                             'scorecard-data-score-list-item',
                             'scorecard-breakdown-list-item',
                             'scorecard-scoring-breakdown-data',
                             'rule-value',
                             'handicap',
                             'address-bar'], 
                             function () {

        BGS.controller = new BGS.Controller();
        $('#qunit').trigger('templatesLoaded');//used for QUnit testing on test/index.html

        // console.log('templates have loaded so start Parse and then the Controller');
        Parse.history.start();
        
        var c = BGS.StartApp.Start.Controller;

        var documentDeviceReady = function() {
            console.log('documentDeviceReady called');
            //********************************* APP STARTS HERE **************************************************//
            c.initialize();
            //********************************* APP STARTS HERE **************************************************//
            c.mobileInits();
        };

        if(BGS.Utilities.isPhonegap()) {
            //is phonegap, wait for all to load before init
            document.addEventListener("deviceready", documentDeviceReady, false);
        } else {
            //not phonegap, init away
            //********************************* APP STARTS HERE **************************************************//
            c.initialize();
            //********************************* APP STARTS HERE **************************************************//
        }
    });

    new FastClick(document.body);
}, false);

BGS.start();//start the marionette application
