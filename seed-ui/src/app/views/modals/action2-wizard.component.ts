import { Component, Input, OnInit, ViewChild } from "@angular/core";

import { Wizard } from "clarity-angular/wizard/wizard";
import { GlobalsService }   from "../../shared/index";
import { WebPlatform }  from "../../shared/vSphereClientSdkTypes";
import { Host } from "../../services/host.model";
import { AppAlertService } from "../../shared/app-alert.service";
import { Params, ActivatedRoute } from "@angular/router";
import { APP_CONFIG } from "../../shared/app-config";
import { HostService } from "../../services/host.service";

/**
 * Generic wizard used to wrap sub-components in dev mode.
 * Each sub-component class must be declared here and define a handleSubmit method.
 */
@Component({
   selector: "action2-wizard",
   styleUrls: ["./action2-wizard.component.scss"],
   templateUrl: "./action2-wizard.component.html"
})
export class Action2WizardComponent implements OnInit {
   actionUid: string;
   host: Host;
   title: string;
   private webPlatform: WebPlatform;
   private webContextPath: string;

   @ViewChild("wizard") wizard: Wizard;

   public formData = {
      param1: "",
      param2: "some default value",
      param3: "typeA"
   };

   constructor(public gs: GlobalsService,
               private appAlertService: AppAlertService,
               private hostService: HostService,
               private route: ActivatedRoute) {
      this.webPlatform = this.gs.getWebPlatform();
      this.webContextPath = this.gs.getWebContextPath();
   }

   ngOnInit(): void {
      if (this.gs.isPluginMode()) {
         // this.opened = true;
         // Get host objectId and actionUid from query parameters:
         // - actionUid could also be hard-coded if this modal is only used for 1 action
         // - retrieve host name in order to change the dialog title
         this.route.params.forEach((params: Params) => {
            this.actionUid = params["actionUid"];
            const hostId = params["id"];
            this.hostService.getHostName(hostId, hostResult => {
               this.host = hostResult;
               this.webPlatform.setDialogTitle("Action2 wizard for " + this.host.name);
            });
         });
         this.wizard.open();

      } else {
         // dev mode: modal dialog is opened from the Host monitor view,
         // host is already known and we set actionUid to the value in plugin.xml
         this.actionUid = APP_CONFIG.packageName + ".sampleAction2";
      }
   }

   openWizard(host: Host, title: string) {
      this.host = host;
      this.title = title;
      this.wizard.open();
   }

   onCommit(): void {
      this.webPlatform.closeDialog();

      const actionUrl = this.webContextPath + "/rest/actions.html?actionUid=" + this.actionUid;
      const data = JSON.stringify(this.formData);
      this.webPlatform.callActionsController(actionUrl, data, this.host.id);

      if (!this.gs.isPluginMode()) {
         this.appAlertService.showInfo(this.actionUid + " called with " + data);
      }
   }

   onCancel(): void {
      this.webPlatform.closeDialog();
   }

}
