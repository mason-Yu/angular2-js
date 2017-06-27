import { Component, Input, OnInit, OnDestroy, ViewChild, Inject,
         forwardRef, ChangeDetectorRef } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { TabLink } from "clarity-angular";

import { EchoService, NavService }  from "../../services/index";
import { GlobalsService, RefreshService,
AppAlertService, I18nService }   from "../../shared/index";
import { WebPlatform } from "../../shared/vSphereClientSdkTypes";
import { DialogBoxComponent }  from "../../shared/dev/dialog-box.component";
import { UserSettingService } from "../../shared/user-settings.service";
// [removable-chassis-code]
import { Chassis } from "../../services/chassis/chassis.model";
import { ChassisService } from "../../services/chassis/chassis.service";
// [end-chassis-code]

@Component({
   selector: "main-view",
   styleUrls: ["./main.component.scss"],
   templateUrl: "./main.component.html",
})
export class MainComponent implements OnInit, OnDestroy {
   chassisList: Chassis[];  // [removable-chassis-line]
   currentTab: string;
   echoMsg: string;
   updateTime: string;
   webPlatform: WebPlatform;
   @Input() echoModalOpened = false;
   private echoSubscription: Subscription;
   private refreshSubscription: Subscription;

   // Note: use @ViewChildren in case you have more than one dialogBox.
   @ViewChild(DialogBoxComponent) dialogBox: DialogBoxComponent;

   // Note: the syntax @Inject(forwardRef(() => EchoService)) is required for services in order to avoid
   // circular dependencies problems in main.component.spec.ts test, else we get this error:
   //   "Failed: Can't resolve all parameters for MainComponent: ([object Object], ?, [object Object], ...)"
   constructor(public gs: GlobalsService,
               @Inject(forwardRef(() => ChassisService)) private chassisService: ChassisService,  // [removable-chassis-line]
               @Inject(forwardRef(() => EchoService)) private echoService: EchoService,
               private appAlertService: AppAlertService,
               @Inject(forwardRef(() => NavService)) public nav: NavService,
               private refreshService: RefreshService,
               private userSettingService: UserSettingService,
               public  i18n: I18nService,
               private changeDetector: ChangeDetectorRef) {

      this.webPlatform = this.gs.getWebPlatform();

      // Subscribe to refreshService to handle the global refresh action
      this.refreshSubscription = refreshService.refreshObservable$.subscribe(
            () => this.refreshView());
   }

   sendEcho(useLocalPopup: boolean): void {
      this.appAlertService.closeAlert();

      const echoMsg = this.i18n.translate("mainView.world");

      // Default implementation uses the Observable pattern.
      // - echoSubscription subscribes (listens) to the echoService observable
      // - one advantage here is that you can cancel the subscription if the response doesn't
      //   come back before the user goes to another page (see ngOnDestroy() below)
      this.echoSubscription = this.echoService.sendEcho(echoMsg).subscribe(
            msg => { this.openEchoModal(useLocalPopup, msg); },
            error => { this.appAlertService.showError(error); }
      );

      // Alternative version using a Promise instead of an Observable:
      // this.echoService.sendEchoVersion2("World!").then(msg => this.openEchoModal(useLocalPopup, msg));
   }

   sendEchoVersion2(useLocalPopup: boolean): void {
      this.echoService.sendEchoVersion2("World!")
         .then(msg => this.openEchoModal(useLocalPopup, msg))
         .catch(errorMsg => {
            this.appAlertService.showError(errorMsg);
         });
   }

   openEchoModal(useLocalPopup: boolean, msg: string) {
      this.echoMsg = msg;
      // Every visible text must be internationalized
      const title = this.i18n.translate("mainView.echoResponse");

      if (useLocalPopup) {
         this.echoModalOpened = true;
      } else if (this.gs.isPluginMode()) {
         // We use the openModalDialog API to create a real modal, but this comes with limitations:
         // - we can't pass the echoMsg parameter (only an objectId set to null here)
         // - there will be a small delay to display the content since it's a separate view
         const url = this.gs.getWebContextPath() + "/index.html?view=echo-modal";
         this.webPlatform.openModalDialog(title, url, 288, 150, null);
      } else {
         this.dialogBox.openEchoModal(this.echoMsg, title);
      }
   }

   onSubmitEcho(): void {
      this.echoModalOpened = false;
   }

   // [removable-chassis-code]
   gotoChassis(chassis: Chassis): void {
      this.nav.showObjectView(chassis.id, "chassis", "summary");
   }

   editChassis(chassis: Chassis = null): void {
      const addingChassis: boolean = (chassis === null);
      const title = addingChassis ? this.i18n.translate("chassis.createAction") :
            this.i18n.translate("edit.chassis", chassis.name);

      if (this.gs.isPluginMode()) {
         // URL must include the actionUid because the modal dialog is invoked directly instead of
         // through a menu action (where actionUid is added automatically)
         const url = this.gs.getWebContextPath() + "/index.html?view=edit-chassis&actionUid=__packageName__.editChassis";
         this.webPlatform.openModalDialog(title, url, 576, 248, (chassis === null ? null : chassis.id));
      } else {
         this.dialogBox.openEditChassis(chassis, title);
      }
   }

   deleteChassis(chassis: Chassis): void {
      if (this.gs.isPluginMode()) {
         // TODO make delete work in this mode
         this.appAlertService.showWarning("Delete is not implemented yet in plugin mode");
      } else {
         this.chassisService.delete(chassis)
               .then(res => {
                  this.refreshService.refreshView();
               });
      }
   }
   // [end-chassis-code]

   isActiveTab(id: string): boolean {
      return (id === this.currentTab);
   }

   setActiveTab(id: string, inRefreshView: boolean = false): void {
      this.currentTab = id;

      if (this.currentTab === 'homeTab') {
         // Timestamp to show how the home view is refreshed through the RefreshService.
         this.updateTime = new Date().toLocaleTimeString();
      }

      // Reload the view data for tabs who need it  [removable-chassis-code]
      if (this.currentTab === 'chassisTab') {
         this.getChassisList();
      }
      // [end-chassis-code]
   }

   onTabSelected(event: TabLink) {
      this.appAlertService.closeAlert();
      this.setActiveTab(event.id);
      this.userSettingService.setSetting("mainTab", event.id);
   }

   ngOnInit(): void {
      this.initCurrentTabView();
   }

   ngOnDestroy(): void {
      this.refreshSubscription.unsubscribe();
      if (this.echoSubscription) {
         this.echoSubscription.unsubscribe();
      }
   }

   private refreshView(): void {
      this.initCurrentTabView(true);
   }

   private initCurrentTabView(inRefreshView: boolean = false): void {
      let savedTab: string = this.userSettingService.getSetting("mainTab");
      if (savedTab !== "echoTab" && savedTab !== "chassisTab") {
         savedTab = "homeTab";
      }
      this.setActiveTab(savedTab, inRefreshView);
   }

   // [removable-chassis-code]
   private getChassisList(inRefreshView: boolean = false): void {
      this.chassisService.getChassisList(true)
            .then(chassisList => {
               this.chassisList = chassisList;
               if (inRefreshView) {
                  // This is necessary to refresh the DOM when coming from a Refresh event
                  this.changeDetector.detectChanges();
               }
            })
            .catch(errorMsg => this.appAlertService.showError(errorMsg));
   }
   // [end-chassis-code]
}
