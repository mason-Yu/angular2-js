import { Component, Input, OnInit, Injector } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";

import { APP_CONFIG } from "../../shared/app-config";
import { GlobalsService, AppAlertService }   from "../../shared/index";
import { WebPlatform }  from "../../shared/vSphereClientSdkTypes";
import { Host, HostService } from "../../services/index";

/**
 * The UI content for the host action1 modal dialog
 * In plugin mode, this component runs as-is in the modal created by the Client platform.
 * In dev mode, it is injected in the generic dialog-box component.
 */
@Component({
   selector: "action1-modal",
   styleUrls: ["./plugin-modal.scss"],
   templateUrl: "./action1-modal.component.html"
})
export class Action1ModalComponent implements OnInit {
   private actionUid: string;
   private readonly webPlatform: WebPlatform;
   private readonly webContextPath: string;
   public formData = {
      param1: "",
      param2: "some default value",
      param3: "typeA"
   };
   public pluginFormClass: string;

   private host: Host;

   // Flag for Clarity modal
   // @Input() opened: boolean;

   constructor(private injector: Injector,
               public gs: GlobalsService,
               private appAlertService: AppAlertService,
               private hostService: HostService,
               private route: ActivatedRoute) {
      this.webPlatform = this.gs.getWebPlatform();
      this.webContextPath = this.gs.getWebContextPath();

      // in dev mode host is passed down from the dialog container
      if (!gs.isPluginMode()) {
         this.host = this.injector.get('context');
      }

      // css adjustment
      this.pluginFormClass = this.gs.isPluginMode() ? "plugin-modal-form" : "";
   }

   ngOnInit(): void {
      if (this.gs.isPluginMode()) {
         // Get host objectId and actionUid from query parameters:
         // - actionUid could also be hard-coded if this modal is only used for 1 action
         // - retrieve host name in order to change the dialog title
         this.route.params.forEach((params: Params) => {
            this.actionUid = params["actionUid"];
            const hostId = params["id"];
            this.hostService.getHostName(hostId, hostResult => {
               this.host = hostResult;
               this.webPlatform.setDialogTitle("Action1 for " + this.host.name);
            });
         });

      } else {
         // dev mode: modal dialog is opened from the Host monitor view,
         // host is already known and we set actionUid to the value in plugin.xml
         this.actionUid = APP_CONFIG.packageName + ".sampleAction1";
      }
   }

   /**
    * Function handler for the modal dialog submit button.
    * It must be defined by all components injected in DialogBox
    */
   public handleSubmit(): void {
      const actionUrl = this.webContextPath + "/rest/actions.html?actionUid=" + this.actionUid;
      const data = JSON.stringify(this.formData);
      this.webPlatform.callActionsController(actionUrl, data, this.host.id);

      if (!this.gs.isPluginMode()) {
         this.appAlertService.showInfo(this.actionUid + " called with " + data);
      }
   }

   onSubmit(): void {
      this.webPlatform.closeDialog();
      this.handleSubmit();
   }

   onCancel(): void {
      this.webPlatform.closeDialog();
   }

}
