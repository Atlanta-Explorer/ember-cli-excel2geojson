import Component from '@ember/component';
import { set } from '@ember/object';
import layout from '../templates/components/table-cell-edit';

export default Component.extend({
  layout,
  tagName: ['input'],
  attributeBindings: ['value'],

  change(event) {
    set(this, `row.${this.column.label}`, event.target.value);
  }
});
