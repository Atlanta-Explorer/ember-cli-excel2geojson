import { assert } from '@ember/debug';
import Component from '@ember/component';
import { get, set, setProperties } from '@ember/object';
import { A } from '@ember/array';
import layout from '../templates/components/geojson-parse-data';
import $ from 'jquery';
import GeojsonData from '../lib/geojson-data';
import GeoData from '../lib/geo-data';
import SpreadsheetData from '../lib/spreadsheet-data';

const fileTypes = A(['xlsx', 'json', 'geojson']);
const reader = new FileReader();

export default Component.extend({
  layout,
  data: null,
  table: null,
  bounds: A([[33.7489954, -84.3879824]]),
  /*
  newBounds: Ember.computed('bounds', function() {
  return L.fitBounds(bounds);
}),
*/

  getExtension(fileName) {
    // TODO: Should we check mime type? https://stackoverflow.com/a/29672957/1792144
    // It would be nice, but not a prioritory.
    return fileName.name.split('.').pop();
  },
    attributeMap: {
    lat: null,
    lng: null,
    coords: null,
    title: null,
    description: null,
    video: null,
    audio: null,
    images: null,
    filters: null
  },

    // types: {label: 'Title'},
    types: [{
      label: 'Title',
      disabled: false,
      value: 'title'
    },
    {
      label: 'Coords',
      disabled: false,
      value: 'coords'
    },
    {
      label: 'Lat',
      disabled: false,
      value: 'lat'
    },
    {
      label: 'Lng',
      disabled: false,
      value: 'lng'
    },
    {
      label: 'Description',
      disabled: false,
      value: 'description'
    },
    {
      label: 'Image(s)',
      disabled: false,
      value: 'images'
    },
    {
      label: 'Image Credit',
      disabled: false,
      value: 'image-credit'
    },
    {
      label: 'Video',
      disabled: false,
      value: 'video'
    },
    {
      label: 'Audio',
      disabled: false,
      value: 'audio'
    },
    {
        label: 'Filter',
        disabled: false,
        value: 'filters'
    }
  ],
  sheetJson: null,

  didInsertElement() {
    let dataInput = $('#datafile').first()[0];
    dataInput.onchange = (event) => {
      const file = event.target.files[0];
      const extension = this.getExtension(file);
      assert(`File must be ${fileTypes.join(', ')}`, fileTypes.includes(extension));
      if (extension === 'xlsx') {
        reader.onload = () => {
          set(this, 'data', SpreadsheetData.init());
        };
        reader.readAsBinaryString(file);

      } else {
        reader.onload = () => {
          set(this, 'data', GeojsonData.init());
          set(this, 'table', get(this, 'data.table'));
        };
        reader.readAsText(file);
      }
    };
  },

  actions: {
    layerAdded(feature) {
      
      if (feature.layer._latlng) {
       // get(this, 'bounds').push([feature.layer._latlng.lat, feature.layer._latlng.lng]);
       get(this, 'bounds').push([feature.layer._latlng]);
      }
      else {
        get(this, 'bounds').push(feature.layer._latlngs);
        //console.log(feature.layer._latlngs.bounds);
      }
      feature.layer._map.fitBounds(get(this, 'bounds'));


    },

    updateLocation(feature, event) {
      let location = event.target.getLatLng();
      setProperties(feature, {
        lat: location.lat,
        lng: location.lng
      });
    },

    onEachFeature(feature, layer) {
      var popupText = "";
      for (var key in feature.properties) {
        if (!feature.properties.hasOwnProperty(key)) continue;
        var obj = feature.properties[key];
          
          popupText += (key + ": " + obj + "<br />");
        
        layer.bindPopup(popupText); 
      }
      
      layer.options.draggable = true;
    },


    updateFeature(attribute, feature, event) {
      set(feature, `${attribute}`, event);
    },

    onClickFeature(feature, layer) {
    // Assuming the clicked feature is a shape, not a point marker.
    map.fitBounds(event.layer.getBounds());
},
    
    generateFeaturs() {
      let data = get(this, 'sheetJson');
      let attributeMap = get(this, 'attributeMap');
      let foo = [];

      data.forEach((d) => {
          let feature = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [d[attributeMap['lng']], d[attributeMap['lat']]]
            },
            properties: {
              title: d[attributeMap['title']],
              description: d[attributeMap['description']],
              images: this.imageArray(d[attributeMap['images']]),
              video: d[attributeMap['video']],
              audio: d[attributeMap['audio']],
              filters: {}
            }
          }

          feature.properties.filters[attributeMap['filters']] = d[attributeMap['filters']];
        foo.push(feature);

        get(this, 'store').createRecord('vector_feature', {geojson: feature, vector_layer: get(this, 'layer')});
        set(this, 'geoJsonFeatures', foo);
      });
    },

    mapAttribute(type, column) {
      const data = get(this, 'sheetJson');
      if (type === 'description') {
          $(`<p>${data[0][column.target.value]}</p>`).appendTo('#preview-description');
      }
      get(this, 'attributeMap')[type] = column.target.value
    }
  }
});

