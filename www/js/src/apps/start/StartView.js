BGS.module('StartApp.Start', function (Start, BGS, Backbone, Marionette, $, _) {
    Start.StartView = Backbone.Marionette.ItemView.extend({

        template: function () {
            return _.template(BGS.Utilities.templateLoader.get('start'));
        },

        onRender: function () {
            //change our main view bg from light to dark
            var $container = $('#container');
            $container.css({
                'visibility': 'hidden'
            }); //hide this until the child view has a change to load (made visible in child view)
            $container.addClass('bg-light');

            $('#nav-container').css({
                'top': '50%',
                'position': 'absolute',
                'width': '100%'
            });

            $container = null;//m.m.
            
            //tell controller to show welcome view
            Start.Controller.showWelcomeView(); 
        }
    });
});