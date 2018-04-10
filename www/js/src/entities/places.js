BGS.module('Entities', function (Entities, BGS, Backbone, Marionette, $, _) {
    //************************** FOURSQUARE ************************************************************************
    //**************************************************************************************************************
    this.FoursquarePlace = Backbone.Model.extend({});

    //http://lostechies.com/derickbailey/2011/10/11/backbone-js-getting-the-model-for-a-clicked-element/
    this.FoursquarePlaceCollection = Backbone.Collection.extend({
        // instance methods
        model: Entities.FoursquarePlace,

        initialize: function (options) {
            // console.log('options at init = ' + JSON.stringify(options));
            this.uri = "venues/search";
            if(!options) return; //skip everything
            //options that will be passed in include user's location, search terms, etc.
            var s = this,
                defaultOptions = BGS.FoursquareAPI.fsqGetDefaultBarOptions(),
                newOptions = options.options;
            $.extend(true, defaultOptions, newOptions); //extend the default options with the options we just passed in

            this.endpoint = options.endpoint;
            this.params = BGS.FoursquareAPI.fsqBuildParameterList(defaultOptions);
            this.authString = options.authString;
            this.isManualSearch = options.isManualSearch;
        },

        url: function (options) {
            //our endpoint and auth string must be passed in from utility functions
            return this.endpoint + this.uri + this.params + this.authString;
        },

        // class methods
        parse: function (response) {
            // console.log('BGS.FoursquareAPI.getCategoryIds() = ' + BGS.FoursquareAPI.getCategoryIds());
            // console.log('response = ' + JSON.stringify(response));
            var unfilteredVenues = response.response.venues,
                categoryIds = BGS.FoursquareAPI.getCategoryIds(),
                filteredVenues;
                // console.log('filtering out objects with no contact info--does this exclude any real bars?');

                //check if we've entered in a search term; if so, don't filter results
                if(this.isManualSearch === false) {
                    filteredVenues = _.reject(unfilteredVenues, function (venue) {
                        // console.log('venue.contact = ' + JSON.stringify(venue.contact));
                        // console.log('venue = ' + JSON.stringify(venue));

                        return ((_.isEmpty(venue.contact.formattedPhone) && _.isEmpty(venue.contact.twitter)) || _.contains(categoryIds, venue.categories[0].id) !== true); //filter out all results that don't have a contact or were extraneous
                    });
                } else {
                    //we search manually so just set our filtered list to the returned list
                    filteredVenues = unfilteredVenues;
                }
                
            var sortedVenues = _.sortBy(filteredVenues, function (venue) {
                return venue.location.distance;
            });

            // console.log('filteredVenues count = ' + filteredVenues.length);

            return sortedVenues;
        }
    });

    //************************** GOOGLE ****************************************************************************
    //**************************************************************************************************************
    this.GooglePlace = Backbone.Model.extend({

        defaults: {
            'name': 'taxi',
            'formatted_address': '',
            'googleId': '',
            'phone': '',
            'rating': '',
            'reference': ''
        },

        // Ensure that each device created has a name
        initialize: function () {
            this.bind("e", function (model, e) {
                // We have received an e, log it, alert it or forget it :)
                console.log(e);
            });

            _.bindAll(this, "extendModelWithReturnedObject", "trimAddressString");
        },

        extendModelWithReturnedObject: function (object) {
            //set all our model properties from our passed in object
            this.set('name', object.name);
            this.trimAddressString(object.formatted_address);
            this.set('googleId', object.id);
            this.set('reference', object.reference);
            this.set('phone', object.phone);
            this.set('rating', object.rating);

            return this;
        },

        trimAddressString: function (address) {
            var lastComma = address.substring(address.lastIndexOf(",")),
                trimmedAddress = address.replace(lastComma, '');
            this.set('formatted_address', trimmedAddress);
        }
    });

    this.GooglePlaceCollection = Backbone.Collection.extend({
        model: Entities.GooglePlace
    });
});