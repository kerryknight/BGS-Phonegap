BGS.Utilities.Views.ActivityView = Backbone.Marionette.ItemView.extend({

    template: function () {
        return  _.template(BGS.Utilities.templateLoader.get('activity'));
    },

    onRender: function () {
          
    }

});