import Ember from 'ember';
import Table from 'ember-light-table'
import layout from '../templates/components/parse-spreadsheet';
/* globals XLSX, L, Swiper */

const {
  $,
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
    coordinates: ['0', '1']
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
  description: ['o'],

  isLoading: computed.oneWay('fetchRecords.isRunning'),

  table: null,

  tabelColumns: [],
  geoJsonFeatures: [],

  features: [],
  attributeMap: {
    lat: null,
    lng: null,
    title: null,
    description: [],
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

  images: null,

  imageArray(images) {
    // TODO account for more cases.
    // This only accounts for image urls that are sperated by
    // a comma and a space. It does acount for filenames with
    // spaces by checking for `http` after the space.
    if (images) {
      return images.replace(/(.)(\s*http)/gi, '$2').split(' ');
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

    if (extension == 'xlsx') {
      reader.onload = (event) => {
        this.xlsx2json(event.target.result)
      };
      reader.readAsBinaryString(file);
    } else if (extension == 'csv') {
      reader.onload = ( /*event*/ ) => {
        //
      };
      reader.readAsText(file);
    }
  },

  concatDescription(d) {
    let content = '';
    get(this, 'attributeMap')['description'].forEach((section) => {
      content += `<h3>${section}</h3><p>${d[section]}</p>`
    });
    return content;
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
      // Clear the store incase we are re-generating.
      get(this, 'store').unloadAll('vector_feature');
      let data = get(this, 'sheetJson');
      let attributeMap = get(this, 'attributeMap');
      let features = [];

      data.forEach((d) => {
        if (d[attributeMap['lng']] && d[attributeMap['lat']]) {
            let feature = {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [parseFloat(d[attributeMap['lng']]), parseFloat(d[attributeMap['lat']])]
              },
              properties: {
                title: d[attributeMap['title']],
                description: this.concatDescription(d),
                images: this.imageArray(d[attributeMap['images']]),
                video: d[attributeMap['video']],
                audio: d[attributeMap['audio']],
                filters: {}
              }
            }
            feature.properties.filters[attributeMap['filters']] = d[attributeMap['filters']];
            features.push(feature);
            console.log('feature', feature);

            get(this, 'store').createRecord('vector_feature', {
              geojson: feature,
              vector_layer: get(this, 'layer')
            });
            set(this, 'geoJsonFeatures', features);        }
      });
    },

    mapAttribute(type, column) {
      // This maps which columns to the attributes. It will be used to look
      // up each individule row.
      // We need to remove any leading and trailing whitespace from the lat and lng.
      if (type === 'lat' || type === 'lng') {
          set(this.attributeMap, type, column.target.value.toString().replace(/^\s+|\s+$/g, ""));
      } else {
          set(this.attributeMap, type, column.target.value);
      }

      const data = get(this, 'sheetJson');
      const content = data[0][column.target.value];

      if (type === 'video') {
        $('#preview-video').empty();
        $(`<p>${data[0][column.target.value]}</p>`).appendTo('#preview-video');
      } else if (type === 'audio') {
        $('#preview-audio').empty();
        if (content.startsWith('http')) {
          $('#preview-audio').html(`<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=${content}&amp;color=ff5500&amp;auto_play=false&amp;hide_related=true&amp;show_comments=false&amp;show_user=false&amp;show_reposts=false"></iframe>`);
        } else if (content.startsWith('<iframe')) {
          $('#preview-audio').html(content);
        } else {
          $('#preview-audio').html('<p>error</p>');
        }
      } else if (type === 'images') {
        $('.swiper-wrapper').empty();
        this.imageArray(content).forEach((image) => {
          $('.swiper-wrapper').append(`<div class="swiper-slide"><img src="${image}"></div>`);
        });

        // if (feature.properties.images.length > 1) {
        const newSwiper = new Swiper('.swiper-container', {
          pagination: '.swiper-pagination',
          nextButton: '.swiper-button-next',
          prevButton: '.swiper-button-prev',
          slidesPerView: 1,
          paginationClickable: true,
          centeredSlides: true,
          zoom: true
        });
        set(this, 'swiperObj', newSwiper);
        // }
        // END GALLERY
      }
    },

    concatDescriptionPreview(type, column) {
      const data = get(this, 'sheetJson');
      $(`<p>${data[0][column.target.value]}</p>`).appendTo('#preview-description');
      get(this, 'attributeMap')[type].push(column.target.value);
    },

    addInput() {
      //   $('.description').find('select:first').clone(true, false).appendTo('.description')
      get(this, 'description').pushObject('l')
    }
  }
});
