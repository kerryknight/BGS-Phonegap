BGS.module('PlacesApp.Places', function (Places, BGS, Backbone, Marionette, $, _) {
    Places.Controller = {

        initialize: function (options) {
            // console.log('Places.Controller initialize for options: ' + JSON.stringify(options));
            options.type === 'bars' ? this.showBars(options) : this.showTaxis(options);
        },

        showView: function (view, effect, cb) {
            BGS.containerRegion.show(view);
            $.isFunction(cb) && cb();
        },

        showBars: function (options) {
            var s = this;

            this.options = options;

            //track bar finder with Parse
            Parse.Analytics.track('findBars');

            if(typeof(this.listLayout) != 'undefined') this.listLayout.close();
            this.listLayout = new Places.Layout();
            
            this.listLayout.on("show", function () {
                //eventhough we don't load these until the 'show' event fires, it still seemed that a 
                //fake delay was necessary to ensure synchronous loading here so the DOM would be ready
                setTimeout(function () {

                    s.options.itemView = Places.BarItemView;

                    //create a new instance of our Map item view adn pass in our options
                    s.placesListView = s.placesListBarView(s.options);

                    //create a new instance of the bottom menu panel that will animate in and out when we select a player to edit
                    s.manualEntryView = s.placesManualEntryView(s.options);

                    s.listLayout.listRegion.show(s.placesListView);
                    s.listLayout.dataRegion.show(s.manualEntryView);

                    s.manualEntryView.on("show", function() {
                        BGS.MainApp.Main.Controller.hideSpinner('');
                    });
                }, 0);
            });
            // return this.listLayout;

            this.showView(this.listLayout, this.noEffect());
        },

        showTaxis: function (options) {
            this.options = options;
            var s = this;
        
            // console.log('options at showBars: ' + JSON.stringify(options));
            this.options = options;

            //track taxi finder with Parse
            Parse.Analytics.track('findTaxis');

            if(typeof(this.listLayout) != 'undefined') this.listLayout.close();
            this.listLayout = new Places.Layout();
            
            this.listLayout.on("show", function () {
                // console.log('list layout on show');
                //eventhough we don't load these until the 'show' event fires, it still seemed that a 
                //fake delay was necessary to ensure synchronous loading here so the DOM would be ready
                setTimeout(function () {

                    s.options.itemView = Places.TaxiItemView;

                    //create a new instance of our Map item view adn pass in our options
                    s.placesListView = s.placesListTaxiView(s.options);
                    s.listLayout.listRegion.show(s.placesListView);
                    // s.listLayout.dataRegion.show(s.manualEntryView);
                }, 0);
            });
            // return this.listLayout;

            this.showView(this.listLayout, this.noEffect());
        },

        showMap: function (collection, options) {
            //track map views and whether it is the full list or a single bar to view with Parse
            var placesCount = {collectionCount: '' + collection.length};
            Parse.Analytics.track('showBarMap', placesCount);

            var s = this;
            this.options.collection = collection;
            this.showView(this.placesMapLayoutView(this.options)); //pass the collection to our map view
        },

        queryFoursquarePlaces: function (options, cb) {
            var s = this;
            //dont' show spinner if we pulled down to refresh as there's already a spinner
            if (options.refresh !== true) BGS.MainApp.Main.Controller.showSpinner('Retrieving nearby bars...');

            BGS.FoursquareAPI.fsqGetNearbyResults(options)
                .then(function (places, isCached, userLocation) {
                        s.userLocation = userLocation; //used for passing to the mapview as necessary
                        var status = 'success';
                        $.isFunction(cb) && cb(status, places);
                    },
                    function (e) {
                        var status = e;
                        $.isFunction(cb) && cb(status);

                        var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                        Parse.Analytics.track('error', { code: codeString });
                    });
        },

        queryGooglePlaces: function (searchType, searchterm, refresh, cb) {
            //dont' show spinner if we pulled down to refresh as there's already a spinner
            if (refresh !== true) BGS.MainApp.Main.Controller.showSpinner('Retrieving local taxis...');

            BGS.GoogleAPI.googleGetNearbyResults(searchType, searchterm, refresh)
                .then(function (places) {
                        var status = 'success';
                        $.isFunction(cb) && cb(status, places);
                    },
                    function (e) {
                        var status = e;
                        $.isFunction(cb) && cb(status);
                        var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + JSON.stringify(e);
                        Parse.Analytics.track('error', { code: codeString });
                    });
        },

        callPlace: function (e) {
            //we have to retrieve our bar model from the map view's collection
            var place = this.getModelFromMapViewCollection(e);
            //extract phone number
            if (place.get('contact').formattedPhone) {
                document.location = 'tel:' + place.get('contact').formattedPhone; //dial the number
            } else {
                BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops! We had trouble calling this place.", "Please try again.", isError = true, showAtBottom = true);
            }
        },

        addPlaceAsHole: function(e, options) {
            
            var holeToUpdate = options.hole,
                newHole = this.getModelFromMapViewCollection(e),
                location = new Parse.GeoPoint({latitude: newHole.get('location').lat, longitude: newHole.get('location').lng});

            holeToUpdate.set('name', newHole.get('name'));
            holeToUpdate.set('location', location);

            this.saveHole(holeToUpdate);
        },

        saveHole: function(holeToUpdate) {
            console.log('PlacesController.holetoupdate = ' + JSON.stringify(holeToUpdate));
            holeToUpdate.save({
                success: function (success) {
                    console.log('saveHole successfully');
                //successfully saved so dismiss back to list view and show success message
                BGS.RSApp.RoundSetup.Controller.modifyHoles();
                // BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Success!", holeToUpdate.get('name') + ' was successfully added as hole #' + holeToUpdate.get('holeNum'), isError = false, showAtBottom = true);
                },
                error: function (e) {
                        //e
                        console.log('saveHole e updating hole: ' + JSON.stringify(e));
                        // BGS.MainApp.Main.Controller.showNotificationWithDismissDelay("Oops! We had updating this hole.", "Please try again.", isError = true, showAtBottom = true);
                    }
                });
        },

        getModelFromMapViewCollection: function (e) {
            //use the 'data-id' attribute we set on the div tag for the now to query our collection for the pertinent model
            var id = $(e.currentTarget).data("id");
            var place = this.placesMapView.collection.get(id); //only the Map view has a collection associated with it
            return place;
        },

        placesListBarView: function (options) {
            return new Places.ListBars(options);
        },

        placesManualEntryView: function (options) {
            return new Places.ManualEntryHoleDataView(options);
        },

        placesListTaxiView: function (options) {
            return new Places.ListTaxis(options);
        },

        placesMapLayoutView: function (options) {
            var s = this;
            var mapLayout = new Places.MapLayout();
            mapLayout.on("show", function () {
                //eventhough we don't load these until the 'show' event fires, it still seemed that a 
                //fake delay was necessary to ensure synchronous loading here so the DOM would be ready
                setTimeout(function () {
                    //create a new instance of our Map item view adn pass in our options
                    s.placesMapView = new Places.Map(options);
                    s.placesMapView.on("show", function () {
                        //tell our map view to actually load the map now that everything has been added to the DOM
                        s.placesMapView.loadMap(s.userLocation || '');
                    });

                    //create a new instance of the bottom menu panel that will animate in and out when we select map pins
                    s.placesMapMenuView = new Places.MapMenu();

                    mapLayout.mapRegion.show(s.placesMapView);
                    mapLayout.menuRegion.show(s.placesMapMenuView);
                }, 0);
            });
            return mapLayout;
        },

        noEffect: function () {
            return new BackStack.NoEffect();
        },

        disableEvents: function() {
            //this only gets called when we open/close sliding menu panel
            if(this.placesMapView) this.placesMapView.undelegateEvents();
            if(this.placesMapMenuView) this.placesMapMenuView.undelegateEvents(); 
            if(this.placesListView) this.placesListView.undelegateEvents();
            if(this.manualEntryView) this.manualEntryView.undelegateEvents();    
        },

        enableEvents: function() {

            //this only gets called when we open/close sliding menu panel
            if(this.placesMapView) this.placesMapView.delegateEvents();
            if(this.placesMapMenuView) this.placesMapMenuView.delegateEvents(); 
            if(this.placesListView) this.placesListView.delegateEvents();
            if(this.manualEntryView) this.manualEntryView.delegateEvents();     
        }

    };
});