// foursquare.js
BGS.module('FoursquareAPI', function (FoursquareAPI, BGS, Backbone, Marionette, $, _) {
    //********** Bar Functions ***************************************************************************************************//
    //****************************************************************************************************************************//
    //initialize the Foursquare object with the API data for Foursquare we have stored in Parse
    //@return; returns a jquery .deferred promise
    this.fsqInitialize = function () {
        // console.log('initializeFoursquare called');
        var s = this,
            //create a jquery deferred object which we can pass to whoever to fulfill our promise
            dfd = new $.Deferred();

        BGS.Utilities.retrieveAPIInfoFromParse("foursquare", function (apiObject) {
            BGS.Utilities.fsqIsInitialized = true; //set our initialized flag
            dfd.resolve(apiObject); //fulfill our promise
        });

        // Return the Promise so caller can't change the Deferred
        return dfd.promise();
    };

    this.getCategoryIds = function() {
        return [
                '4bf58dd8d48988d1e8931735', //piano bar
                '4bf58dd8d48988d1e3931735', //pool hall knightka - this was pulling a UNCW dorm listing
                '50327c8591d4c4b30a586d5d', //brewery
                '4e0e22f5a56208c4ea9a85a0', //distillery
                '4bf58dd8d48988d155941735', //gastro pub
                '4d4b7105d754a06376d81259', //nightlife spot //includes all below bar types (and others)
                '4bf58dd8d48988d116941735', //bar
                '4bf58dd8d48988d117941735', //beer garden
                '4bf58dd8d48988d11e941735', //cocktail bar
                '4bf58dd8d48988d118941735', //dive bar
                '4bf58dd8d48988d1d8941735', //gay bar
                '4bf58dd8d48988d1d5941735', //hotel bar
                '4bf58dd8d48988d120941735', //karaoke bar
                '4bf58dd8d48988d121941735', //lounge
                '4bf58dd8d48988d11f941735', //nightclub
                '4bf58dd8d48988d11b941735', //pub
                '4bf58dd8d48988d1d4941735', //speakeasy
                '4bf58dd8d48988d11d941735', //sportsbar
                '4bf58dd8d48988d122941735', //whiskey bar
                '4bf58dd8d48988d123941735', //wine bar
                '4bf58dd8d48988d14c941735', //wings joint, like WWC
                '4bf58dd8d48988d1db931735'  //tapas restuarant like 1900
            ];
    };

    //return an associative arrayish object our default options we have set of searching Foursquare for bars
    this.fsqGetDefaultBarOptions = function () {
        var defaultBarOptions = {
            'radius': 3200, //in meters; default ~ 2 miles
            'limit': 20,
            'intent': 'browse',
            'categoryId': this.getCategoryIds()
        };
        return defaultBarOptions;
    };

    this.fsqClearBarCache = function () {
        //check if we even have a cache to clear first, return if not
        if (!BGS.FoursquareAPI.fsqGetNearbyResults.barCache) return;
        BGS.FoursquareAPI.fsqGetNearbyResults.barCache = null;
    };

    //query Foursquare API for a list of bars near our location
    //@searchterm {string} optional; search term to narrow down results
    //@refresh {BOOL} optional; set to true to clear any cached results
    //@location {geopoint} optional; pass in to specify the user's location for search
    this.fsqGetNearbyResults = function (options, location) {
        var s = this;

        var searchType = options.searchType,
            searchTerm = options.searchTerm,
            refresh = options.refresh,
            showAddressBar = options.showAddressBar; 

        // console.log('foursquare.fsqGetBars called; pass refresh = true to override cache for manual update');
        //create our deferred object which we'll resolve with our returned bar list
        var dfd = new $.Deferred();
        // console.log('get bars refresh = ' + refresh);
        //cache our bars and taxis lists; we'll only resubmit foursquare queries if it's the first search, we manually refresh
        //the list or we attempt a keyword search for a bar or taxi
        if (!BGS.FoursquareAPI.fsqGetNearbyResults.barCache || 
            // BGS.FoursquareAPI.fsqGetNearbyResults.barCache.length == undefined || 
            (_.isObject(BGS.FoursquareAPI.fsqGetNearbyResults.barCache) === false && BGS.FoursquareAPI.fsqGetNearbyResults.barCache.length === undefined) || 
            searchTerm === true || 
            refresh === true ||
            this.userLocation === undefined) {

            console.log('foursquare resetting cache and requerying');

            BGS.FoursquareAPI.fsqGetNearbyResults.barCache = {}; //create our empty bar cache
        } else {
            console.log('foursquare should reuse cache');
            // console.log('foursquare cache length = ' + BGS.FoursquareAPI.fsqGetNearbyResults.barCache.length);
            //else, we've already returned a list of bars, so just returned our cached list
            dfd.resolve(BGS.FoursquareAPI.fsqGetNearbyResults.barCache, isCached = true, this.userLocation); //location is used for the map view
            if(showAddressBar !== false) BGS.MainApp.Main.Controller.showAddressBar();
            return dfd.promise();
        }

        //1. get user's current location; if we pass in a location, we'll simply return it right back; we use this for
        //testing our Foursquare and Google services are working at various world locations
        BGS.Utilities.getCurrentLocation(location)
            .then(function (returnedLocation) {
                // console.log('foursquare returned location ' + JSON.stringify(returnedLocation));
                s.userLocation = returnedLocation; //save for late like our cache
                //successfully retrieved user's location
                //2a. get the user's street address; we'll wait until this returns before proceeding with further calls
                //in order to maintain a coherent page layout for a bar list and the address bar
                BGS.GoogleAPI.googleGetUsersAddress(returnedLocation, showAddressBar, function () {
                    //2b. initialize foursquare
                    BGS.FoursquareAPI.fsqInitialize()
                        .then(function (apiObject) {
                            //successfully initialized Foursquare
                            //3. create our authorization request using the api object we got back from initializing foursquare
                            BGS.FoursquareAPI.fsqCreateRequestAuthorizationObjects(apiObject)
                                .then(function (endpoint, authString) {
                                    //successfully retrieved foursquare endpoint and authstring
                                    //our model/collection will use the searchType value to determine what default options we should attach to our request
                                    var places = new BGS.Entities.FoursquarePlaceCollection({
                                        'type': searchType,
                                        'endpoint': endpoint,
                                        'authString': authString,
                                        'isManualSearch' : searchTerm !== ('' || null || undefined) ? true : false,
                                        'options': {
                                            'location': returnedLocation,
                                            'query': searchTerm
                                        }
                                    });

                                    //4. attempt to query foursquare for our list
                                    places.fetch({
                                        success: function (response) {
                                            if (places.length === 0) {
                                                dfd.reject('Your search yielded no results.');
                                                return;
                                            }

                                            //and set our cache of places up by search type
                                            BGS.FoursquareAPI.fsqGetNearbyResults.barCache = places;
                                            dfd.resolve(places, isCached = false, returnedLocation); //resolve with our places list as this is sometimes passed into a view as its collection 
                                        },
                                        error: function (e) {
                                            console.log('places.fetch e 1 ' + JSON.stringify(e));
                                            dfd.reject('Please try your request again.');

                                            var codeString = typeof(e.code) != 'undefined' ? '' + e.code : '' + e;
                                            Parse.Analytics.track('error', { code: codeString });
                                        }
                                    });
                                });
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

    this.fsqGetPlaceDetail = function (place) {
        console.log('foursquare.js fsqGetPlaceDetail:');
    };

    //create the client authorization string to be appended to Foursquare API query string
    //@apiObject {object} required; Foursquare apiObject returned from Parse
    //@return; returns a jquery .deferred promise
    this.fsqCreateRequestAuthorizationObjects = function (apiObject) {
        // console.log('createRequestAuthorizationObjects with object = ' + JSON.stringify(apiObject));
        var dfd = new $.Deferred(),
            apiHash = apiObject;
        //for now, we only have foursquare to check, so this works fine
        //however, this might not be the best, most elegant way of going about this 
        if (apiHash.apiName == 'foursquare') {
            //define our variables to be used in our request header
            var clientIdKeyName = '',
                clientId = '',
                clientSecretKeyName = '',
                clientSecret = '',
                dateVerified = '';

            //get our string values for the URL
            if (apiHash.clientIdKeyName) clientIdKeyName = apiHash.clientIdKeyName;
            if (apiHash.clientId) clientId = apiHash.clientId;
            if (apiHash.clientSecretKeyName) clientSecretKeyName = apiHash.clientSecretKeyName;
            if (apiHash.clientSecret) clientSecret = apiHash.clientSecret;
            if (apiHash.dateVerified) dateVerified = apiHash.dateVerified;

            //concatenate them into one string which we'll tack onto the end of our entire query string
            var authorizationString = '&' + clientIdKeyName + '=' + clientId + '&' + clientSecretKeyName + '=' + clientSecret;

            //add to end our authorization string dateVerified; foursquare requires this to not throw up a deprecated flag
            authorizationString = authorizationString + '&v=' + dateVerified; //with version variable

            //get our fsq endpoint
            var apiEndpoint;
            if (apiHash.apiEndpoint) apiEndpoint = apiHash.apiEndpoint;

            //pass our auth string back to our url: method
            // $.isFunction(cb) && cb(apiEndpoint, authorizationString);
            dfd.resolve(apiEndpoint, authorizationString);
        }
        return dfd.promise();
    };

    //********** Helper Functions ************************************************************************************************//
    //****************************************************************************************************************************//
    //create the parameter string to be appended to Foursquare API endpoint to create the full query string
    //@options {object} required; options/parameters to search Foursquare for such as the return value of this.fsqGetDefaultBarOptions() 
    this.fsqBuildParameterList = function (options) {
        var paramList = '';
        _.each(options, function (value, key) {
            if (value !== '' && value !== null) { //only use parameters that have actually be set
                if (key == 'location') {
                    //extract our lat and lng options
                    var lat = value.lat,
                        lng = value.lng;
                    paramList = '?ll=' + lat + ',' + lng + '&' + paramList; //start params in URL off with a '?' marker
                } else {
                    paramList = paramList + key + '=' + value + '&';
                }
            }
        });

        //remove the last '&' sign
        var trimmedList = paramList.substring(0, paramList.length - 1); //removes last character in our string
        return trimmedList;
    };
});