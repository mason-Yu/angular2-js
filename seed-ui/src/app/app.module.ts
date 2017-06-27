import "./rxjs-extensions";

import { NgModule, ErrorHandler }      from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule }    from "@angular/http";
import { ClarityModule } from "clarity-angular";

import { AppRoutingModule, routedComponents } from "./app-routing.module";

import { EchoService, HostService, NavService }  from "./services/index";
import { Globals } from "./shared/globals.service";
import { GlobalsService, I18nService,
         AppAlertService, RefreshService }   from "./shared/index";
import { ActionDevService }   from "./services/testing/action-dev.service";
import { DialogBoxComponent } from "./shared/dev/dialog-box.component";
import { DynamicDialogComponent }   from "./shared/dev/dynamic-dialog.component";
import { AppErrorHandler } from "./shared/appErrorHandler";
import { AppComponent }     from "./app.component";
import { SettingsModule } from "./views/settings/settings.module";
import { SharedModule } from "./shared/shared.module";

// [removable-chassis-code]
import { ChassisService } from "./services/chassis/chassis.service";
import { InMemoryWebApiModule } from "angular-in-memory-web-api";
import { InMemoryDataService } from "./services/chassis/in-memory-data.service";
// [end-chassis-code]
import { UserSettingService } from "app/shared/user-settings.service";


@NgModule({
   imports: [
      BrowserModule,
      BrowserAnimationsModule,
      ClarityModule.forRoot(),
      HttpModule,
      AppRoutingModule,
      SettingsModule,
      SharedModule,
      // [removable-chassis-code]
      // InMemoryDataService config: forward unrecognized requests + remove the default 500ms delay
      InMemoryWebApiModule.forRoot(InMemoryDataService, { passThruUnknownUrl: true, delay: 0 })
      // [end-chassis-code]
   ],
   declarations: [
      AppComponent,
      DialogBoxComponent,
      DynamicDialogComponent,
      routedComponents
   ],
   providers: [
      ActionDevService,
      AppAlertService,
      AppErrorHandler,
      ChassisService, // [removable-chassis-line]
      EchoService,
      Globals,
      GlobalsService,
      HostService,
      I18nService,
      NavService,
      RefreshService,
      UserSettingService,
      {provide: ErrorHandler, useClass: AppErrorHandler}],
   bootstrap: [AppComponent]
})

export class AppModule {
}
