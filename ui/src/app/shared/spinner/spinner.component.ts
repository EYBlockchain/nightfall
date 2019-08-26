import { Component, OnInit , Input, OnDestroy } from '@angular/core';

/**
 * Spinner component, which is used for showing on every http request.
 */
@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent  implements OnDestroy {

  /**
   *  To set the timeout
   */
  private currentTimeout: any;
  /**
   * Flag to know spinner is running delayed.
   */
  private isDelayedRunning: any = false;

  @Input()
  public delay: any = 3000;
  @Input()
  public message = 'Loading .....';

  @Input()
  public set isRunning(value: boolean) {
      if (!value) {
          this.cancelTimeout();
          this.isDelayedRunning = false;
          return;
      }

      if (this.currentTimeout) {
          return;
      }

      this.currentTimeout = setTimeout(() => {
          this.isDelayedRunning = value;
          this.cancelTimeout();
      }, this.delay);
  }

  /**
   * Method to cancel the timeout.
   */
  private cancelTimeout(): void {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = undefined;
  }

  ngOnDestroy(): any {
      this.cancelTimeout();
  }

}
