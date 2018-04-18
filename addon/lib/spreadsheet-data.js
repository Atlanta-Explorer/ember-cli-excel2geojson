import { A } from '@ember/array';
import { set } from '@ember/object';
import XLSX from 'xlsx';
import GeoData from './geo-data';
import wellknown from 'wellknown';

export default({

  init() {
    let workbook = XLSX.read(event.target.result, {'type': 'binary'});
    // TODO: Do we want to support multiple sheets?
    let json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    //alert(Object.keys(json[0]));
    json.forEach(function(feature) {
      if(feature.hasOwnProperty('wkt_geom')) {
        let geom = wellknown(feature['wkt_geom']); //returns geojson GEOMETRY object with type,coordinates
        //add 2 columns (type, coordinates) and their data 
        feature.type = geom['type'];
        feature.coords = geom['coordinates'];
        delete feature.wkt_geom ; //remove the wkt_geom column as it is now redundant
      }
      
    });

    set(this, 'table', GeoData.setTable(A(json)));
    set(this, 'tableJson', json);
    return this;
  }
});
