// google.js
BGS.module('GoogleAPI', function (GoogleAPI, BGS, Backbone, Marionette, $, _) {
    var googleUrlRoot;

    this.googleGetUsersAddress = function (location, showAddressBar, cb) {
        // console.log('google get users address');
        var s = this;
        GoogleAPI.googleGetLocationReverseGeocode(location)
            .then(function (address) {
                    if(showAddressBar !== false) {
                        setTimeout(function() {
                            BGS.MainApp.Main.Controller.showAddressBar('You appear to be near:<br>' + address);    
                        }, 200);
                    }
                    $.isFunction(cb) && cb('Success getting user address'); //tell our caller it's ok to proceed
                },
                function (e) {
                    if(showAddressBar !== false) {
                        setTimeout(function() {
                            BGS.MainApp.Main.Controller.showAddressBar('Could not find your current address.<br>Pull down to refresh and try again.');    
                        }, 200);
                    } 
                    $.isFunction(cb) && cb('Error getting user address'); //tell our caller we failed
                });
    };

    this.googleGetLocationReverseGeocode = function (location) {
        //create our deferred object which we'll resolve with our returned bar list
        var dfd = new $.Deferred(),
            s = this,
            geocoder = new google.maps.Geocoder(),
            latlng = new google.maps.LatLng(location.lat, location.lng);
            
        geocoder.geocode({
            'latLng': latlng
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                //resolve our promise with the first returned address object
                if (results[0]) {
                    dfd.resolve(results[0].formatted_address);
                } else {
                    dfd.reject('Could not retrieve your current address.');
                }
            } else {
                dfd.reject('Finding your address failed due to: ' + status);
            }
        });

        // Return the Promise so caller can't change the Deferred
        return dfd.promise();
    };

    this.googleClearTaxiCache = function () {
        //check if we even have a cache to clear first, return if not
        if (!BGS.GoogleAPI.googleGetNearbyResults.taxiCache) return;
        BGS.GoogleAPI.googleGetNearbyResults.taxiCache = null;
    };

    this.googleGetNearbyResults = function (searchType, searchTerm, refresh, location) {
        //create our deferred object which we'll resolve with our returned bar list
        var dfd = new $.Deferred(),
            s = this;
        //cache our bars and taxis lists; we'll only resubmit foursquare queries if it's the first search, we manually refresh
        //the list or we attempt a keyword search for a bar or taxi
        if (!BGS.GoogleAPI.googleGetNearbyResults.taxiCache || 
            // BGS.GoogleAPI.googleGetNearbyResults.taxiCache.length == undefined || 
            (_.isObject(BGS.GoogleAPI.googleGetNearbyResults.taxiCache) === false && BGS.GoogleAPI.googleGetNearbyResults.taxiCache.length === undefined) || 
            searchTerm === true || 
            refresh === true ||
            this.userLocation === undefined) {

            // console.log('google resetting cache and requerying');
            BGS.GoogleAPI.googleGetNearbyResults.taxiCache = {}; //create our empty taxi cache
        } else {
            // console.log('google should reuse cache');
            //else, we've already returned a list of taxis, so just returned our cached list
            dfd.resolve(BGS.GoogleAPI.googleGetNearbyResults.taxiCache, isCached = true);
            BGS.MainApp.Main.Controller.showAddressBar();
            return dfd.promise();
        }

        // console.log('google get nearby location = ' + JSON.stringify(location));
        //1. get user's current location; if we pass in a location, we'll simply return it right back; we use this for
        //testing our Foursquare and Google services are working at various world locations
        BGS.Utilities.getCurrentLocation(location)
            .then(function (returnedLocation) {
                //successfully retrieved user's location
                s.userLocation = returnedLocation; //save for late like our cache
                //2a. get the user's street address; we'll wait until this returns before proceeding with further calls
                //in order to maintain a coherent page layout for a service list and the address bar
                //we'll just use the method we put in the foursquare api script to get our address, which is bass-ackwards since
                //it calls into here to reverse geocode
                BGS.GoogleAPI.googleGetUsersAddress(returnedLocation, true, function () {
                    //2. make our google places search request
                    BGS.GoogleAPI.makeSearchRequest(returnedLocation, function (results, status) {
                        // console.log('google cb with status = ' + JSON.stringify(status));
                        if (status == google.maps.places.PlacesServiceStatus.OK) {
                            var places = s.parseReturnedGooglePlaceCollection(results);
                            // console.log('google places returned count = ' + places.length);
                            if (places.length === 0) {
                                dfd.reject('Your search yielded no results.');
                                return;
                            }
                            dfd.resolve(places, isCached = false, status);
                            BGS.GoogleAPI.googleGetNearbyResults.taxiCache = places; //cache our returned places collection
                        } else {
                            dfd.reject(status);
                        }
                    });

                });
            }, function (e) {
                console.log('There was an error getting your location: ' + e);
                dfd.reject(JSON.stringify(e));
            });

        //add a timeout to the deferred
        setTimeout(function () {
            if (dfd.state() == 'pending') {
                dfd.reject('Operation timed out. Do you have an internet connection?');
            }
        }, 30000); // 30 seconds for timeout

        return dfd.promise();
    };

    this.googleGetPlaceDetails = function (place, cb) {
        //we never really use this DOM element; it's mainly to make the google places api service happy 
        var service = new google.maps.places.PlacesService(document.getElementById('map-canvas')),

            request = {
                reference: place.get('reference')
            };

        service.getDetails(request, function (details, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                place.set('phone', details.formatted_phone_number);
            }

            $.isFunction(cb) && cb(place, status);
        });

    };

    this.makeSearchRequest = function (location, cb) {
        // var frontStreet = new google.maps.LatLng(34.235359, -77.948728);
        // var timesSquare = new google.maps.LatLng(40.758582, -73.981934);
        // var london = new google.maps.LatLng(51.514483, -0.134926);
        // var pyrmont = new google.maps.LatLng(-33.8665433, 151.1956316);
        var locationToSearch = new google.maps.LatLng(location.lat, location.lng),
            request = {
                location: locationToSearch,
                radius: 50000,
                query: 'taxi'
            },
            //we never really use this DOM element; it's mainly to make the google places api service happy 
            service = new google.maps.places.PlacesService(document.getElementById('map-canvas'));

        service.textSearch(request, function (results, status) {
            console.log('made actual Google API call');
            $.isFunction(cb) && cb(results, status);
        });
    };

    this.parseReturnedGooglePlaceCollection = function (places) {
        var googlePlaces = new BGS.Entities.GooglePlaceCollection();

        _.each(places, function (place) {
            var aPlace = new BGS.Entities.GooglePlace();
            aPlace.set("properties", {}); //reset the properties before extending so we don't carry over from previous place
            //extend our new place model object's attributes with our passed in place object returned from google
            aPlace = aPlace.extendModelWithReturnedObject(place);
            //add our place to our collection
            googlePlaces.add(aPlace);
        });

        return googlePlaces;
    };

});