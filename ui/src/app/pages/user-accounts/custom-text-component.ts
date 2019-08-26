import { Component, Input, OnInit } from '@angular/core';

import { ViewCell } from 'ng2-smart-table';

/**
 * Component to render custom text in user accounts table.
 * Which is used to slice the characters to 20.
 */
@Component({
  template: `
    {{renderValue}}
  `,
})
export class CustomTextComponent implements ViewCell, OnInit {

  /**
   * Value to render on the grid
   */
  renderValue: string;
  /**
   * Input value to the component
   */
  @Input() value: string;
  /**
   * Entire row data
   */
  @Input() rowData: any;

  ngOnInit() {
      console.log('this.value', this.value);
      this.renderValue = this.value.slice(0, 20) + '...';
  }

}
