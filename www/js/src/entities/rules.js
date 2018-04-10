BGS.module('Entities', function (Entities, BGS, Backbone, Marionette, $, _) {

    //******************** RULE MODELS ***************************************************

    Entities.Rule = Parse.Object.extend({
        className: "Rule",
    });

    // ************************* RULE COLLECTIONS ********************************************************
    // these are the rules currently added to the local scorecard
    // can only ever be up to 4 rules
    Entities.RoundRuleCollection = Parse.Collection.extend({
        model: Entities.Rule,
        comparator: function (rule) {
            return rule.get('value');
        },
        filterDefaultRules: function(results) {
            var modifiedDefaults = [];
            //loop through each result and check for a modifiedDefault value
            //push those values into the array for checking again
            _.each(results, function(result) {
                if (typeof(result.get('modifiedDefault')) != 'undefined') {
                    var modifiedDefault = Parse.Object.extend("Rule");
                    modifiedDefault = result.get('modifiedDefault');
                    modifiedDefaults.push(modifiedDefault.id); 
                }
            });

            //now go through each results and see if it's in our modifiedDefaults array
            //if it is, reject it from our overall results as we don't want to have double entries
            //in our rules list for a rule the user has already modified
            var filteredForModifiedDefaultsResults = _.reject(results, function (result) {
                var unfilteredRule = Parse.Object.extend("Rule");
                unfilteredRule = result;
                return _.contains(modifiedDefaults, unfilteredRule.id);
            });

            //now we need to filter out any results that are not in the round's rules array
            //this is in case a user has removed defaults and doesn't want them to keep pulling back in
            //this won't exist if we've just hit the Create Round button; we still need to cycle through our entire pulled
            //down rules list as the Round.rules array only holds rule pointers and may only have the rule.objectId in it
            if (typeof(BGS.RSApp.RoundSetup.Controller.round.get('rules')) != 'undefined') {
                var filteredForRoundRulesArrayResults = _.filter(filteredForModifiedDefaultsResults, function (rule) {
                    var unfilteredRule = Parse.Object.extend("Rule");
                    unfilteredRule = rule;
                    return _.contains(BGS.RSApp.RoundSetup.Controller.round.get('rules'), unfilteredRule.id);
                });

                // console.log('returned filteredForRoundRulesArrayResults: ' + filteredForRoundRulesArrayResults.length);
                return filteredForRoundRulesArrayResults;//reset the collection with our filtered results
            } else {
                //just return our defaults filtered then as we have no Round.rules array to compare with
                //this should essentially only ever be the defaults list unless we had an error saving our Round.rules array previously

                // console.log('returned filteredForModifiedDefaultsResults: ' + filteredForModifiedDefaultsResults.length);
                return filteredForModifiedDefaultsResults;
            }  
        },

        filterDrinks: function() {
            var drinks =  _.filter(this.models, function(model) {
                //modify the dummy model's properties we just set in addDefaultRule to cater to drinks
                if(model.get('type') === 'dummy') model.set('type', 'drink');
                if(model.get('name') === 'Touch to Add New Rule') model.set('name', 'Touch to Add New Drink');
                return model.get('type') === 'drink';
            });

            this.reset(drinks);
            return this;
        },

        filterBonuses: function() {
            var bonuses = _.filter(this.models, function(model) {
                //modify the dummy model's properties we just set in addDefaultRule to cater to bonuses
                if(model.get('type') === 'dummy') model.set('type', 'bonus');
                if(model.get('name') === 'Touch to Add New Rule') model.set('name', 'Touch to Add New Bonus');
                return model.get('type') === 'bonus';
            });

            this.reset(bonuses);
            return this;
        },

        filterPenalties: function() {
            var penalties = _.filter(this.models, function(model) {
                //modify the dummy model's properties we just set in addDefaultRule to cater to penalties
                if(model.get('type') === 'dummy') model.set('type', 'penalty');
                if(model.get('name') === 'Touch to Add New Rule') model.set('name', 'Touch to Add New Penalty');
                return model.get('type') === 'penalty';
            });

            this.reset(penalties);
            return this;
        },

        //remove any default player from display on the scorecard
        filterOutDefaultRule: function() {
            var rules =  _.filter(this.models, function(model) {
                return (model.get('name') != 'Touch to Add New Drink' && model.get('name') != 'Touch to Add New Bonus' && model.get('name') != 'Touch to Add New Penalty');
            });

            this.reset(rules);
            return this;
        }
    });    

    var addDefaultRule = function() {
        //we need to add a dummy model entry for the very last item in collection to use as the Add New rule
        //however, we will not actually save those dummy entry to Parse, they're just for show
        var shouldAddNewRule = true; //assume yes for our flag

        //loop through each model first to see if we already have a single dummy entry, if so return
            this.rulesCollection.each(function(model) {
                if (model.get('name') === 'Touch to Add New Rule') shouldAddNewRule = false; //set our flag to false
            });

            //check our flag now
            if (shouldAddNewRule === false) return;
            //else, it's ok to add a new default player
            var rule = new Entities.Rule();
            rule.set('name', 'Touch to Add New Rule');
            rule.set('type', 'dummy');
            rule.set('value', 99999999999999); //used for sorting purposes
            var ruleACL = new Parse.ACL(Parse.User.current());
            ruleACL.setPublicReadAccess(true); //anyone can read
            rule.setACL(ruleACL); //only creator can update

            this.rulesCollection.add(rule);
    };

    //we'll use this as the default starting point for creating a new round
    //defaultsOnly will only be set (to true) when we are resetting to default rules so we don't pull
    //in any rules that are modified defaults in the filterDefaultRules method
    var initializeRules = function (rules, defaultsOnly) {
        var s = this;
        s.rulesCollection = new Entities.RoundRuleCollection();
        s.rulesCollection = rules;

        if (defaultsOnly !== true) {
            var new_rules = s.rulesCollection.filterDefaultRules(s.rulesCollection.models);
            s.rulesCollection.reset(new_rules);

            //add a default dummy rule to end of collection which we'll use for the Add New button
            addDefaultRule();
        }

        return s.rulesCollection.models;
    };

    var API = {
        getAllRoundRuleEntities: function () {
            var rules = new Entities.RoundRuleCollection(),
                dfd = $.Deferred(),
                p = dfd.promise();

            var allRoundRulesQuery = new Parse.Query('Rule');

            allRoundRulesQuery.equalTo("round", BGS.RSApp.RoundSetup.Controller.round);
            var defaultsQuery = new Parse.Query('Rule');
            defaultsQuery.equalTo("isDefault", true);
            defaultsQuery.doesNotMatchQuery("modifiedDefault", allRoundRulesQuery); //filter out any customized defaults so we don't show double
            var compoundQuery = Parse.Query.or(defaultsQuery, allRoundRulesQuery);

            rules.query = compoundQuery;

            rules.fetch()
                .then(function (data) {
                        // console.log('rules fetched returned with data length = ' + data.length);
                        dfd.resolve(data);
                    },
                    function (e) {
                        console.log('e with rule fetch: ' + JSON.stringify(e));
                        dfd.reject(e);
                    });

            $.when(p).done(function (rules) {
                //fill in dummy rule entries which won't be saved for unfilled rows of scorecard
                var models = initializeRules(rules);
                rules.reset(models);
            });
            return p;
        },

        getDefaultRuleEntities: function (defaultsOnly) {
            //this function will resets all rules to defaults
            var rules = new Entities.RoundRuleCollection(),
                dfd = $.Deferred(),
                p = dfd.promise();

            var query = new Parse.Query('Rule');
            query.equalTo("isDefault", true);
            rules.query = query;

            rules.fetch()
                .then(function (data) {
                        var models = initializeRules(data, defaultsOnly);
                        rules.reset(models);
                        dfd.resolve(rules);
                    },
                    function (e) {
                        console.log('e with rule fetch: ' + JSON.stringify(e));
                        dfd.reject(e);
                    });
            return p;
        },

        getDefaultDrinkRuleEntities: function() {
            BGS.MainApp.Main.Controller.showSpinner('Retrieving drinks');
            var dfd = $.Deferred(),
                p = dfd.promise();

            API.getDefaultRuleEntities()
            .then(function(rules){
                var drinks = rules.filterDrinks();
                // console.log('default drinks count = ' + drinks.length);
                dfd.resolve(drinks);
            },
            function(e){
                dfd.reject(e);
            });

            $.when(p).done(function() {
                BGS.MainApp.Main.Controller.hideSpinner();
            });

            return p;
        },

        getDefaultBonusRuleEntities: function() {
            BGS.MainApp.Main.Controller.showSpinner('Retrieving bonuses');
            var dfd = $.Deferred(),
                p = dfd.promise();

            API.getDefaultRuleEntities()
            .then(function(rules){
                var drinks = rules.filterBonuses();
                // console.log('default bonus count = ' + drinks.length);
                dfd.resolve(drinks);
            },
            function(e){
                dfd.reject(e);
            });

            $.when(p).done(function() {
                BGS.MainApp.Main.Controller.hideSpinner();
            });

            return p;
        },

        getDefaultPenaltyRuleEntities: function() {
            BGS.MainApp.Main.Controller.showSpinner('Retrieving penalties');
            var dfd = $.Deferred(),
                p = dfd.promise();

            API.getDefaultRuleEntities()
            .then(function(rules){
                var drinks = rules.filterPenalties();
                // console.log('default penalty count = ' + drinks.length);
                dfd.resolve(drinks);
            },
            function(e){
                dfd.reject(e);
            });

            $.when(p).done(function() {
                BGS.MainApp.Main.Controller.hideSpinner();
            });

            return p;
        },

        getDrinkRuleEntities: function() {
            BGS.MainApp.Main.Controller.showSpinner('Retrieving drinks');
            //must use a dfdred to allow for $.when(p).done use at bottom
            var dfd = $.Deferred(),
                p = dfd.promise();

            API.getAllRoundRuleEntities()
            .then(function(rules){
                var drinks = new Entities.RoundRuleCollection();
                drinks = rules.filterDrinks();
                // console.log('drinks count = ' + drinks.length);

                return dfd.resolve(drinks);
            },
            function(e){
                return dfd.reject(e);
            });

            $.when(p).done(function() {
                BGS.MainApp.Main.Controller.hideSpinner();
            });

            return p;
        },

        getBonusRuleEntities: function() {
            BGS.MainApp.Main.Controller.showSpinner('Retrieving bonuses');
            //must use a dfdred to allow for $.when(p).done use at bottom
            var dfd = $.Deferred(),
                p = dfd.promise();

            API.getAllRoundRuleEntities()
            .then(function(rules){
                var bonuses = rules.filterBonuses();
                // console.log('bonus count = ' + bonuses.length);
                dfd.resolve(bonuses);
            },
            function(e){
                dfd.reject(e);
            });

            $.when(p).done(function() {
                BGS.MainApp.Main.Controller.hideSpinner();
            });

            return p;
        },

        getPenaltyRuleEntities: function() {
            BGS.MainApp.Main.Controller.showSpinner('Retrieving penalties');
            //must use a dfdred to allow for $.when(p).done use at bottom
            var dfd = $.Deferred(),
                p = dfd.promise();

            API.getAllRoundRuleEntities()
            .then(function(rules){
                var penalties = rules.filterPenalties();
                // console.log('penalty count = ' + penalties.length);
                dfd.resolve(penalties);
            },
            function(e){
                dfd.reject(e);
            });

            $.when(p).done(function() {
                BGS.MainApp.Main.Controller.hideSpinner();
            });

            return p;
        },

        getRuleEntity: function (ruleId) {
            var rule = new Entities.Rule({
                id: ruleId
            });
            var dfd = $.Deferred(),
                p = dfd.promise();

            rule.fetch()
            .then(function(rule){
                dfd.resolve(rule);
            },
            function(e){
                console.log('e: ' + JSON.stringify(e));
                dfd.reject(e);
            });

            return p;
        }
    };

    BGS.reqres.setHandler("rule:id", function (id) {
        BGS.MainApp.Main.Controller.showSpinner('Loading...');
        return API.getRuleEntity(id);
    });

    BGS.reqres.setHandler("rule:default:entities", function (defaultsOnly) {
        BGS.MainApp.Main.Controller.showSpinner('Loading...');
        //need to pass in defaultsOnly = true to ensure we won't filter out any defaults in case we've created modified default rules already
        return API.getDefaultRuleEntities(defaultsOnly);
    });

    BGS.reqres.setHandler("rule:default:drink:entities", function () {
        BGS.MainApp.Main.Controller.showSpinner('Pouring drinks...');
        return API.getDefaultDrinkRuleEntities();
    });

    BGS.reqres.setHandler("rule:default:bonus:entities", function () {
        BGS.MainApp.Main.Controller.showSpinner('Fetching bonuses...');
        return API.getDefaultBonusRuleEntities();
    });

    BGS.reqres.setHandler("rule:default:penalty:entities", function () {
        BGS.MainApp.Main.Controller.showSpinner('Loading...');
        return API.getDefaultPenaltyRuleEntities();
    });

    BGS.reqres.setHandler("round:rule:all:entities", function () {
        BGS.MainApp.Main.Controller.showSpinner('Checking IDs...');
        return API.getAllRoundRuleEntities();
    });

    BGS.reqres.setHandler("round:rule:drink:entities", function () {
        BGS.MainApp.Main.Controller.showSpinner('Ordering drinks...');
        return API.getDrinkRuleEntities();
    });

    BGS.reqres.setHandler("round:rule:bonus:entities", function () {
        BGS.MainApp.Main.Controller.showSpinner('Loading...');
        return API.getBonusRuleEntities();
    });

    BGS.reqres.setHandler("round:rule:penalty:entities", function () {
        BGS.MainApp.Main.Controller.showSpinner('Loading...');
        return API.getPenaltyRuleEntities();
    });


    BGS.reqres.setHandler("scorecard:rule:drink:entities", function () {
        BGS.MainApp.Main.Controller.showSpinner('Ordering drinks...');
        var p = new Parse.Promise();
        
        API.getDrinkRuleEntities()
        .then(function(rules){
             var col = new Entities.RoundRuleCollection();
                 col = rules.filterOutDefaultRule();

            p.resolve(col);
        });

        return p;
    });

    BGS.reqres.setHandler("scorecard:rule:bonus:entities", function () {
        BGS.MainApp.Main.Controller.showSpinner('Loading...');
        var p = new Parse.Promise();

        API.getBonusRuleEntities()
        .then(function(rules){
             var col = new Entities.RoundRuleCollection();
                 col = rules.filterOutDefaultRule();

            p.resolve(col);
        });

        return p;
    });

    BGS.reqres.setHandler("scorecard:rule:penalty:entities", function () {
        BGS.MainApp.Main.Controller.showSpinner('Loading...');
        var p = new Parse.Promise();

        API.getPenaltyRuleEntities()
        .then(function(rules){
             var col = new Entities.RoundRuleCollection();
                 col = rules.filterOutDefaultRule();

            p.resolve(col);
        });

        return p;
    });

});