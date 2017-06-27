import { Component, Input, OnInit, Injector } from "@angular/core";

import { GlobalsService }   from "../../shared/index";
import { WebPlatform }  from "../../shared/vSphereClientSdkTypes";
import { I18nService } from "../../shared/i18n.service";

/**
 * The UI content for the echo modal dialog
 * In plugin mode, this component runs as-is in the modal created by the Client platform.
 * In dev mode, it is injected in the generic dialog-box component.
 */
@Component({
   selector: "echo-modal",
   styleUrls: ["./plugin-modal.scss"],
   templateUrl: "./echo-modal.component.html"
})
export class EchoModalComponent implements OnInit {
   webPlatform: WebPlatform;
   echoMsg: string;

   constructor(private injector: Injector,
               public gs: GlobalsService,
               public i18n: I18nService) {
      this.webPlatform = this.gs.getWebPlatform();

      // in dev mode the context is passed down from the dialog container
      if (!gs.isPluginMode()) {
         this.echoMsg = this.injector.get('context');
      }
   }
   // Flag for Clarity modal
   @Input() opened: boolean;

   ngOnInit(): void {
      this.opened = true;
   }

   /**
    * handleSubmit must be defined by all components injected in DialogBox
    */
   public handleSubmit(): void {
      // Nothing to submit;
   }

   onSubmit(): void {
      this.opened = false;
      this.webPlatform.closeDialog();
      this.handleSubmit();
   }

}
