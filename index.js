/* eslint-env node*/

module.exports = {
  name: 'ember-cli-excel2geojson',
  description: 'ember-cli-excel2geojson installation blueprint',
  normalizeEntityName() {},

  // includeed: function included(app) {
  //     this._super.included(app);
  //     app.import(`${app.bowerDirectory}/js-xlsx/dist/xlsx.js`);
  //     app.import('vendor/js-xlsx.js', {
  //       exports: {
  //         XLSX: ['default']
  //       }
  //     })
  // },

  included() {
  this._super.included.apply(this, arguments);
  this.import('vendor/shims/wellknown.js');
  },

  beforeInstall() {
    return this.addBowerPackageToProject('js-xlsx', '0.11.0').then(function() {
        return this.addAddonsToProject({
        packages: [{
          name: 'ember-light-table',
          target: '~1.9.0'
        },{
          name: 'ember-leaflet',
          target: '~3.0.12'
        },{
            name: 'ember-responsive',
            target: '~2.0.4'
        }, {
            name: 'fs-extra',
            target: '~4.0.1'
        }, {
            name: 'wellknown',
            target: '~0.5.0'
        }
        ]
      })
    }.bind(this));
  }
};
