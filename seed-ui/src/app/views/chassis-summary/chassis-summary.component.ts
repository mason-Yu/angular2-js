import { Component, Input, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { Subscription } from "rxjs/Subscription";

import { AppAlertService, GlobalsService, RefreshService }   from "../../shared/index";
import { Chassis, ChassisService }  from "../../services/chassis/index";
import { NavService } from "../../services/nav.service";
import { I18nService } from "../../shared/i18n.service";
import { DialogBoxComponent } from "../../shared/dev/dialog-box.component";

@Component({
   styleUrls: ["./chassis-summary.component.scss"],
   templateUrl: "./chassis-summary.component.html",
})
export class ChassisSummaryComponent implements OnInit, OnDestroy {
   // Chassis object displayed in this view
   chassis: Chassis;

   // mock variables no related to chassis data in this sample
   @Input() level1: number;
   @Input() level2: number;

   // Note: use @ViewChildren in case you have more than one dialogBox.
   @ViewChild(DialogBoxComponent) dialogBox: DialogBoxComponent;

   private subscription: Subscription;

   constructor(public gs: GlobalsService,
               public nav: NavService,
               private appAlertService: AppAlertService,
               private chassisService: ChassisService,
               public  i18n: I18nService,
               private refreshService: RefreshService,
               private route: ActivatedRoute,
               private changeDetector: ChangeDetectorRef) {
      this.subscription = refreshService.refreshObservable$.subscribe(
            () => this.getChassisAndUpdateView(null, true));
   }


   editChassis(): void {
      const title = this.i18n.translate("edit.chassis", this.chassis.name);

      if (this.gs.isPluginMode()) {
         const url = this.gs.getWebContextPath() +
               "/index.html?view=edit-chassis&actionUid=__packageName__.editChassis";
         this.gs.getWebPlatform().openModalDialog(title, url,  576, 248, this.chassis.id);
      } else {
         this.dialogBox.openEditChassis(this.chassis, title);
      }
   }

   ngOnInit(): void {
      // Initialize the component"s chassis based on the id parameter
      this.route.params.forEach((params: Params) => {
         const id = params["id"];
         const locale = params["locale"];
         this.getChassisAndUpdateView(id);
      });
   }

   ngOnDestroy(): void {
      this.subscription.unsubscribe();
   }

   private getChassisAndUpdateView(id: string = null, inRefreshView: boolean = false): void {
      if (!id) {
         id = this.chassis.id;
      }
      this.chassisService.getChassis(id)
         .then(chassis => {
            this.chassis = chassis;
            this.updateView(inRefreshView);
         })
         .catch(errorMsg => this.appAlertService.showError(errorMsg));
   }

   private updateView(inRefreshView: boolean = false): void {
       // Mock health and compliance levels
      this.level1 = Math.round(Math.random() * 100);
      this.level2 = Math.round(Math.random() * 100);

      if (inRefreshView) {
         // This is necessary to refresh the DOM when coming from a Refresh event
         this.changeDetector.detectChanges();
      }
   }
}
