import { A } from '@ember/array';
import { get, set } from '@ember/object';
import GeoData from './geo-data';

export default({
  setFeatures(json) {
    let features = A([]);

    json.features.forEach((feature) => {

      let geo = {};

      if (feature.geometry.type === 'Point') {
        geo = Object.assign(
          feature.properties,
          {
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0]
          }
        );
      } else {
        geo.setProperties({
          geometry: feature.geometry
        });
      }


      features.push(geo);
    });
    return features;
  },

  init() {
    set(this, 'features', this.setFeatures(JSON.parse(event.target.result)));
    set(this, 'table', GeoData.setTable(get(this, 'features')))
    return this;
  }
});
