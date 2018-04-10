BGS.module('MainApp.Main', function (Main, BGS, Backbone, Marionette, $, _) {
    Main.MainView = Backbone.Marionette.ItemView.extend({

        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('main'));
        },

        events: function () {
            var events_hash = {};
            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchmove #nav-container": "hideNotifications"
                });
            } 
            return events_hash;
        },

        hideNotifications: function () {
            Main.Controller.dismissAnyNotification();
        },

        onRender: function () {
            var s = this;
            //change our main view bg from dark to light
            $('#container').removeClass('.bg-slategray').addClass('bg-light');

            //hide the right header button initially
            $('.right-header-button').hide();

            Main.Controller.loadChildViews();

            //determine what to show for the log out button on the left menu panel
            //based on whether we logged into Parse or not
            var $logoutButton = $('.menu-logout'),
                $loginUL = $('.log-in-log-out');
            if (Parse.User.current()) {
                //we're logged in
                $loginUL.prepend('<div class="accent-color-box lt-purple"><li class="topcoat-list__item--first delete-account"><a class="anton-font">Delete Account</a></li></div>');
                
                $('.delete-account').on('touchmove mousemove', function(){
                    s.isScrolling = true;
                });

                var eventType = BGS.Utilities.isMobileDevice() ? 'touchend' : 'click';
                $('.delete-account').on(eventType, function(){
                    if (s.isScrolling === false) {
                        console.log('delete account clicked; we should delete the account now');
                        Main.Controller.deleteAccount();
                    } else {
                        //reset is scrolling
                        s.isScrolling = false;
                    }
                });

                $logoutButton.html('<a class="anton-font">Log out</a>');
                $logoutButton.removeClass('topcoat-list__item--first').addClass('topcoat-list__item');

                Main.Controller.loadUsername();
            } else {
                $logoutButton.html('<a class="anton-font">Log in/Sign up</a>');
            }

            $loginUL, $logoutButton = null; //memory management

            //do some initial interface setup
            Main.Controller.setNavController();
            Main.Controller.calculateNavControllerHeight();

            $('#left-panel').removeAttr('style'); //the panel is hidden on app load; make it visible

            //create our sliding view which enables us to open and close the left menu tray by swiping
            //or hitting the open panel button in the top header
            Main.Controller.createSlidingView(); 

            //load our help panel tab
            $('#help-panel').slidePanel({
                triggerName: '#panel-trigger',
                triggerTopPos: '46px',
                panelTopPos: '48px',
                ajax: true,
                ajaxSource: 'signup.html'
            });

            BGS.StartApp.Start.Controller.offsetStatusBar();
        }
    });

    //HEADER 
    //Currently, there are no events for this view and it's not really even needed to attach
    //it to the DOM element; however, it's here as a stub so we can add events later as needed
    Main.HeaderView = Backbone.Marionette.ItemView.extend({
        //el is only needed here to bind our events to the DOM element
        el: '.header'
    });

    //FIND BARS/TAXIS BAR
    Main.PlacesBarView = Backbone.Marionette.ItemView.extend({
        //el is only needed here to bind our events to the DOM element
        el: '.places-bar',
        events: function () {
            var events_hash = {
                // insert all the events that go here regardless of mobile or not
            };

            //check what type of device we're viewing from
            if (BGS.Utilities.isMobileDevice()) {
                //mobile device so attach touch events
                _.extend(events_hash, {
                    "touchend .bar-list-button": "goToBarList",
                    "touchend .taxi-list-button": "goToTaxiList"
                });
            } else {
                //desktop so attach mouse events
                _.extend(events_hash, {
                    "click .bar-list-button": "goToBarList",
                    "click .taxi-list-button": "goToTaxiList"
                });
            }
            return events_hash;
        },

        goToBarList: function () {
            console.log('MainView goToBarList:');
            if ($(".bar-list-button").hasClass('place-button-active')) {
                //do nothing if we're already selected
                return;
            }

            this.selectMenuItem('bar-list-button');
            Main.Controller.loadPlacesApp('bars');
        },

        goToTaxiList: function () {
            console.log('MainView goToTaxiList:');
            if ($(".taxi-list-button").hasClass('place-button-active')) {
                //do nothing if we're already selected
                return;
            }

            this.selectMenuItem('taxi-list-button');
            Main.Controller.loadPlacesApp('taxis');
        },

        selectMenuItem: function (menuItem) {
            $('.place-button-active').removeClass('place-button-active ui-state-persist');
            if (menuItem) {
                $('.' + menuItem).addClass('place-button-active ui-state-persist');
            }
        }
    });

    //ADDRESS BAR
    Main.AddressBarView = Backbone.Marionette.ItemView.extend({
        //el is only needed here to bind our events to the DOM element
        el: '.address-bar',

        getTemplate: function () {
            return _.template(BGS.Utilities.templateLoader.get('address-bar'));
        },

        initialize: function () {},

        onRender: function () {}
    });

    Main.HelpView = Backbone.Marionette.ItemView.extend({

        el: '#simplemodal-data',

        initialize: function(options) {
            //our template to render is passed in via options
            this.template = _.template(BGS.Utilities.templateLoader.get(options.templateView));
        },

        onRender: function() {
            var s = this;
            setTimeout(function() {
                s.createHelpScrollView(null, 0, function () {
                    // set the scroll view's height dynamically based on the window height minus the header/footer height
                    var containerHeight = parseInt($('#simplemodal-data').css('height'), 10); //strip out 'px' from css property
                    $('#iscroll-help-wrapper').css('height', containerHeight - 6); //subtract border width
                    containerHeight = null; //memory management

                    s.helpScrollView.refresh();

                    $('.modalClose').on('click', function() {
                        console.log('close button clicked');
                        $.modal.close(); // must call this!
                    });
                });
            }, 100);
        },
        
        createHelpScrollView: function (elementToScroll, bottomOffset, cb) {
            var s = this;
            //create scrollview after a slight delay to ensure DOM fully loaded,
            //a best practice per the original developer of iScroll.js
            setTimeout(function () {

                s.helpScrollView = new IScroll('#iscroll-help-wrapper', {
                    mouseWheel: true,
                    tap: true,
                    bottomOffset: 0 //knightka 21Aug2013 added this options to iscroll5.js
                });
                $.isFunction(cb) && cb();

            }, 100);
        },
    });
});