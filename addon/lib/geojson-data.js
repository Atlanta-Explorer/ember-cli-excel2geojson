import { A } from '@ember/array';
import { get, set } from '@ember/object';
import GeoData from './geo-data';

export default({
  /*
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
        geo = Object.assign(
          feature.properties,
          {


          }
        );
      }


      features.push(geo);
    });
    return features;
  },
  */

init() {
    //console.log(Object.getOwnPropertyNames(A(JSON.parse(event.target.result).features)));
    set(this, 'features', A(JSON.parse(event.target.result).features));
    set(this, 'table', GeoData.setTable(get(this, 'features')));
    return this;
  }
});
