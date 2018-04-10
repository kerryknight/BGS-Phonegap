BGS.Utilities.Views.PlayerView = Backbone.Marionette.ItemView.extend({

    template: function () {
        return  _.template(BGS.Utilities.templateLoader.get('player'));
    },

    onRender: function () {
          
    }

});