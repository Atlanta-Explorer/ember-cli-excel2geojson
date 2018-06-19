/* eslint-env node*/
module.exports = {
  description: 'ember-cli-excel2geojson installation blueprint',
  normalizeEntityName() {},

  beforeInstall() {
    // return this.addBowerPackageToProject('js-xlsx', '0.11.0').then(function() {
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
      }]
      })
    // }.bind(this));
  },
   afterInstall() {
    return this.addBowerPackageToProject('wellknown');
  },
};
