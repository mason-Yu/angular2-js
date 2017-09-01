import { Component, OnInit } from "@angular/core";
import { Location }     from "@angular/common";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SecurityContext } from '@angular/core';

import { APP_CONFIG } from "../app-config";
import { GlobalsService, RefreshService }   from "../index";
import { extensionToRoutes } from "../../app-routing.module";
import { Http, Headers } from "@angular/http";
import { AppAlertService } from "../app-alert.service";
import { I18nService } from "../i18n.service";
import { NavService } from "../../services/nav.service";


/**
 * Header component visible only in plugin mode and shared by all views
 */
@Component({
   selector: "app-header",
   styleUrls: ["./app-header.component.scss"],
   templateUrl: "./app-header.component.html"
})
export class AppHeaderComponent implements OnInit {
   pluginName = APP_CONFIG.pluginName;
   version = APP_CONFIG.version;
   viewExtension: string;
   extensionXml: SafeHtml;
   isFrench = false;

   constructor(public gs: GlobalsService,
               private appAlertService: AppAlertService,
               private refreshService: RefreshService,
               private location: Location,
               private i18nService: I18nService,
               private nav: NavService,
               private http: Http,
               private sanitizer: DomSanitizer) {
   }

   ngOnInit(): void {
      // Get the url segment with the first /
      const path = /(\/[^\/]+)/.exec(this.location.path())[1];
      this.viewExtension = Object.keys(extensionToRoutes).find(key => extensionToRoutes[key] === path);
   }

   goHome(): void {
      // Here we could use direct navigation, i.e. this.router.navigate(["/"]), since this is only
      // for dev mode, but it is better to re-use the common NavService for consistency and test.
      this.nav.showView("mainView");
   }

   settings(): void {
      // Here we could use direct navigation, i.e. this.router.navigate(["/settings"]), since this is only
      // for dev mode, but it is better to re-use the common NavService for consistency and test.
      this.nav.showView("settingsView");
   }

   refresh(): void {
      this.refreshService.refreshView();
   }

   /**
    * Switch locale between english and french to test your translations in dev mode
    * @param locale
    */
   setLocale(locale): void {
      this.isFrench = (locale === "fr");
      this.i18nService.initLocale(locale);
      this.refreshService.refreshView();
   }

   toggleLiveData(): void {
      this.gs.toggleLiveData();
      this.refreshService.refreshView();
   }

   toggleSidenav(): void {
      this.gs.toggleSidenav();
   }

   toggleViewInfo(): void {
      this.extensionXml = null;
      this.gs.toggleViewInfo();
   }

   /**
    * Show/Hide view extension info
    */
   toggleExtensionXml(): void {
      if (this.extensionXml) {
         this.extensionXml = null;
      } else {
         this.appAlertService.closeAlert();
         const headers = new Headers({"Content-Type": "text/html"});

         // Extract the extension definition from plugin.xml, served by json-server
         const pluginXmlUrl = APP_CONFIG.getMockDataUrl(false) + "/plugin.xml";
         const re: RegExp = new RegExp('<extension id="' + this.viewExtension + '"[^]*?extension>', "m");
         this.http.get(pluginXmlUrl, headers)
               .toPromise()
               .then(response => {
                  const result = re.exec(response.text());
                  if (result) {
                     const text = "plugin.xml fragment for that extension:\n" + result[0];
                     this.extensionXml = this.sanitizer.sanitize(SecurityContext.NONE, text);
                  }
               })
               .catch(error => this.appAlertService.showError(
                     "Cannot find plugin.xml details. You need to start json-server with --static ./src/webapp "));
      }
   }
}
