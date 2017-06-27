import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from "@angular/core";
import { Subscription } from "rxjs/Subscription";

import { GlobalsService, RefreshService,
         AppAlertService}   from "../index";
import { Host, HostService } from "../../services/index";
import { NavService } from "../../services/nav.service";
import { UserSettingService } from "app/shared/user-settings.service";
// [removable-chassis-code]
import { ChassisService } from "../../services/chassis/chassis.service";
import { Chassis } from "../../services/chassis/chassis.model";
// [end-chassis-code]

/**
 * Sidenav component visible only in plugin mode and shared by all views
 */
@Component({
   selector: "sidenav",
   styleUrls: ["./sidenav.component.scss"],
   templateUrl: "./sidenav.component.html"
})
export class SidenavComponent  implements OnInit, OnDestroy {
   hosts: Host[];
   selectedHost = -1;
   private subscription: Subscription;
   @ViewChild("hostsInput") hostsListInput: ElementRef;
   // [removable-chassis-code]
   @ViewChild("chassisInput") chassisListInput: ElementRef;
   chassisList: Chassis[];
   selectedChassis = -1;
   // [end-chassis-code]

   // ToDo: use case for accessing parent component?
   @Input() parent;

   constructor(public gs: GlobalsService,
               private appAlertService: AppAlertService,
               private chassisService: ChassisService,      // [removable-chassis-line]
               private hostService: HostService,
               public navService: NavService,
               private refreshService: RefreshService,
               private userSettingService: UserSettingService) {
      this.subscription = refreshService.refreshObservable$.subscribe(
            () => this.refreshView());
   }

   selectHost(hostId, index): void {
      this.selectedHost = index;
      this.selectedChassis = -1;  // [removable-chassis-line]
      this.navService.showObjectView(hostId, "host");
   }

   // [removable-chassis-code]
   selectChassis(chassisId, index): void {
      this.selectedHost = -1;
      this.selectedChassis = index;
      this.navService.showObjectView(chassisId, "chassis", "summary");
   }
   // [end-chassis-code]

   refreshView(): void {
      this.hostService.getHosts()
            .then(hosts => {
               this.hosts = hosts;
               if (this.hosts.length === 0) {
                  this.appAlertService.showInfo("No hosts found");
               }
            })
            .catch(errorMsg =>  this.appAlertService.showError(errorMsg));

      // get chassis sorted by name [removable-chassis-code]
      this.chassisService.getChassisList(true)
            .then(chassisList => {
               this.chassisList = chassisList;
            })
            .catch(errorMsg =>  this.appAlertService.showError(errorMsg));
      // [end-chassis-code]
   }

   saveSetting(event): void {
      const key = "show" + event.target.id;
      this.userSettingService.setSetting(key, !event.target.checked);
   }

   ngOnInit(): void {
      this.refreshView();

      // The lists collapsed state is saved as local setting.  Only hosts are shown initially.
      const hostsListCollapsed: boolean = (this.userSettingService.getSetting("showHosts") === "false");
      this.hostsListInput.nativeElement.checked = hostsListCollapsed;
      // [removable-chassis-code]
      const chassisListCollapsed: boolean = !(this.userSettingService.getSetting("showChassis") === "true");
      this.chassisListInput.nativeElement.checked = chassisListCollapsed;
      // [end-chassis-code]
   }
   ngOnDestroy(): void {
      this.subscription.unsubscribe();
   }

}

