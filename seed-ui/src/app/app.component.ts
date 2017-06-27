import { Component, Injector, ViewEncapsulation, ChangeDetectorRef } from "@angular/core";

import { GlobalsService, RefreshService, I18nService }   from "./shared/index";
import { ActionDevService } from "./services/testing/action-dev.service";

@Component({
   selector: "my-app",
   styleUrls: ["./app.component.scss"],
   templateUrl: "./app.component.html",
   providers: [ ],
   encapsulation: ViewEncapsulation.None
})
export class AppComponent {

   constructor(public  gs: GlobalsService,
               private injector: Injector,
               private refreshService: RefreshService,
               private i18nService: I18nService,
               private changeDetector: ChangeDetectorRef) {

      // Refresh handler to be used in plugin mode
      this.gs.getWebPlatform().setGlobalRefreshHandler(this.refresh.bind(this), document);

      // Manual injection of ActionDevService, used in webPlatformStub
      if (!this.gs.isPluginMode()) {
         this.injector.get(ActionDevService);
      }

      // Start the app in english by default (dev mode)
      // In plugin mode the current locale is passed as parameter
      this.i18nService.initLocale("en");
   }

   refresh(): void {
      // This propagates the refresh event to views that have subscribed to the RefreshService
      this.refreshService.refreshView();

      if (this.gs.isPluginMode()) {
         // This helps refresh the app's children components in Plugin mode after refreshView,
         // but this is not enough for asynchronous code => see how detectChanges() is also called
         // in data functions in monitor.component.ts, main.component.ts, etc.
         this.changeDetector.detectChanges();
      }
   }
}
