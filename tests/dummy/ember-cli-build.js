const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
    var env = EmberApp.env();
    var app = new EmberApp(defaults);
        app.import('/local/index.js');
        app.import('/local/local.css');

        return app.toTree([]);
}
