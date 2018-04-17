import { A } from '@ember/array';
import { dasherize } from '@ember/string';
import Table from 'ember-light-table';
import { get, set, setProperties } from '@ember/object';
import wellknown from 'wellknown';

// Setup the table columns
const GeoData = ({
  setTableColumns(features) {
    let tableColumn = A([]);
    Object.keys(features[0]).forEach((col) => {
      tableColumn.push({
        label: col,
        resizable: true,
        valuePath: col,
        sortable: false,
        value: dasherize(col),
        cellComponent: 'table-cell-edit'
      })
    });
    return tableColumn;
  },
// Add data to the table
  setTable(features) {
    let tableData = A([]);

    features.forEach(function(feature) {
      // if(feature.hasOwnProperty('wkt_geom')) {
      //   let geom = wellknown(feature['wkt_geom']); //returns geojson GEOMETRY object with type,coordinates
      //   //add 2 columns (type, coordinates) and their data 
      //   feature.type = geom['type'];
      //   feature.coords = geom['coordinates'];
      //   delete feature.wkt_geom ; //remove the wkt_geom column as it is now redundant
      // }
      tableData.push(feature);
    });

    return new Table(this.setTableColumns(features), tableData, {
      enableSync: true
    });
  }
});

export default GeoData;
