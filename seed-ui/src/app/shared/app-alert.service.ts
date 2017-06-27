import { Subject }    from 'rxjs/Subject';

/**
 * Service used to display top-level alerts, see app-alert.component.
 */
export class AppAlertService {
   // Observable sources:
   // alertMessageSource array contains the message to display and the alert type (see Clarity doc)
   // closeAlertSource is for closing the alert component
   private alertMessageSource = new Subject<[string, string]>();
   private closeAlertSource = new Subject();

   // Observable streams
   alertMessage$ = this.alertMessageSource.asObservable();
   closeAlert$ = this.closeAlertSource.asObservable();

   showError(message: string) {
      this.alertMessageSource.next([message, "alert-danger"]);
   }

   showInfo(message: string) {
      this.alertMessageSource.next([message, "alert-info"]);
   }

   showWarning(message: string) {
      this.alertMessageSource.next([message, "alert-warning"]);
   }

   showSuccess(message: string) {
      this.alertMessageSource.next([message, "alert-success"]);
   }

   closeAlert() {
      this.closeAlertSource.next();
   }
}
