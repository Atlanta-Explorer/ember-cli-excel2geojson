import Ember from 'ember';
import Table from 'ember-light-table'
import layout from '../templates/components/parse-spreadsheet';
/* globals XLSX, L */

const {
  Component,
  computed,
  get,
  set,
  inject: {
        service
    }
} = Ember;

const GeoJson = Ember.Object.extend({
  type: "Feature",
  geometry: {
    type: "Point",
    coordinates: [0, 1]
  },
  properties: {

  }
});

export default Component.extend({
  store: service(),
  layout,
  model: null,
  type: 'file',
  attributeBindings: ['type', 'value'],

  getExtension(fileName) {
    var dotIndex = fileName.lastIndexOf('.');
    if (dotIndex >= 0) {
      return fileName.substring(dotIndex + 1).toLowerCase();
    }
    return '';
  },

  lat: 33.7489954,
  lng: -84.3879824,
  zoom: 10,

  isLoading: computed.oneWay('fetchRecords.isRunning'),

  table: null,

  tabelColumns: [],
  geoJsonFeatures: [],

  features: [],
  attributeMap: {
    lat: null,
    lng: null,
    title: null,
    description: null,
    video: null,
    audio: null,
    images: null,
    filters: null
  },

  onEachFeature(feature, layer) {
    // TODO Add all attributes.
    // Content for map preview popups. Does not show all attributes.
    let popUpContent = `
    <table>
      <tr>
        <td>
          Title
        </td>
        <td>
          ${feature.properties.title}
        </td>
      </tr>
      <tr>
        <td>
          Description
        </td>
        <td>
        ${feature.properties.description}
        </td>
      </tr>
    </table>`;
    layer.bindPopup(popUpContent);
  },

  pointToLayer(stankonia, latlng) {
    return L.marker(latlng, {
        draggable: true
    });
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

  sheetJson: null,
  strGeojson: null,
  grrr: [],

  imageArray(images) {
      // TODO account for more cases.
      // This only accounts for image urls that are sperated by
      // a comma and a space. It does acount for filenames with
      // spaces by checking for `http` after the space.
    if (images) {
        return images.replace(/(.)(\s*http)/gi, '$1, $2').split(',');
    } else {
        return undefined;
    }
  },

  // Split this into function to make testing easier.
  xlsx2json(file) {
      var workbook = XLSX.read(file, {
        'type': 'binary'
      });

      workbook.SheetNames.forEach((sheetName) => {
        let columns = [];
        let json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        set(this, 'sheetJson', json);
        set(this, 'strGeojson', JSON.stringify(get(this, 'geojson'), undefined, 4));
        set(this, 'tableColumns', Object.keys(json[0]));
        Object.keys(json[0]).forEach(function(key) {
          columns.push({
            label: key,
            resizable: true,
            valuePath: key,
            sortable: false,
            value: key.dasherize(),
            cellComponent: 'inline-edit'
          })
        });
        set(this, 'columns', columns);
        // set(this, 'model', json);
        set(this, 'table', new Table(columns, json, {
          enableSync: this.get('enableSync')
        }));
        get(this, 'table.rows').forEach(() => {
          get(this, 'features').push(GeoJson.create());
        });
      });
  },

  loadSpreadsheet(file) { // Receive data through loading a spreadsheet.
    const extension = this.getExtension(file.name);
    const reader = new FileReader();
    alert(extension)

    if (extension == 'xlsx') {
      reader.onload = (event) => {
        this.xlsx2json(event.target.result)
      };
      reader.readAsBinaryString(file);
    } else if (extension == 'csv') {
      reader.onload = (/*event*/) => {
        //
      };
      reader.readAsText(file);
    }
  },

  didInsertElement() {
    this._super(...arguments);
    this.setupParseSpreadsheet();
    let fileInput = this.$('#sheet')[0];

    fileInput.onchange = (event) => {
      this.loadSpreadsheet(event.target.files[0]);
    };
  },

  willDestroyElement() {
    this._super(...arguments);
    this.teardownParseSpreadsheet();
  },

  setupParseSpreadsheet() {
      //
  },

  teardownParseSpreadsheet() {
      this.destroy();
  },

  actions: {
    generateFeaturs() {
      let data = get(this, 'sheetJson');
      let attributeMap = get(this, 'attributeMap');
      let foo = [];

      data.forEach((d) => {
          let feature = {
            type: "Feature",
            geometry: {
              type: "Point",
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
