import { Injectable } from "@angular/core";
import { Subject }    from 'rxjs/Subject';

import { AppAlertService }   from "./app-alert.service";

/**
 * Service used to send a "refresh event" to any observer view
 */
@Injectable()
export class RefreshService {
   // Use an rxjs Subject to multicast to multiple observers.
   // See http://reactivex.io/rxjs/manual/overview.html#subject
   private refreshSource = new Subject();
   public refreshObservable$ = this.refreshSource.asObservable();

   constructor(private appAlertService: AppAlertService) {
   }

   public refreshView(): void {
      // Close any open alert box here before a view is refreshed
      this.appAlertService.closeAlert();

      // Propagate refresh event to subscribers
      this.refreshSource.next();
   }
}
