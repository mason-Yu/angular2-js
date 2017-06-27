import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, ChangeDetectorRef } from "@angular/core";
import { Location }     from "@angular/common";
import { ActivatedRoute, Params } from "@angular/router";
import { Subscription } from "rxjs/Subscription";

import { APP_CONFIG } from "../../shared/app-config";
import { GlobalsService, RefreshService, I18nService,
         AppAlertService }   from "../../shared/index";
import { Host, HostService, NavService } from "../../services/index";
import { DialogBoxComponent }  from "../../shared/dev/dialog-box.component";
import { Action2WizardComponent } from "../modals/action2-wizard.component";

/**
 * View component for the Host monitor extension
 */
@Component({
   selector: "host-monitor",
   styleUrls: ["./monitor.component.scss"],
   templateUrl: "./monitor.component.html",
})
export class MonitorComponent implements OnInit, OnDestroy {
   host: Host;
   titleKey: string;
   private refreshViewSub: Subscription;
   instance: MonitorComponent;
   // Note: use @ViewChildren in case you have more than one dialogBox.
   @ViewChild(DialogBoxComponent) dialogBox: DialogBoxComponent;
   @ViewChild(Action2WizardComponent) action2Wizard: Action2WizardComponent;

   constructor(public  gs: GlobalsService,
               private appAlertService: AppAlertService,
               private hostService: HostService,
               public  i18n: I18nService,
               private location: Location,
               public  nav: NavService,
               private refreshService: RefreshService,
               private route: ActivatedRoute,
               private changeDetector: ChangeDetectorRef) {

      this.instance = this;

      // Subscribe to refreshService to handle the global refresh action
      this.refreshViewSub = refreshService.refreshObservable$.subscribe(
            () => this.refreshView());
   }

   ngOnInit(): void {
      // Initialize the component's host based on the id parameter
      this.route.params.forEach((params: Params) => {
         const id = params["id"];
         this.getHostData(id);

         // Set the view title between monitor and manage
         this.titleKey = this.nav.getViewType() + "View";
      });

      // Set the current view type between monitor and manage
      const viewType = /\/(.*)\//.exec(this.location.path())[1];
      this.nav.setViewType(viewType);
   }

   ngOnDestroy(): void {
      this.refreshViewSub.unsubscribe();
   }

   /**
    * refreshView is called when clicking the Refresh button (in plugin or dev mode)
    * or when toggling the Use Live Data button (dev mode only)
    */
   private refreshView(): void {
      // First we find the current host id at the end of the url
      // Then we check if that id still belongs to the hosts list, else revert to first host
      const path = this.location.path();
      let id = path.substring(path.lastIndexOf("/") + 1);

      this.hostService.getHosts()
            .then(hosts => {
               if (hosts.length === 0) {
                  return;
               }
               const curHost = hosts.find(h => h.id === id);
               if (!curHost) {
                  id = hosts[0].id;
               }
               this.getHostData(id, true);
            });
   }

   /**
    * Action1 dialog in dev mode
    * (in plugin mode the Action1 dialog will be opened from the Host menu)
    */
   public openAction1Dialog(): void {
      this.appAlertService.closeAlert();

      const title = "Action1 for " + this.host.name;
      this.dialogBox.openActionDialog(this.host, title);
   }

   /**
    * Action2 wizard in dev mode
    * (in plugin mode the Action2 wizard will be opened from the Host menu)
    */
   public openAction2Wizard(): void {
      this.appAlertService.closeAlert();

      const title = "Action2 wizard";
      this.action2Wizard.openWizard(this.host, title);
   }

   /**
    * Action3 is headless, so it only logs the call in dev mode
    */
   public callAction3(): void {
      this.appAlertService.closeAlert();

      // we set actionUid to same value as in plugin.xml
      const actionUid = APP_CONFIG.packageName + ".sampleAction3";
      const actionUrl = this.gs.getWebContextPath() + "/rest/actions.html?actionUid=" + actionUid;
      this.gs.getWebPlatform().callActionsController(actionUrl, null, this.host.id);
   }

   /**
    *
    * @param id
    */
   private getHostData(id: string, inRefreshView: boolean = false): void {
      const useLiveData = this.gs.useLiveData();
      this.hostService.getHostProperties(id, APP_CONFIG.hostProperties)
            .then(host => {
               this.host = host;
               if (!useLiveData && host.id !== id) {
                  this.host.id = id;
               }
               if (inRefreshView) {
                  // This is necessary to refresh the DOM when coming from a Refresh event
                  this.changeDetector.detectChanges();
               }
            })
            .catch(errorMsg => {
               this.appAlertService.showError(errorMsg);
            });
   }

   public getStatusIcon(host: Host): string {
      if (host.status === "green") {
         return "info";
      } else if (host.status === "yellow") {
         return "warning";
      }
      return "error";
   }

   showOtherView(id: string): void {
      this.nav.showObjectView(id, "host", (this.nav.getViewType() === 'monitor' ? 'manage' : 'monitor'));
   }
}
