import { Component, Input, OnInit } from '@angular/core';

import { ViewCell } from 'ng2-smart-table';

/**
 * Component to render user selection status in user accounts table.
 */
@Component({
  template: `
    <b [ngStyle]="{'color':renderValue === 'True' ? 'green' : '' }">{{renderValue}}</b>
  `,
})
export class CustomSelectionComponent implements ViewCell, OnInit {

  /**
   * Value to render on the grid
   */
  renderValue: string;
  /**
   * Input value to the component
   */
  @Input() value: string | number;
  /**
   * Entire row data
   */
  @Input() rowData: any;

  ngOnInit() {
      console.log('this.value', this.value);
      this.renderValue = (this.value) ? 'True' : 'False';
  }

}
