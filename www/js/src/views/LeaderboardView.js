BGS.Utilities.Views.LeaderboardView = Backbone.Marionette.ItemView.extend({

    template: function () {
        return  _.template(BGS.Utilities.templateLoader.get('leaderboard'));
    },

    onRender: function () {
          
    }

});