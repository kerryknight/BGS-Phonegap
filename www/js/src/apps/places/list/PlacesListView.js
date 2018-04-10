BGS.module('PlacesApp.Places', function (Places, BGS, Backbone, Marionette, $, _) {

    Places.Layout = Backbone.Marionette.Layout.extend({
        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('list-layout'));
        },

        regions: {
            listRegion: '#list-region',
            dataRegion: '#data-region'
        }
    });

    //Places.List is the parent class view
    Places.List = Backbone.Marionette.CompositeView.extend({

        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('places-list'));
        },

        itemViewContainer: ".places-list",

        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
                'keypress #search-field': 'searchOnEnter',
                "click .try-again": "errorReload",
                "click #search-field": "setFocus"
            };

            // //check what type of device we're viewing from
            // if (BGS.Utilities.isMobileDevice()) {
            //     //mobile device so attach touch events
            //     _.extend(events_hash, {
            //         "touchend .try-again": "errorReload",
            //         "touchend #search-field": "setFocus"
            //     });
            // } else {
            //     //desktop so attach mouse events
            //     _.extend(events_hash, {
            //         "click .try-again": "errorReload",
            //         "click #search-field": "setFocus"
            //     });
            // }
            return events_hash;
        },

        modelEvents: {
            "change": "modelChanged"
        },

        collectionEvents: {
            "add": "modelAdded"
        },

        remove: function () {
            // console.log('PlacesListView remove:');
            this.undelegateEvents();
        },

        setFocus: function (e) {
            // prevent propagation
            e.stopImmediatePropagation();
            //this is needed to offset the scroll actions of iscroll which disable direct selection of the field
            $('#search-field').select();
        },

        searchOnEnter: function (e) {
            //check if we hit the enter key, which will allow us to submit as well
            if (e.keyCode != 13) return;

            $('input:focus').blur(); //to dismiss the keyboard
            e.preventDefault(); //so router doesn't try to navigate us elsewhere
            this.isSearching = true;
        },

        modelChanged: function () {
            // console.log('placesListView modelChanged:');
        },

        modelAdded: function () {
            //console.log('placesListView modelAdded:');
        },

        onBeforeRender: function () {
            // console.log('BarListView onBeforeRender:');
        },

        onRender: function () {
            // console.log('placesListView onRender');
        },

        refreshScrollView: function () {
            var s = this;
            setTimeout(function () {
                s.sv.refresh();
            }, 500);
        },

        createScrollView: function (options, cb) {
            // console.log('places list scroll creation');
            var s = this;
            //create scrollview after a slight delay to ensure DOM fully loaded,
            //a best practice per the original developer of iScroll.js
            setTimeout(function () {
                var pullDownEl = document.getElementById('pullDown'),
                    pullDownOffset = pullDownEl.offsetHeight,
                    generatedCount = 0;

                s.sv = new IScroll('#iscroll-wrapper', {
                    mouseWheel: true,
                    tap: true,
                    startY: s.options.type == 'bars' ? (options.shouldModifySingleHole === true ? -58 : -65) : -25 //hides the search bar initially for bar list; taxis won't have search bar; there's also a 7 pixel difference for some reason when showing address bar on bar list and when not
                });

                s.sv.on('refresh', function () {
                    if (pullDownEl.className.match('loading')) {
                        pullDownEl.className = '';
                        pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
                    }
                });

                s.sv.on('scrollMove', function () {
                    if (s.sv.y > 20 && !pullDownEl.className.match('flip')) {
                        pullDownEl.className = 'flip';
                        pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Release to refresh...';
                    } else if (s.sv.y < 20 && pullDownEl.className.match('flip')) {
                        pullDownEl.className = '';
                        pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
                    }
                });

                s.sv.on('scrollEnd', function () {
                    if (pullDownEl.className.match('flip')) {
                        BGS.MainApp.Main.Controller.showSpinner();
                        pullDownEl.className = 'loading';
                        pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Loading...';
                        s.pullDownAction(options); // Execute custom function (ajax call?)
                    }

                    if (s.sv.y > -25 && s.sv.y < 21 && !pullDownEl.className.match('flip')) {
                        s.sv.scrollTo(0, -pullDownOffset + 42, 300); //animate back to starting position //had to add a +42 for some reason
                    }
                });

                //set the scroll view's height dynamically based on the window height minus the header/footer height
                var containerHeight = parseInt($('#container').css('height'), 10), //strip out 'px' from css property
                    headerHeight = parseInt($('.header').css('height'), 10), //strip out 'px' from css property
                    placesBarHeight = options.showAddressBar !== false ? 0 : -50, //parseInt($('.places-bar').css('height'), 10) : 0, //strip out 'px' from css property
                    scrollerHeight = containerHeight - (headerHeight + placesBarHeight) - 25, //add 25px of buffer to offset CSS margin of 20px we added to top
                    $wrapper = $('#iscroll-wrapper');

                $wrapper.css('height', scrollerHeight);
                //adjust where our scrollview starts if we are/are not showing the address bar
                options.showAddressBar !== false ? $wrapper.css('margin-top', '0px') : $wrapper.css('margin-top', '-10px');

                s.sv.enabled = true;
                s.sv.refresh();

                $.isFunction(cb) && cb();

                containerHeight, headerHeight, placesBarHeight, scrollerHeight = null; //memory management

                BGS.MainApp.Main.Controller.hideSpinner('service list view');

            }, 100);
        },

        showErrorMessage: function (e) {
            var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + e;
            Parse.Analytics.track('error', { code: codeString });

            console.log('showErrorMessage error: ' + e);
            if (BGS.Utilities.isUnitTesting === false) {

                $('.request-error').remove(); //remove the e div if present already
                $(".places-list").html(""); //clear the list out

                if (!this.sv) {
                    //hide the divs associated with the scrollview (search bar, logo row) if we haven't added the scrolling yet
                    $('#iscroll-wrapper').hide();
                } else {
                    this.sv.enabled = false;
                }

                //resize scrollview temporarily so it doesn't disable our ability to click our reload link
                // $('#iscroll-wrapper').height('125px');
                $('#iscroll-wrapper').height('100%!important');
                var frag = '';
                if (this.isSearching === true) {
                    frag = "<div class='request-error'><br><br><br>Well, shoot. " + e + "<br>Try broadening your search or you can <span class='try-again'><u>reload the places nearest you</u></span>.</div>";
                } else {
                    if (e == '"Finding your current location failed.  Ensure location services are enabled on your device and try again."') {
                        frag = "<div class='request-error'><br><br><br>Oops. Finding your current location failed.<br>Ensure location services are enabled on your device and <span class='try-again'><u>try your request</u></span> again.</div>";
                    } else {
                        frag = "<div class='request-error'><br><br><br>Well, this stinks. Something happened. <br>Please <span class='try-again'><u>try your request</u></span> again. If the problems persists, try logging out of Bar Golf Stars and logging back in.</div>";
                    }
                }

                // $(frag).insertAfter('#iscroll-wrapper');
                $('#iscroll-wrapper').append(frag);

                //hide the View Map Button too
                $('.right-header-button').hide().unbind();

                BGS.MainApp.Main.Controller.hideSpinner('service list view e');
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops! Something happened", "Error message: " + e, isError = true, showAtBottom = true);
            }
        },

        errorReload: function (e) {
            // prevent propagation
            e.stopImmediatePropagation();
            
            //attempt to reload service list
            this.pullDownAction();
            this.isSearching = false; //reset our flag
        }
    });

    //extending the parent Places.List class
    Places.ListBars = Places.List.extend({
        initialize: function (options) {
            // console.log('initialize Places.ListBars options: ' + JSON.stringify(options));
            //check if we're editing an actual hole or just using the Find a Bar feature

            //hide our address bar's blurry bg initially; we'll unhide once bars load and it's positioned properly
            // BGS.MainApp.Main.Controller.hideBlurryObjects();
            if (options.shouldModifySingleHole === true) {
                
                BGS.MainApp.Main.Controller.setNavBarTitle('Select Hole #' + this.options.hole.get('holeNum'));
                //don't show the address bar when we're editing holes
                // this.options['searchType'] = 'bars';
                // this.options['showAddressBar'] = false;
                this.options.searchType = 'bars';
                this.options.showAddressBar = false;
                this.getFoursquarePlaceCollection(this.options);
            } else {
                BGS.MainApp.Main.Controller.setNavBarTitle('Find a Bar');
                var new_options = {};
                // options['searchType'] = 'bars';
                // this.options['showAddressBar'] = options['showAddressBar'] = true;
                new_options.searchType = 'bars';
                this.options.showAddressBar = new_options.showAddressBar = true;
                this.getFoursquarePlaceCollection(new_options);
            }

            this.buttonClicked = false;
        },

        remove: function () {
            this.undelegateEvents();
            $('.right-header-button').unbind();
        },

        showMapClicked: function () {
            var s = this;

            //set a flag so we know we're passing in from the show map button instead of individual row button
            if (this.options.shouldModifySingleHole === true) this.options.isMultipleHoles = true;
            if (this.buttonClicked === false) Places.Controller.showMap(this.collection, this.options);
            this.buttonClicked = true;
            setTimeout(function(){s.buttonClicked = false;}, 500); //reset button click
        },

        getFoursquarePlaceCollection: function (options) {
            // console.log('PlacesListView getFoursquarePlaceCollection:');
            var s = this;
            Places.Controller.queryFoursquarePlaces(options, function (status, places) {
                if (status === 'success') {
                    s.collection = places;
                    //now that we've set up our collection properly, we can create scrollview and render it out
                    s.renderUI(options);
                } else {
                    //it's an error status
                    s.showErrorMessage(status);
                }
            });
        },

        searchOnEnter: function (e) {
            //check if we hit the enter key, which will allow us to submit as well
            if (e.keyCode != 13) return;
            $('input:focus').blur();//dismiss keyboard

            BGS.MainApp.Main.Controller.showSpinner();

            this.isSearching = true;
            //tell our service to search based on searched name
            var options = {};
                // options['searchTerm'] = $('#search-field').val();
                // options['searchType'] = 'bars';
                // options['refresh'] = true;
                // options['showAddressBar'] = this.options['showAddressBar'];
                options.searchTerm = $('#search-field').val();
                options.searchType = 'bars';
                options.refresh = true;
                options.showAddressBar = this.options.showAddressBar;
            this.getFoursquarePlaceCollection(options);
        },

        renderUI: function (options) {
            var s = this;
            BGS.MainApp.Main.Controller.hideSpinner();
            var $placesList = $(".places-list");
            $placesList.html(""); //clear the list out
            $placesList.css('height', 0);
            $placesList = null;//memory management
            this.render();
            
            this.createScrollView(options, function () {
                //set our Powered by logo row accordingly
                $('.search-field').show();
                $('.container-bar').html("<div class='foursquare-logo-row'></div>");
                $('.right-header-button span').html('View Map');

                $('.right-header-button').show().on('click', function () {
                    s.showMapClicked();
                });

                //show our address bar's translucent bg if we aren't setting up a manual hole
                // if (options.shouldModifySingleHole != true) BGS.MainApp.Main.Controller.showBlurryObjects(['.blur-top']);

                //zebra striping
                $('.places-list li:even').addClass('lt-lt-gray');
                $('.places-list li:odd').addClass('no-color');
                //add some space at bottom in case we're showing the add hole manually bar
                $('.places-list').append('<li class="spacer"width:100%"></li>');
            
                s.sv.refresh();

                setTimeout(function() {
                    if (options.shouldModifySingleHole === true) {
                        //hide our address bar's translucent bg
                        // BGS.MainApp.Main.Controller.hideBlurryObjects();
                        Places.Controller.manualEntryView.showManualEntry(function() {
                            s.sv.refresh();

                            //show our address bar's translucent bg
                            // BGS.MainApp.Main.Controller.showBlurryObjects(['.blur-data-entry']);
                        });
                    }
                }, 300);
            });
        },

        pullDownAction: function (options) {
            this.isSearching = false;
            var new_options = options;
            new_options.refresh = true;
            this.getFoursquarePlaceCollection(new_options);
        },
    });

    Places.ListTaxis = Places.List.extend({
        initialize: function (options) {
            // this.options.type = 'taxis';
            // BGS.MainApp.Main.Controller.hideBlurryObjects();
            BGS.MainApp.Main.Controller.setNavBarTitle('Call a Taxi');
            this.getGooglePlaceCollection('taxis');
        },

        getGooglePlaceCollection: function (searchType, searchterm, refresh) {
            var s = this;
            Places.Controller.queryGooglePlaces(searchType, searchterm, refresh, function (status, places) {
                if (status === 'success') {
                    s.collection = places;
                    //now that we've set up our collection properly, we can create scrollview and render it out
                    s.renderUI(s.options);
                } else {
                    //it's an error status
                    s.showErrorMessage(status);
                }
            });
        },

        searchOnEnter: function (e) {
            //check if we hit the enter key, which will allow us to submit as well
            if (e.keyCode != 13) return;
            //tell our service to search based on searched name
            this.getGooglePlaceCollection('taxis', $('#search-field').val(), refresh = true);
        },

        renderUI: function (options) {
            // console.log('ListTaxis renderUI called');
            var s = this;
            BGS.MainApp.Main.Controller.hideSpinner();
            $(".places-list").html(""); //clear the list out
            $('.places-list').css('height', 0);
            this.render();

            this.createScrollView(options, function () {
                //taxis; no search bar shown to user
                $('.search-field').hide();
                $('.container-bar').html("<div class='google-logo-row'></div>");
                $('.right-header-button').hide().unbind();

                //zebra striping
                $('.places-list li:even').addClass('lt-lt-gray');
                $('.places-list li:odd').addClass('no-color');

                //show our address bar's translucent bg
                // BGS.MainApp.Main.Controller.showBlurryObjects(['.blur-top']);

                s.sv.refresh();
            });
        },

        pullDownAction: function () {
            this.isSearching = false;
            this.getGooglePlaceCollection('taxis', null, refresh = true);
        },

    });

    Places.ManualEntryHoleDataView = Backbone.Marionette.ItemView.extend({

        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('places-manual-entry-hole-data'));
        },

        initialize: function (options) {
            // console.log('ManualEntryHoleDataView initialize options: ' + JSON.stringify(options));

            this.originalHoleEntry = options.hole;
            // console.log('original entry = ' + JSON.stringify(this.originalHoleEntry));
        },

        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
                'keypress #hole-displayname': 'saveOnEnter'
            };

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchend .rs-save-button": "saveHoleClicked",
                    "touchend .rs-delete-button": "resetHoleClicked",
                    "touchend .rs-cancel-button": "hideManualEntry"
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "click .rs-save-button": "saveHoleClicked",
                    "click .rs-delete-button": "resetHoleClicked",
                    "click .rs-cancel-button": "hideManualEntry"
                });
            }
            return events_hash;
        },

        onRender: function () {
            console.log('ManualEntryHoleDataView onRender');
        },

        remove: function () {
            this.undelegateEvents();
            this.unbind();
        },

        showManualEntry: function (cb) {
            console.log('manualEntry showManualEntry');
            var $manualEntry = $('#data-region'),
                s = this;

                //disable delete button if no hole added yet
                var $removeButton = $(".rs-delete-button");
                if (s.originalHoleEntry.get('name') != 'Hole Name Not Added Yet'){
                    $removeButton.show();
                } else {
                    //gray out the button completely so it appears disabled
                    $removeButton.hide();
                }

                $manualEntry.slideDown(200, function() {
                    $('.spacer').css("height", "190px");
                    //don't fill in the name if there's nothing to fill in
                    if(s.originalHoleEntry.get('name') != 'Hole Name Not Added Yet')$('#hole-displayname').val(s.originalHoleEntry.get('name'));
                    //show hole # down below too
                    $('#hole-name').html('Custom name for hole #' + s.originalHoleEntry.get('holeNum') + ':');

                    $.isFunction(cb) && cb();
                }); //this seems reversed in browser for some reason

                //attach our event handlers to the map menu rows; there may be a way to simply re-render this view
                //to get an events object to bind, but it wasn't working for me so i'm doing it this way; less elegant 
                //and with a little bit more code involved, but works completely fine
                $manualEntry.on('click', function (e) {
                    console.log('add hole manually');
                });

                $removeButton, $manualEntry = null;//memory management
        },

        hideManualEntry: function (e) {
            var $manualEntry = $('#data-region');
            $manualEntry.slideUp(200, function() {
                //cancel and go back to our hole list to allow further editing
                BGS.RSApp.RoundSetup.Controller.modifyHoles();
            }); 

            $manualEntry = null;//memory management
        },

        resetHoleClicked: function(e) {
            var s = this;

            if (this.originalHoleEntry.get('name') === 'Hole Name Not Added Yet'){
                //do nothing instead of showing an alert for now
            } else {
                confirm({
                    header: "Are you sure?",
                    message: "Only this hole's name and location will be reset. Any associated scores already added will not be affected.",
                    confirmButton: "Yes, reset",
                    cancelButton: "No, cancel"
                    },
                    function () {
                        //reset our fields and pass back to the controller for saving
                        s.originalHoleEntry.set('name', 'Hole Name Not Added Yet');
                        var blankLocation = new Parse.GeoPoint(); //this will auto-set to 0,0 coordinates on parse
                        s.originalHoleEntry.set('location', blankLocation);

                        Places.Controller.saveHole(s.originalHoleEntry);
                    }
                );
            }
        },

        saveOnEnter: function (e) {
            //check if we hit the enter key, which will allow us to submit as well
            if (e.keyCode != 13) return;

             e.preventDefault();

            this.saveHoleClicked(e);
        },

        saveHoleClicked: function(e) {
            $('input:focus').blur(); //to dismiss the keyboard

            if (!this.validateForm()) {
                return;
            }

            if ($('#hole-displayname').val() != this.originalHoleEntry.get('name')) {
                //we modified the name so save it and remove our geopoint
                this.originalHoleEntry.set('name', $('#hole-displayname').val());
                var blankLocation = new Parse.GeoPoint(); //this will auto-set to 0,0 coordinates on parse
                this.originalHoleEntry.set('location', blankLocation);
            }

            var s = this;
            if (this.buttonClicked !== true) {
                console.log('button clicked so save original hole entry');
                Places.Controller.saveHole(this.originalHoleEntry);
                this.buttonClicked = true;
            }
            setTimeout(function () {
                s.buttonClicked = false;
            }, 500); //reset our button click
        },

        validateForm: function () {
            var isValidated = true;
            if ($('#hole-displayname').val().length < 3 || $('#hole-displayname').val().length > 30 || $('#hole-displayname').closest('input').hasClass('e')) {
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops!", "Please enter a hole name 3-30 characters long with no special characters.", isError = true, showAtBottom = true);
                isValidated = false;
                return isValidated;
            }

            return isValidated;
        },
    });

});