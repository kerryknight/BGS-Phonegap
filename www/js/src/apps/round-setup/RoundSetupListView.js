BGS.module('RSApp.RoundSetup', function (RoundSetup, BGS, Backbone, Marionette, $, _) {
    RoundSetup.Layout = Backbone.Marionette.Layout.extend({
        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('list-layout'));
        },

        regions: {
            listRegion: '#list-region',
            dataRegion: '#data-region'
        }
    });

    RoundSetup.ListView = Backbone.Marionette.CompositeView.extend({
        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('round-setup-item-list'));
        },

        itemViewContainer: ".rs-item-list",

        initialize: function (options) {
            console.log('RoundSetup.ListView initialize');
        },

        remove: function () {
            // console.log('OptionsListView remove:');
            this.undelegateEvents();
        },

        modelEvents: {
            "change": "modelChanged"
        },

        collectionEvents: {
            "add": "modelAdded",
            // "destroy": "modelRemoved",
            "remove": "modelRemoved",
            // "delete": "modelRemoved",
        },

        modelChanged: function () {
            console.log('RoundSetup.ListView modelChanged:');
        },

        modelAdded: function () {
            console.log('RoundSetup.ListView modelAdded:');
            this.refreshScrollView();
        },

        modelRemoved: function() {
            console.log('RoundSetup.ListView modelRemoved:');
            this.render();//tell list view to refresh its
        },

        onBeforeRender: function () {
            // console.log('OptionsListView onBeforeRender:');
        },

        onRender: function () {
            // console.log('RoundSetup.ListView onRender');
        },

        refreshScrollView: function (bottomOffset) {
            var s = this;
            setTimeout(function () {
                s.sv.refresh(bottomOffset);
            }, 500);
        },

        createScrollView: function (elementToScroll, bottomOffset, cb) {
            var s = this;
            //create scrollview after a slight delay to ensure DOM fully loaded,
            //a best practice per the original developer of iScroll.js
            setTimeout(function () {

                s.sv = new IScroll('#iscroll-wrapper', {
                    mouseWheel: true,
                    tap: true,
                    bottomOffset: bottomOffset //knightka 21Aug2013 added this options to iscroll5.js
                });

                //set the scroll view's height dynamically based on the window height minus the header/footer height
                var containerHeight = parseInt($('#container').css('height'), 10), //strip out 'px' from css property
                    headerHeight = parseInt($('.header').css('height'), 10), //strip out 'px' from css property
                    placesBarHeight = parseInt($('.places-bar').css('height'), 10), //strip out 'px' from css property
                    scrollerHeight = containerHeight - (headerHeight + placesBarHeight); //add 25px of buffer to offset CSS margin of 20px we added to top
                $('#iscroll-wrapper').css('height', scrollerHeight);

                s.sv.enabled = true;

                containerHeight, headerHeight, placesBarHeight, scrollerHeight = null; //memory management

                BGS.MainApp.Main.Controller.hideSpinner('round setup view');

                $.isFunction(cb) && cb();

            }, 100);
        },

        showHeaderButton: function() {
            $('.right-header-button span').html('Done');
            $('.right-header-button').show().on('click', function () { 
                //take us back to the previous view
                BGS.MainApp.Main.Controller.loadRSApp(shouldCreateNew = false);
            });
        },

        setTableFooter: function(tableType) {
            var s = this;
            var footerToAdd = tableType === 'players' ? 'Each scorecard can have 1-4 players' : 'Not enough nearby bars for 9? Play some twice!';
            $('.table-footer').html(footerToAdd);
        }
    });

    //extending the parent RoundSetup.ListView class
    RoundSetup.ListPlayersView = RoundSetup.ListView.extend({

        initialize: function (options) {
            this.options.type = 'players';
            BGS.MainApp.Main.Controller.setNavBarTitle('Add/Edit Players');
            this.buttonClicked = false;

            //show our Done button to return to root view
            this.showHeaderButton();

            var $itemList = $(".rs-item-list");
            $itemList.html(""); //clear the list out
            $itemList.css('height', 0);

        },

        remove: function () {
            this.undelegateEvents();
            $('.right-header-button').hide().unbind();
        },

        onRender: function () {
            var s = this;
            BGS.MainApp.Main.Controller.hideSpinner();

            setTimeout(function() {
                s.createScrollView(null, 75, function () {
                    s.refreshScrollView();
                    s.setTableFooter('players');
                });
            }, 0);
        }
    });

    //extending the parent RoundSetup.ListView class; essentially identical to ListPlayersView; could probably abstract even further for better code reuse
    RoundSetup.ListRulesView = RoundSetup.ListView.extend({

        initialize: function (options) {
            // console.log('ListRulesView initialize');
            BGS.MainApp.Main.Controller.setNavBarTitle('Add/Edit Rules');
            this.buttonClicked = false;

            //show our Done button to return to root view
            this.showHeaderButton();

            var $itemList = $(".rs-item-list");
            $itemList.html(""); //clear the list out
            $itemList.css('height', 0);
            $itemList = null; //m.m.
        },

        remove: function () {
            this.undelegateEvents();
            $('.right-header-button').hide().unbind();
        },

        onRender: function () {
            var s = this;
            BGS.MainApp.Main.Controller.hideSpinner();

            setTimeout(function() {
                s.createScrollView(null, null, function () {

                    //zebra striping
                    $('.rs-item-list li:even').addClass('lt-lt-gray');
                    $('.rs-item-list li:odd').addClass('no-color');

                    //remove zebra striping from last row, the Add New row
                    $('.rs-item-list li:last').removeClass('lt-lt-gray').addClass('lt-drk-gray'); 

                    s.refreshScrollView();
                });
            }, 0);
        }
    });

    //extending the parent RoundSetup.ListView class
    RoundSetup.ListHolesView = RoundSetup.ListView.extend({

        initialize: function (options) {
            this.options.type = 'holes';
            BGS.MainApp.Main.Controller.setNavBarTitle('Add/Edit Holes');
            this.buttonClicked = false;

            //show our Done button to return to root view
            this.showHeaderButton();

            var $itemList = $(".rs-item-list");
            $itemList.html(""); //clear the list out
            $itemList.css('height', 0);
            $itemList = null; //m.m.

        },

        remove: function () {
            this.undelegateEvents();
            $('.right-header-button').hide().unbind();
        },

        onRender: function () {
            var s = this;
            BGS.MainApp.Main.Controller.hideSpinner();
            
            this.createScrollView(null, function () {
                s.setTableFooter('holes');
                s.refreshScrollView();
            });
        }
    });

    RoundSetup.PlayerDataView = Backbone.Marionette.ItemView.extend({

        className: 'round-setup-player-data',

        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('round-setup-player-data'));
        },

        initialize: function (options) {
            // console.log('PlayerDataView initialize');
            this.dataViewIsShowing = false;
        },

        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
                'keypress input[type=text]': 'saveOnEnter',
                'keypress input[type=number]': 'saveOnEnter'
            };

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchend .rs-save-button": "savePlayerClicked",
                    "touchend .rs-delete-button": "deletePlayerClicked",
                    "touchend .rs-cancel-button": "hideDataView",
                    "touchend .handicap-link": "handicapExplanationClicked"
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "click .rs-save-button": "savePlayerClicked",
                    "click .rs-delete-button": "deletePlayerClicked",
                    "click .rs-cancel-button": "hideDataView",
                    "click .handicap-link": "handicapExplanationClicked"
                });
            }
            return events_hash;
        },

        onRender: function () {
            // console.log('PlayerDataView onRender');
        },

        remove: function () {
            this.undelegateEvents();
            this.unbind();
        },

        createDataScrollView: function (elementToScroll, bottomOffset, cb) {
            var s = this;
            //create scrollview after a slight delay to ensure DOM fully loaded,
            //a best practice per the original developer of iScroll.js
            setTimeout(function () {

                s.dataScrollView = new IScroll('#iscroll-data-wrapper', {
                    mouseWheel: true,
                    tap: true,
                    bottomOffset: bottomOffset //knightka 21Aug2013 added this options to iscroll5.js
                });

                s.dataScrollView.enabled = true;

                $.isFunction(cb) && cb();

            }, 100);
        },

        showDataView: function (e, model) {
            this.delegateEvents();

            //highlight our clicked row and fade all other rows
            $(".rs-options-header").addClass("transparent").removeClass('selected-item');
            var thisParent = $(e.target).closest('li');
            thisParent.removeClass('transparent').addClass('selected-item');

            var s = this,
                $editPlayerSpan = $('#player-edit-heading'),
                $dataRegion = $('#data-region'),
                $nameInput = $('#player-displayname'),
                $handicapInput = $('#player-handicap'),
                name = '',
                handicap = '';
            this.model = model;

            //always clear the class color from header bar first, then recalculate and set player number
            $editPlayerSpan.html('Edit Player ' + this.model.get('playerNum'));
            name = (this.model.get('displayName') != 'Touch to Add New Player' ? this.model.get('displayName') : '');
            $nameInput.val(name);
            handicap = this.model.get('handicap');
            this.model.get('displayName') != 'Touch to Add New Player' ? $handicapInput.val(handicap) : $handicapInput.val('');
            $dataRegion.slideDown(200); //this seems reversed in browser for some reason

            //disable delete button if no player added yet
            var $removeButton = $(".rs-delete-button");
            if (this.model.get('displayName') != 'Touch to Add New Player'){
                // $removeButton.removeClass("transparent").addClass('drk-purple');
                $removeButton.show();
            } else {
                //gray out the button completely so it appears disabled
                // $removeButton.addClass("transparent").css("background-color", "rgba(59, 61, 64, 1.0)").removeClass('drk-purple');
                $removeButton.hide();
            }

            setTimeout(function() {
                s.createDataScrollView(null, 0, function () {
                    // set the scroll view's height dynamically based on the window height minus the header/footer height
                    var containerHeight = parseInt($('#data-region').css('height'), 10), //strip out 'px' from css property
                        headerHeight = parseInt($('.form-data-table-header').css('height'), 10), //strip out 'px' from css property
                        footerHeight = parseInt($('.form-data-table-footer').css('height'), 10), //strip out 'px' from css property
                        scrollerHeight = containerHeight - (headerHeight + footerHeight + 2);//slight correction

                    $('#iscroll-data-wrapper').css('height', scrollerHeight);
                    $('.form-data-row').css('height', scrollerHeight);

                    //scroll up and down briefly to show user there is more than is visible if necessary
                    if(s.dataViewIsShowing === false && $('#iscroll-data').height() > ($('#iscroll-data-wrapper').height() + 10)) {
                        setTimeout(function() {
                            s.dataScrollView.scrollTo(0, -35, 100);
                        }, 0);

                        setTimeout(function() {
                            s.dataScrollView.scrollTo(0, 0, 300);
                        }, 100);

                        s.dataViewIsShowing = true;
                    }

                    containerHeight, headerHeight, footerHeight, scrollerHeight = null; //memory management
                    $removeButton, $editPlayerSpan, $dataRegion, $nameInput, $handicapInput, thisParent = null; //m.m.
                });
            }, 100);
        },

        hideDataView: function () {
            var $rsPlayerData = $('.round-setup-player-data'),
                $dataRegion = $('#data-region');

            $dataRegion.slideUp(200);//slide up seems reversed
            //tell our scrollview to scroll back up to the top
            RoundSetup.Controller.roundSetupListPlayersView.sv.scrollTo(0, 0, 400);

            //remove the transparency for all child item views and unhighlight
            $(".rs-options-header").removeClass("transparent").removeClass('selected-item');
            $('.topcoat-text-input').removeClass('e success');
            this.dataViewIsShowing = false;
            $rsPlayerData, $dataRegion = null; //m.m.
        },

        handicapExplanationClicked: function() {
            BGS.MainApp.Main.Controller.showHelpView('handicap');
        },

        deletePlayerClicked: function(e) {
            var s = this;
            if(this.model.get('isUserAccount') === true) {
                confirm({
                    header: "Player cannot be deleted",
                    message: "This player is associated with your Bar Golf Stars user account and cannot be deleted. If you wish to delete your BGS account, please access this feature from the sliding menu on the left.",
                    confirmButton: "OK"
                });
            } else if (this.model.get('displayName') === 'Touch to Add New Player'){
                //do nothing instead of showing an alert for now
            } else {
                confirm({
                    header: "Are you sure?",
                    message: "Deleting this player will remove him/her from the current round and all of this player's statistics for the round will be erased. There is no undo.",
                    confirmButton: "Yes, delete",
                    cancelButton: "No, cancel"
                    },
                    function () {
                        //destroy model
                        RoundSetup.Controller.deletePlayer(s.model)
                        .then(function(){
                            BGS.MainApp.Main.Controller.hideSpinner();
                            RoundSetup.Controller.roundSetupListPlayersView.setTableFooter('players');
                            s.hideDataView();
                        },
                        function(e) {
                            BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Error Deleting Player", JSON.stringify(e) + ' Please try again.', isError = true, showAtBottom = true);
                        });
                    }
                );
            }
        },

        saveOnEnter: function (e) {
            //check if we hit the enter key, which will allow us to submit as well
            if (e.keyCode != 13) return;
            this.savePlayerClicked(e);
        },

        savePlayerClicked: function(e) {
            $('input:focus').blur(); //to dismiss the keyboard

            if (!this.validateForm()) {
                return;
            }

            this.model.set('user', Parse.User.current());
            this.model.set('playerNum', (this.model.collection.indexOf(this.model) + 1));
            this.model.set('round', RoundSetup.Controller.round);
            this.model.set('scorecard', RoundSetup.Controller.scorecard);
            this.model.set('displayName', $('#player-displayname').val());

            var $handicap = $('#player-handicap'),
                handicap = $handicap.val().trim();
            handicap === '' ? this.model.set('handicap', 0) : this.model.set('handicap', parseInt(handicap, 10));

            var s = this;
            RoundSetup.Controller.savePlayer(this.model)
            .then(function(){
                RoundSetup.Controller.roundSetupListPlayersView.setTableFooter('players');
                s.hideDataView();
            },
            function(e) {
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Error Saving Player", JSON.stringify(e) + ' Please try again.', isError = true, showAtBottom = true);
            });
        },

        validateForm: function () {
            var isValidated = true;
            if ($('#player-displayname').val().length < 3 || $('#player-displayname').val().length > 20 || $('#player-displayname').closest('input').hasClass('e')) {
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops!", "Please enter a display name 3-20 characters long with no special characters. This will be displayed to other players.", isError = true, showAtBottom = true);
                isValidated = false;
                return isValidated;
            }

            if ($('#player-handicap').closest('input').hasClass('e')) {
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops!", "Handicaps must only be positive/negative numbers or 0 (no handicap). Negative numbers assist weaker players while higher positive numbers make it tougher for those stronger players.", isError = true, showAtBottom = true);
                isValidated = false;
                return isValidated;
            }

            return isValidated;
        },
    });

    RoundSetup.RuleDataView = Backbone.Marionette.ItemView.extend({

        className: 'round-setup-rule-data',

        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('round-setup-rule-data'));
        },

        initialize: function (options) {
            this.dataViewIsShowing = false;
        },

        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
                'keypress input[type=text]': 'saveOnEnter',
                'keypress textarea': 'saveOnEnter',
                'keypress input[type=number]': 'saveOnEnter'
            };

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchend .rs-save-button": "saveRuleClicked",
                    "touchend .rs-delete-button": "deleteRuleClicked",
                    "touchend .rs-cancel-button": "hideDataView",
                    "touchend .value-link": "valueExplanationClicked"
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "click .rs-save-button": "saveRuleClicked",
                    "click .rs-delete-button": "deleteRuleClicked",
                    "click .rs-cancel-button": "hideDataView",
                    "click .value-link": "valueExplanationClicked"
                });
            }
            return events_hash;
        },

        onRender: function () {
        },

        remove: function () {
            this.undelegateEvents();
            this.unbind();
        },

        createDataScrollView: function (elementToScroll, bottomOffset, cb) {
            var s = this;
            //create scrollview after a slight delay to ensure DOM fully loaded,
            //a best practice per the original developer of iScroll.js
            setTimeout(function () {

                s.dataScrollView = new IScroll('#iscroll-data-wrapper', {
                    mouseWheel: true,
                    tap: true,
                    bottomOffset: bottomOffset //knightka 21Aug2013 added this options to iscroll5.js
                });

                s.dataScrollView.enabled = true;

                $.isFunction(cb) && cb();

            }, 100);
        },

        showDataView: function (e, model) {
            this.delegateEvents();

            //highlight our clicked row and fade all other rows
            $(".rs-options-header").addClass("transparent").removeClass('selected-item');
            var thisParent = $(e.target).closest('li');
            thisParent.removeClass('transparent').addClass('selected-item');

            var s = this,
                $editRuleSpan = $('#rule-edit-heading'),
                $editRuleName = $('#name-title'),
                $editRuleValue = $('#value-title'),
                $editRuleDesc = $('#description-title'),
                $dataRegion = $('#data-region'),
                $nameInput = $('#rule-name'),
                $descriptionInput = $('#rule-description'),
                $valueInput = $('#rule-value'),
                name = '',
                description = '',
                value = '';
            this.model = model;

            //disable delete button if no player added yet
            var $removeButton = $(".rs-delete-button");

            description = this.model.get('description');
            value = this.model.get('value');

            if(this.model.get('name') != 'Touch to Add New Drink' && this.model.get('name') != 'Touch to Add New Bonus' && this.model.get('name') != 'Touch to Add New Penalty') {
                name = this.model.get('name');
                $descriptionInput.val(description);
                $valueInput.val(value);
                // $removeButton.removeClass("transparent").addClass('drk-purple');
                $removeButton.show();
            } else {
                name = '';
                $descriptionInput.val('');
                $valueInput.val('');
                //gray out the button completely so it appears disabled
                // $removeButton.addClass("transparent").css("background-color", "rgba(59, 61, 64, 1.0)").removeClass('drk-purple'); 
                $removeButton.hide();
            }   

            //set our heading
                if (this.model.get('type') === 'drink') {
                    //always clear the class color from header bar first, then recalculate and set player number
                    $editRuleSpan.html('Edit Drink Rule');
                    $editRuleName.html('Drink Name*');
                    $editRuleValue.html('Drink Stroke Value*');
                    $editRuleDesc.html('Drink Description');
                } else if (this.model.get('type')  === 'bonus'){
                    $editRuleSpan.html('Edit Bonus Rule');
                    $editRuleName.html('Bonus Name*');
                    $editRuleValue.html('Bonus Stroke Value*');
                    $editRuleDesc.html('Bonus Description');
                } else {
                    $editRuleSpan.html('Edit Penalty Rule');
                    $editRuleName.html('Penalty Name*');
                    $editRuleValue.html('Penalty Stroke Value*');
                    $editRuleDesc.html('Penalty Description');
                }
            $nameInput.val(name);            

            //make sure we can see whatever we clicked on
            var max = $('.rs-list').height();
            RoundSetup.Controller.roundSetupListRulesView.sv.maxScrollY = -max;//add some buffer

            $dataRegion.slideDown(200); //this seems reversed in browser for some reason

            setTimeout(function() {
                s.createDataScrollView(null, 0, function () {
                    // set the scroll view's height dynamically based on the window height minus the header/footer height
                    var containerHeight = parseInt($('#data-region').css('height'), 10), //strip out 'px' from css property
                        headerHeight = parseInt($('.form-data-table-header').css('height'), 10), //strip out 'px' from css property
                        footerHeight = parseInt($('.form-data-table-footer').css('height'), 10), //strip out 'px' from css property
                        scrollerHeight = containerHeight - (headerHeight + footerHeight + 2);//slight correction

                    $('#iscroll-data-wrapper').css('height', scrollerHeight);
                    $('.form-data-row').css('height', scrollerHeight);

                    //scroll up and down briefly to show user there is more than is visible
                    if(s.dataViewIsShowing === false && $('#iscroll-data').height() > ($('#iscroll-data-wrapper').height() + 10)) {
                        setTimeout(function() {
                            s.dataScrollView.scrollTo(0, -35, 100);
                        }, 0);

                        setTimeout(function() {
                            s.dataScrollView.scrollTo(0, 0, 300);
                        }, 100);

                        s.dataViewIsShowing = true;
                    }

                    containerHeight, headerHeight, footerHeight, scrollerHeight = null; //memory management
                    thisParent, $editRuleSpan, $editRuleName, $editRuleValue, $editRuleDesc, $dataRegion, $nameInput, $descriptionInput, $valueInput, $removeButton, max = null; //m.m.
                });
            }, 100);
        },

        hideDataView: function () {
            var $rsRuleData = $('.round-setup-rule-data'),
                $dataRegion = $('#data-region');

            $dataRegion.slideUp(200);//slide up seems reversed
            //tell our scrollview to scroll back up to the top
            RoundSetup.Controller.roundSetupListRulesView.sv.scrollTo(0, 0, 400);
            RoundSetup.Controller.roundSetupListRulesView.refreshScrollView();//this will reset our offset

            //remove the transparency for all child item views and unhighlight
            $(".rs-options-header").removeClass("transparent").removeClass('selected-item');
            $('.topcoat-text-input').removeClass('e success');

            this.dataViewIsShowing = false;
            $rsRuleData, $dataRegion = null; //m.m.
        },

        valueExplanationClicked: function() {
            BGS.MainApp.Main.Controller.showHelpView('rule-value');
        },

        deleteRuleClicked: function(e) {
            var s = this;
            if (this.model.get('name') === 'Touch to Add New Drink' || this.model.get('name') === 'Touch to Add New Bonus' || this.model.get('name') === 'Touch to Add New Penalty'){
                //do nothing instead of showing an alert for now
            } else {
                confirm({
                    header: "Are you sure?",
                    message: "Deleting this rule will remove it from the current round and no one can use it again. However, any scoring added with this rule already will remain. There is no undo.",
                    confirmButton: "Yes, delete",
                    cancelButton: "No, cancel"
                    },
                    function () {
                        BGS.MainApp.Main.Controller.showSpinner('Deleting...');
                        //destroy model but only if it's not a default; if it is, just remove it's objectId from Round.rules array
                        RoundSetup.Controller.deleteRule(s.model)
                        .then(function(){
                            BGS.MainApp.Main.Controller.hideSpinner('');
                            s.hideDataView();
                        },
                        function(e) {
                            BGS.MainApp.Main.Controller.hideSpinner('');
                            BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Error Deleting Rule", JSON.stringify(e) + ' Please try again.', isError = true, showAtBottom = true);
                        });

                        
                    }
                );
            }
        },

        saveOnEnter: function (e) {
            //check if we hit the enter key, which will allow us to submit as well
            if (e.keyCode != 13) return;
            this.saveRuleClicked(e);
        },

        saveRuleClicked: function(e) {
            $('input:focus').blur(); //to dismiss the keyboard
            $('textarea:focus').blur();

            if (!this.validateForm()) {
                return;
            }

            var s = this,
                saveToRun = this.model.get('isDefault') === true ? this.saveDefaultRule : this.saveNonDefaultRule;

            saveToRun(this.model)
            .then(function(){
                s.hideDataView();
            },
            function(e) {
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Error Saving Rule", JSON.stringify(e) + ' Please try again.', isError = true, showAtBottom = true);
            });
        },

        saveDefaultRule: function(model) {
            var rule = new BGS.Entities.Rule(),
                p = new Parse.Promise();
            //never modify a default rule; create a copy and pull it's attributes
            if (model.get('isDefault') === true) {
                //remove id so we don't overwrite a default
                rule.set('modifiedDefault', model);
            }

            rule.set('isDefault', false);
            rule.set('type', model.get('type'));
            rule.set('user', Parse.User.current());
            rule.set('round', RoundSetup.Controller.round);
            rule.set('name', $('#rule-name').val());
            rule.set('description', $('#rule-description').val());

            if(BGS.Utilities.isUnitTesting === false) {
                var $value = $('#rule-value'),
                    value = $value.val().trim();
                value === '' ? rule.set('value', 0) : rule.set('value', Number(value));
            }
            
            //tell our controller to save it
            RoundSetup.Controller.saveRule(rule)
            .then(function() {
                //we don't want to continue to attempt to load a default we've just modified, so remove it from Round.rules array
                //the controller will check if the rule is a default and only remove the id if so
                return RoundSetup.Controller.deleteRule(model);
            })
            .then(function(success){
                p.resolve(success);
            },
            function(e){
                p.reject(e);
            });

            return p;
        },

        saveNonDefaultRule: function(model) {
            var p = new Parse.Promise();
            
            //it's not a default so we don't need to create a copy, just continue setting it's properties and save
            model.set('isDefault', false);
            model.set('user', Parse.User.current());
            model.set('round', RoundSetup.Controller.round);
            model.set('name', $('#rule-name').val());
            model.set('description', $('#rule-description').val());

            var $value = $('#rule-value'),
                value = $value.val().trim();

            value === '' ? model.set('value', 0) : model.set('value', Number(value));

            //tell our controller to save it
            RoundSetup.Controller.saveRule(model)
            .then(function(success){
                p.resolve(success);
            },
            function(e){
                p.reject(e);
            });

            $value = null; //m.m.
            return p;
        },

        validateForm: function () {
            var isValidated = true,
                $ruleName = $('#rule-name'),
                $ruleDescription = $('#rule-description'),
                $ruleValue = $('#rule-value');

            if ($ruleName.val().length < 3 || $ruleName.val().length > 60 || $ruleName.closest('input').hasClass('e')) {
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops!", "Please enter a rule title 3-60 characters long with no special characters.", isError = true, showAtBottom = true);
                isValidated = false;
                return isValidated;
            }

            if ($ruleDescription.val().length > 200 || $ruleDescription.closest('input').hasClass('e')) {
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Description too long", "Descriptions can be up to 200 characters.", isError = true, showAtBottom = true);
                isValidated = false;
                return isValidated;
            }

            var value = $ruleValue.val().trim(),
                parsedValue = parseInt(value, 10),
                remainder = parsedValue % 0.5,//can only be whole/half strokes
                notEven = false;

                remainder === 0 ? '' : notEven = true;

            if ($ruleValue.val() === '' || notEven === true || $ruleValue.closest('input').hasClass('e')) {
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Stroke value required", "Stroke values for rules can only be whole/half positive/negative numbers (e.g. 1.5, -2). Negative numbers are for drinks and bonuses while positive numbers should be added for penalties.", isError = true, showAtBottom = true);
                isValidated = false;
                return isValidated;
            }

            $ruleName, $ruleDescription, $ruleValue = null; //m.m.

            return isValidated;
        },
    });
});

