import Ember from 'ember';
import Table from 'ember-light-table'
import layout from '../templates/components/parse-spreadsheet';
/* global XLSX */

const {
  Component,
  computed,
  get,
  set
} = Ember;

// "{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[-84.38835610000001,33.733005]}]}"
// {name: "Herb / James L. Key Elementary", styleUrl: "#icon-503-DB4436", styleHash: "5378268d", gx_media_links: "//www.youtube.com/embed/XKQzJptmlzI"}

const Feature = Ember.Object.extend({
    lat: null,
    lng: null,
    title: null,
    description: null,
    video: null,
    audio: null,
    images: []
});

const GeoJson = Ember.Object.extend({
  type: "Feature",
  geometry: {
    type: "Point",
    coordinates: [0,1]
  },
  properties: {

  }
});

export default Component.extend({
  layout,
  model: null,



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
      images: []
  },

  hi(feature, layer) {
      let popUpContent = `<table>
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

  // types: {label: 'Title'},
  types: [{
      label: 'Title',
      disabled: false,
      value: 'title'
    },
    {
      label: 'Description',
      disabled: false,
      value: 'description'
    },
    {
      label: 'Image(s)',
      disabled: false,
      value: 'image'
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
      label: 'Lat',
      disabled: false,
      value: 'lat'
    },
    {
      label: 'Lng',
      disabled: false,
      value: 'lng'
    }
  ],

  sheetJson: null,
  strGeojson: null,
  grrr: [],

  findOrNew(id, features) {
      if (features.length  >= id + 1) {
          return get(this, 'features')[id];
      } else {
          let newFeature = GeoJson.create();
        //   features.push(newFeature);
          return newFeature;
      }
  },


  didInsertElement() {

  },

  actions: {
    loadSpreadsheet() { // Receive data through loading a spreadsheet.
      var fileInput = document.getElementById("sheet");
      var file = fileInput.files[0]
      var extension = this.getExtension(file.name);
      var reader = new FileReader();

      if (extension == 'xlsx') {
        reader.onload = (event) => {
          var xlsxData = event.target.result;
          var workbook = XLSX.read(xlsxData, {
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
                value: key.dasherize()
              })
            });
            set(this, 'columns', columns);
            set(this, 'model', json);
            set(this, 'table', new Table(columns, this.get('model'), {
              enableSync: this.get('enableSync')
            }));
            get(this, 'table.rows').forEach(() => {
                get(this, 'features').push(GeoJson.create());
            });
          });
        };
        reader.readAsBinaryString(file);
      } else if (extension == 'csv') {
        reader.onload = (event) => {
          //   var dataText = event.target.result;
          //   data = this.parseText(dataText, ',');
          //   this.prepareData();
        };
        reader.readAsText(file);
      }
    },

    generateFeaturs() {
        let data = get(this, 'sheetJson');
        let attributeMap = get(this, 'attributeMap');
        let newFeature = {};
        let foo = [];
        console.log('foo', foo);
        // data.forEach( () => {
        //     foo.push({});
        // });
        data.forEach( (d, index) => {
            console.log('index', index);
            foo.push(
            //     {
            // title: d[attributeMap['title']],
            // description: d[attributeMap['description']],
            // lat: d[attributeMap['lat']],
            // lng: d[attributeMap['lng']]});

            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [d[attributeMap['lng']],d[attributeMap['lat']]]
              },
              properties: {
                  title: d[attributeMap['title']],
                  description: d[attributeMap['description']]
              }
            }
            // console.log('newFeature', newFeature);
            // foo.push(newFeature);
            // console.log('title', foo);
        );
        console.log('ff', foo);
        set(this, 'geoJsonFeatures', foo);
    });
    },
    mapAttribute(type, column) {
        get(this, 'attributeMap')[type] = column.target.value
        console.log('map', get(this, 'attributeMap'));
        console.log('json', get(this, 'sheetJson'));
        console.log('data', get(this, 'sheetJson'));

    //   let json = get(this, 'sheetJson');
    // //   let features = get(this, 'features');
    // //   set(this, 'geoJsonFeatures', []);
    // //   console.log('clear?', get(this, 'geoJsonFeatures'));
    //   get(this, 'features').forEach( (feature, index) => {
    //       console.log('attribute', attribute.target.value);
    //       console.log('type', type);
    //       console.log('json', json[index][attribute.target.value]);
    //     //   let feature = get(this, 'features')[index];
    //     //   console.log('feature', feature);
    //     //   console.log('index', index);
    //       if (type === 'lat') {
    //           feature['geometry']['coordinates'][1] = parseFloat(json[index][attribute.target.value]);
    //     //   } else if (type === 'lng') {
    //     //       feature['geometry']['coordinates'][0] = parseFloat(attr[attribute.target.value]);
    //     //   } else if ((type === 'image')) {
    //     //       feature['properties']['images'].push(attr[attribute.target.value]);
    //     //   } else {
    //     //       feature['properties'][type] = attr[attribute.target.value];
    //     //   }
    //   });
    // //   console.log('geoJsonFeatures', get(this, 'features'));
    // //   console.log('grr', get(this, 'features'));
    }
  }



});
