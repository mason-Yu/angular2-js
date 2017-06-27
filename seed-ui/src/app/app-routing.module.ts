import { NgModule, ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from "@angular/router";

import { APP_CONFIG } from "./shared/app-config";
import { AppRoutingComponent }  from "./app-routing.component";
import { MainComponent }  from "./views/main/index";
import { MonitorComponent } from "./views/monitor/index";
import { SummaryComponent } from "./views/summary/summary.component";
import { Action1ModalComponent, Action2WizardComponent,
         EchoModalComponent } from "./views/modals/index";
import { NYIComponent } from "./views/not-implemented-yet/nyi.component";
// [removable-chassis-code]
import { EditChassisComponent } from "./views/modals/edit-chassis.component";
import { ChassisSummaryComponent } from "./views/chassis-summary/chassis-summary.component";
import { userLoginComponent } from "./views/user/user-login.component";
// [end-chassis-code]

/**
 * Supported routes and associated components
 */
const appRoutes: Routes = [

   // ----- Route for plugin mode -----
   // All views and action extensions use index.html in plugin.xml:
   // AppRoutingComponent will redispatch to an internal route below

   { path: "index.html", component: AppRoutingComponent },

   // ----- Routes for dev mode and for internal routing -----

   { path: "", redirectTo: "/main", pathMatch: "full" },
   { path: "main",         component: MainComponent },

   // settings is an example of lazy loaded module
   { path: "settings",     loadChildren: 'app/views/settings/settings.module#SettingsModule' },

   { path: "action1-modal/:id/:actionUid",  component: Action1ModalComponent },
   { path: "action2-wizard/:id/:actionUid", component: Action2WizardComponent },

   // echo-modal route may or may not have an id parameter
   { path: "echo-modal/:id",  component: EchoModalComponent },
   { path: "echo-modal",      component: EchoModalComponent },

   // MonitorComponent is shared by the Host Monitor and Manage (Configure) views
   { path: "monitor/:id",   component: MonitorComponent },
   { path: "manage/:id",    component: MonitorComponent },
   { path: "summary/:id",   component: SummaryComponent },

   // [removable-chassis-code]
   { path: "chassis-summary/:id",   component: ChassisSummaryComponent },
   { path: "chassis-monitor/:id",   component: NYIComponent },
   { path: "chassis-manage/:id",    component: NYIComponent },
   { path: "edit-chassis/:id/:actionUid",   component: EditChassisComponent },
   // [end-chassis-code]

   //[user-model]
   { path: "user-login",   component: userLoginComponent }


   //[end-user-model]
];

/**
 * Map from plugin.xml view extensions to routes, used by navigation utilities in nav.service.ts
 */
export const extensionToRoutes = { };
extensionToRoutes[APP_CONFIG.packageName + ".mainView" ]          = "/main";
extensionToRoutes[APP_CONFIG.packageName + ".settingsView" ]      = "/settings";
extensionToRoutes[APP_CONFIG.packageName + ".host.summaryView" ]  = "/summary";
extensionToRoutes[APP_CONFIG.packageName + ".host.monitorView" ]  = "/monitor";
extensionToRoutes[APP_CONFIG.packageName + ".host.manageView" ]   = "/manage";   // = Configure tab
// [removable-chassis-code]
extensionToRoutes[APP_CONFIG.packageName + ".chassis.summaryView" ]  = "/chassis-summary";
extensionToRoutes[APP_CONFIG.packageName + ".chassis.monitorView" ]  = "/chassis-monitor";
extensionToRoutes[APP_CONFIG.packageName + ".chassis.manageView" ]   = "/chassis-manage";
// [end-chassis-code]

/**
 * List of routed components above, for easy inclusion in app-module
 */
export const routedComponents = [
   AppRoutingComponent,
   MainComponent,
   MonitorComponent,
   SummaryComponent,
   Action1ModalComponent,
   Action2WizardComponent,
   EchoModalComponent,
   // [removable-chassis-code]
   ChassisSummaryComponent,
   EditChassisComponent,
   // [end-chassis-code]
   NYIComponent,
   userLoginComponent
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);

@NgModule({
   imports: [ routing ],
   exports: [ RouterModule ]
})
export class AppRoutingModule { }



