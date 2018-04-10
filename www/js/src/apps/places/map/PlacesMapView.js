BGS.module('PlacesApp.Places', function (Places, BGS, Backbone, Marionette, $, _) {
    Places.MapLayout = Backbone.Marionette.Layout.extend({
        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('places-map-layout'));
        },

        regions: {
            mapRegion: '#map-region',
            menuRegion: '#menu-region'
        }
    });

    Places.Map = Backbone.Marionette.ItemView.extend({

        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('places-map'));
        },

        initialize: function (options) {
            _.bindAll(this);

            // console.log('map init this.options = ' + JSON.stringify(this.options));
            //check if we're editing an actual hole or just using the Find a Bar feature
            if (this.options.shouldModifySingleHole === true) {
                BGS.MainApp.Main.Controller.setNavBarTitle('Bar Location');

            } else {
                BGS.MainApp.Main.Controller.setNavBarTitle('Find a Bar Map');
            }

            var s = this;
            //modify our rightheader button and give it a new method to call on click
            this.span$ = $('.right-header-button span');
            this.span$.html('View List');
            this.span$.show().on('click', function () {
                console.log('right header button clicked; showListClicked');
                s.showListClicked(options);
            });
        },

        loadMap: function (userLocation) {
            if (!userLocation) {
                BGS.MainApp.Main.Controller.hideSpinner();
                this.showListClicked();
                BGS.Utilities.showNotificationWithDismissDelay("Oops! Something happened.", "Please try again.", isError = true, showAtBottom = true);

            } else {
                var s = this,
                    location = userLocation;
                BGS.MainApp.Main.Controller.showSpinner();

                setTimeout(function () {
                    //check if we're editing holes; if so, don't show address bar
                    if (s.options.shouldModifySingleHole === true) {
                        $('#map-container').css('top', '90px');
                    }
                    if (!s.map) s.map = L.mapbox.map('map-container', 'woozykk.map-ckxod9y4', {
                        detectRetina: true,
                        retinaVersion: 'woozykk.map-ckxod9y4'
                    })
                        .setView([location.lat, location.lng], 13);

                    s.addCenterOnUserControl();

                    s.loadMapMarkers(location);

                    BGS.MainApp.Main.Controller.hideSpinner();

                    var layer = L.mapbox.tileLayer('woozykk.map-ckxod9y4');
                    layer.on('ready', function () {
                        //update the mapbox attribution link to not load in our webview
                        s.preventMapboxAttributionHTMLDefault();
                    });

                }, 200);
            }
        },

        showUserLocation: function (userLocation) {
            this.geoJSON = [];

            //we add a different type of marker for the user's location//lime green colored
            var new_userLocation = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [userLocation.lng, userLocation.lat]
                },
                properties: {
                    title: 'Your location',
                    'marker-color': '#5dbb85',
                    'marker-symbol': 'star-stroked'
                }
            };

            this.geoJSON.push(new_userLocation);
        },

        addCenterOnUserControl: function () {
            var s = this;
            //add the center on user location control to the map 
            L.control.locate({
                locateOptions: {
                    enableHighAccuracy: true,
                    maximumAge: 300000 // 300000 milliseconds == 5 minutes

                },
                onLocationError: function (err) {
                    BGS.Utilities.showNotificationWithDismissDelay("Oops! Something happened.", "Please try again.", isError = true, showAtBottom = true);
                },
                onLocationOutsideMapBounds: function (context) { // called when outside map boundaries
                    BGS.Utilities.showNotificationWithDismissDelay("Oops! Something happened.", context.options.strings.outsideMapBoundsMsg, isError = true, showAtBottom = true);
                },
                strings: {
                    title: "Show me where I am", // title of the locat control
                    popup: "You are within {distance} {unit} from this point", // text to appear if user clicks on circle
                    outsideMapBoundsMsg: "You seem located outside the boundaries of the map" // default message for onLocationOutsideMapBounds
                }
            }).addTo(s.map);
        },

        loadMapMarkers: function (userLocation, cb) {
            var s = this;

            this.showUserLocation(userLocation);

            this.collection.each(function (model) {
                // console.log('marker model = ' + JSON.stringify(model));
                var marker = {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [model.get('location').lng, model.get('location').lat]
                    },
                    properties: {
                        id: model.get('id'),
                        distance: (model.get('location').distance || ''),
                        checkinsCount: (model.get('stats').checkinsCount || ''),
                        usersCount: (model.get('stats').usersCount || ''),
                        title: model.get('name'),
                        phone: (model.get('contact').formattedPhone || ''),
                        address1: (model.get('location').address || ''),
                        address2: (model.get('location').city || '') + ', ' + (model.get('location').state || '') + '  ' + (model.get('location').postalCode || ''),
                        country: (model.get('location').country || ''),

                        'marker-color': '#ac90c6',
                        'marker-symbol': 'bar'
                    }
                };

                s.geoJSON.push(marker);
            });

            // Add custom popups to each using our custom feature properties
            this.map.markerLayer.on('layeradd', function (e) {
                var marker = e.layer,
                    feature = marker.feature,
                    localizedDistance = feature.properties.country == 'United States' ? BGS.Utilities.convertMeters(feature.properties.distance).to("miles") + 'mi' : BGS.Utilities.convertMeters(feature.properties.distance).to("kilometers") + 'km',
                    titleRow = feature.properties.title !== undefined ? '<div class="popover-title">' + feature.properties.title + '</div>' : '',
                    phoneRow = feature.properties.phone !== undefined ? '<div class="popover-text">' + feature.properties.phone : '<div class="popover-text">',
                    address1Row = feature.properties.address1 !== undefined ? '<div class="popover-text">' + feature.properties.address1 + '</div>' : '',
                    address2Row = feature.properties.address2 !== undefined ? '<div class="popover-text">' + feature.properties.address2 + '</div>' : '',
                    distanceRow = feature.properties.distance !== undefined ? '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + localizedDistance + ' away</div>' : '</div>';
                untrimmedTopRow = phoneRow + distanceRow; //could potentially be missing the phoneRow portion
                topRow = phoneRow === '<div class="popover-text">' ? phoneRow + distanceRow.replace(/&nbsp;/g, '') : untrimmedTopRow; //trim leading/trailing &nbsps just in case

                // Create custom popup content
                var popupContent = '<div class="map-popover">' +
                    titleRow +
                    '<div class="popover-subtext">' +
                    topRow + //we'll display these on same line; trim trailing/ending spaces in case no phone #
                address1Row +
                    address2Row +
                // distanceRow +
                '</div>' +
                    '</div>';

                // http://leafletjs.com/reference.html#popup
                marker.bindPopup(popupContent, {
                    closeButton: false,
                    minWidth: 200,
                    maxWidth: 200,
                    maxHeight: 100,
                });

            });

            // Add all markers to the map
            this.map.markerLayer.setGeoJSON(this.geoJSON);

            //can only listen for click events as markerlayer does not have touchend events
            this.map.markerLayer.on('click', function (e) {
                //tell the bottom menu to appear
                Places.Controller.placesMapMenuView.showMenu(e.layer.feature, s.options);
            });

            // Clear the tooltip when map is clicked
            this.map.on('click', function (e) {
                Places.Controller.placesMapMenuView.hideMenu(e);
            });

            //automatically select map menu if we only pass in one bar
            //show data view for our hole and select it
            var layers = s.map.markerLayer.getLayers(),
                feature = layers[1].feature;
                
            if (layers.length < 3) {
                layers[1].openPopup(); //0 is our location; 1 is passed in hole
                s.map.setView(layers[1].getLatLng(), 14); //center map on marker
                Places.Controller.placesMapMenuView.showMenu(feature, s.options);
            }

            //zoom to fit all our markers
            this.map.fitBounds(this.map.markerLayer.getBounds() /*.pad(0.3)*/ );
        },

        preventMapboxAttributionHTMLDefault: function () {
            //we need to make sure that clicking the attribution link will open the link
            //in the device's browser app and not within the same web view, so we need to change
            //the link to ensure it loads via the InAppBrowser phonegap plugin
            $('.leaflet-control-attribution a').on('click', function (e) {
                e.preventDefault();
                window.open('http://mapbox.com/about/maps', '_system', 'location=yes');
            });
        },

        onRender: function () {
            // console.log('PlacesMapView onRender');
            this.buttonClicked = false;
        },

        showListClicked: function () {
            //prevent double clicks
            if (this.buttonClicked === false) Places.Controller.showBars(this.options);
            this.buttonClicked = true;
        },

        remove: function () {
            this.span$.unbind();
            $('.leaflet-control-attribution a').unbind();
            this.undelegateEvents();
        }
    });

    Places.MapMenu = Backbone.Marionette.ItemView.extend({

        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('places-map-menu'));
        },

        initialize: function (options) {
            // console.log('PlacesMapMenu initialize');
        },

        onRender: function () {
            // console.log('map menu on render');
        },

        remove: function () {
            this.undelegateEvents();
            this.unbind();
        },

        showMenu: function (feature, options) {
            // console.log('showMenu options = ' + JSON.stringify(options));
            var new_feature = feature,
                s = this;
            this.options = options;
            //first, make sure we dont' load the menu items if the user clicked on his/her own location
            if (new_feature.properties.title != 'Your location') {
                var firstRow = '<div class="call-menu-item" data-id="' + new_feature.properties.id + '">Call ' + new_feature.properties.title + '</div>',
                    secondRow = '';

                //change our menu option text based on whether we're setting a certain hole or any hole
                if (typeof (options) != 'undefined' && options.shouldModifySingleHole === true) {
                    secondRow = '<div class="add-hole-menu-item" data-id="' + new_feature.properties.id + '">Add ' + new_feature.properties.title + ' as hole #' + options.hole.get('holeNum') + '</div>';
                } else {
                    // secondRow = '<div class="add-hole-menu-item" data-id="' + feature.properties.id + '">Add ' + feature.properties.title + ' as a hole</div>';

                    //for first release, don't have a 2nd row for adding a bar from the Find Bar function

                    //add the translucent blurred background when only 1 button; for some reason, i can't seem to make it work
                    //to position the blurred div behind 2 stacked divs like above, so only add it here
                    // secondRow = '<div class="blur blur-bottom"></div>';
                }

                var menu = firstRow + secondRow,
                    $placesMapMenu = $('.places-map-menu'),
                    $menuRegion = $('#menu-region');

                $placesMapMenu.html(''); //always clear it first
                $placesMapMenu.append(menu);
                $menuRegion.append($placesMapMenu);
                $menuRegion.slideDown(200); //this seems reversed in browser for some reason

                //attach our event handlers to the map menu rows; there may be a way to simply re-render this view
                //to get an events object to bind, but it wasn't working for me so i'm doing it this way; less elegant 
                //and with a little bit more code involved, but works completely fine
                $('.call-menu-item').on('click', function (e) {
                    s.callPlaceClicked(e);
                });
                $('.add-hole-menu-item').on('click', function (e) {
                    s.addPlaceAsHoleClicked(e);
                });

            } else {
                //hide menu
                this.hideMenu();
            }
        },

        hideMenu: function (e) {
            var $placesMapMenu = $('.places-map-menu'),
                $menuRegion = $('#menu-region');

            $menuRegion.slideUp(200, function () { //slideUp seems reversed in browser for some reason
                $placesMapMenu.html('');

                $placesMapMenu, $menuRegion = null; //m.m.
            });
        },

        callPlaceClicked: function (e) {
            var s = this;
            if (this.buttonClicked === false) {
                Places.Controller.callPlace(e);
                this.buttonClicked = true;
            }
            setTimeout(function () {
                s.buttonClicked = false;
            }, 500); //reset our button click
        },

        addPlaceAsHoleClicked: function (e) {
            var s = this;
            if (this.buttonClicked === false) {
                Places.Controller.addPlaceAsHole(e, this.options);
                this.buttonClicked = true;
            }
            setTimeout(function () {
                s.buttonClicked = false;
            }, 500); //reset our button click
        }
    });
});