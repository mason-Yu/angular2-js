import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { Subscription }   from 'rxjs/Subscription';

import { AppAlertService }   from "./app-alert.service";

/**
 * Alert component for reporting info, warnings or errors at the application level.
 *
 * This implementation only supports one message at a time.
 */
@Component({
   selector: "app-alert",
   templateUrl: "./app-alert.component.html"
})
export class AppAlertComponent implements OnInit, OnDestroy {
   @Input() alertClosed = true;
   message: string;
   alertType: string;
   subForOpen: Subscription;
   subForClose: Subscription;

   constructor(private appAlertService: AppAlertService) {
      // Observe alertMessage$ and open the Alert component when a message arrives
      // Any existing message is overridden with the new one.
      this.subForOpen = appAlertService.alertMessage$.subscribe(
            param => {
               this.message = param[0];
               this.alertType = param[1];
               this.alertClosed = false;
            }
      );
      // Register to observe the closeAlert$ source and close the Alert component
      this.subForClose = appAlertService.closeAlert$.subscribe(
            () =>  this.alertClosed = true);
   }

   ngOnInit(): void {
   }

   ngOnDestroy(): void {
      this.subForOpen.unsubscribe();
      this.subForClose.unsubscribe();
   }
}
