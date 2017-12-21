import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('geojson-parse-data', 'Integration | Component | geojson parse data', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{geojson-parse-data}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#geojson-parse-data}}
      template block text
    {{/geojson-parse-data}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
