import { assert } from '@ember/debug';
import Component from '@ember/component';
import { get, set, setProperties } from '@ember/object';
import { A } from '@ember/array';
import layout from '../templates/components/geojson-parse-data';
import $ from 'jquery';
import GeojsonData from '../lib/geojson-data';
import SpreadsheetData from '../lib/spreadsheet-data';

const fileTypes = A(['xlsx', 'json', 'geojson']);
const reader = new FileReader();

export default Component.extend({
  layout,
  data: null,
  table: null,
  bounds: A([[33.7489954, -84.3879824]]),

  getExtension(fileName) {
    // TODO: Should we check mime type? https://stackoverflow.com/a/29672957/1792144
    // It would be nice, but not a prioritory.
    return fileName.name.split('.').pop();
  },

    // types: {label: 'Title'},
    types: [{
      label: 'Title',
      disabled: false,
      value: 'title'
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
        get(this, 'bounds').push([feature.layer._latlng.lat, feature.layer._latlng.lng]);
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

    updateFeature(attribute, feature, event) {
      set(feature, `${attribute}`, event);
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
