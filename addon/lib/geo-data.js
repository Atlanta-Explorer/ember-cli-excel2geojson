import { A } from '@ember/array';
import { dasherize } from '@ember/string';
import Table from 'ember-light-table';

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

  setTable(features) {
    let tableData = A([]);

    features.forEach(function(feature) {
      tableData.push(feature);
    });

    return new Table(this.setTableColumns(features), tableData, {
      enableSync: true
    });
  }
});

export default GeoData;
