import { A } from '@ember/array';
import { set } from '@ember/object';
import XLSX from 'xlsx';
import GeoData from './geo-data';

export default({

  init() {
    let workbook = XLSX.read(event.target.result, {'type': 'binary'});
    // TODO: Do we want to support multiple sheets?
    let json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    alert(Object.keys(json[0]));
    set(this, 'table', GeoData.setTable(A(json)))
    return this;
  }
});
