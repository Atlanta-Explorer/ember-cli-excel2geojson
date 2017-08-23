// tests/integration/components/parse-spreadsheet-test.js
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
// import { click, fillIn, find } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import jQuery from 'jquery';
import readFileSync from 'fs-extra';
/* global require */
const fs = require('fs-extra')
moduleForComponent('parse-spreadsheet', 'Integration | Component | parse-spreadsheet', {
  integration: true
});


// test('Load Exel file', async function(assert) {
//   this.render(hbs```
//     {{parse-spreadsheet}}
//   ```);
//
//   await fillIn('#sheet', '../../../fixtures/sample.xlsx');
//   await click('#sheet');
//
//   assert.ok(find('.table-container'));
// });

test('correcly mocks file input values', function(assert) {
  let handleFile = sinon.spy();
  let mockFile = fs.readFileSync('../../fixtures/sample.xlsx');
  // let content = ':application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  // let mockFile = new Blob([""], {type: content});
  // mockFile["lastModifiedDate"] = "";
  // mockFile["name"] = "fsample.xlsx";

  this.set('handleFile', handleFile);
  this.render(hbs`
   {{parse-spreadsheet}}
  `);

  fillInFileInput('#sheet', mockFile);

  assert.ok(handleFile.calledOnce, 'Action `handleFile` should be called once.');
  // assert.ok(handleFile.calledWithExactly(new File([""], "filename")), 'Action `handleFile` should be called with exact arguments');
});

function fillInFileInput(selector, file) {
  // Get the input
  let input = jQuery(selector);

  // Get out file options
  let { name, type, content } = file;

  // Create a custom event for change and inject target
  let event = jQuery.Event('change', {
    target: {
      files: [{
        name: name, type: type
      }]
    }
  });

  // Stub readAsDataURL function
  let stub = sinon.stub(FileReader.prototype, 'readAsBinaryString', function() {
    this.onload({ target: { result: content }});
  });

  // Trigger event
  input.trigger(event);

  // We don't want FileReader to be stubbed for all eternity
  stub.restore();
}
