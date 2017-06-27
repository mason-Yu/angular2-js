import { Component, Input, OnInit } from "@angular/core";

import { APP_CONFIG } from "../app-config";
import { GlobalsService, RefreshService }   from "../index";

/**
 * Modal component to get or set the user session client id
 */
@Component({
   selector: "clientid-setup",
   templateUrl: "./clientid.component.html"
})
export class ClientidComponent implements OnInit {
   @Input() clientId: string;
   @Input() modalOpened = false;
   public readonly settingViewUrl = "https://localhost:9443/ui/#/?extensionId=" + APP_CONFIG.packageName + ".settingsView";

   constructor(public gs: GlobalsService,
               private refreshService: RefreshService) {
   }

   ngOnInit(): void {
      if (this.gs.isPluginMode()) {
         // Extract the current client id when running inside vSphere Client
         const userSession = this.gs.getWebPlatform().getUserSession();
         this.clientId = userSession.clientId;
         console.log("clientId = " + userSession.clientId);
      }
   }

   public show(): void {
      this.modalOpened = true;
   }

   onSubmit(): void {
      this.modalOpened = false;
      if (!this.gs.isPluginMode()) {
         // Save the client id for dev mode
         this.gs.setClientId(this.clientId);
         this.refreshService.refreshView();
      }
   }

   onCancel(): void {
      this.modalOpened = false;
   }
}
