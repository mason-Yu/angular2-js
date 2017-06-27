
import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { GlobalsService } from "./index";
import { AppAlertService } from "./app-alert.service";
import { APP_CONFIG } from "./app-config";

/**
 * Internationalization service for handling message translation within plugin views
 *
 * This implementation relies on the HTML SDK internationalization guidelines for
 * keeping text messages compatible between vSphere HTML client and Flex client.
 * For text that is directly displayed in an HTML view it may be possible to use
 * Angular i18n tools (see https://angular.io/docs/ts/latest/cookbook/i18n.html)
 */
@Injectable()
export class I18nService {
   bundle = {};
   bundleName = APP_CONFIG.bundleName;

   constructor(private gs: GlobalsService,
               private appAlertService: AppAlertService,
               private http: Http) {
   }

   /**
    * Initialization of i18n bundles for dev mode.
    */
   initLocale(locale): void {
      const isPluginMode = this.gs.isPluginMode();
      this.gs.locale = locale;

      if (isPluginMode && this.gs.useLiveData()) {
         return;
      }
      // Only handle 2 locales here
      let localeCode = "en_US";
      if (locale.startsWith("fr")) {
         localeCode = "fr_FR";
      }
      const jsonFile = this.bundleName + "_" + localeCode + ".json";

      // We rely on the mock data server to access the .json file
      const jsonFileUrl = APP_CONFIG.getMockDataUrl(isPluginMode) + "/locales/" + jsonFile;

      const errorMsg = "Cannot load " + jsonFileUrl + "! " +
            "Please check local file and start json-server with --static ./src/webapp";

      // This requires properties file to have been converted to .json ahead of time!
      this.http.get(jsonFileUrl)
            .toPromise()
            .then(res => res.json())
            .catch(error => this.appAlertService.showError(errorMsg))
            .then(bundle => this.bundle = bundle);
   }

   /**
    * Get the translated message for the given key and optional parameters
    * @param key
    * @param params
    * @returns {any}
    */
   public translate(key: string, params: string|string[] = null): string {
      if (this.gs.isPluginMode() && this.gs.useLiveData()) {
         // SDK's getString allows compatibility with vSphere Flex Client
         return this.gs.getWebPlatform().getString(this.bundleName, key, params);
      }
      if (this.bundle && this.bundle[key]) {
         return this.interpolate(this.bundle[key], params);
      }
      // Display non translated keys as is
      return key;
   }

   // Insert parameters in messages containing placeholders {0} {1} ...
   interpolate(message: string, params: string|string[]): string {
      if (params) {
         if (typeof params === "string") {
            params = [params];
         }
         message = message.replace(/\{(\d+)\}/g, function (match, index) {
            if (index >= params.length) {
               // Less parameters than there are placeholders, so return the placeholder value.
               return match;
            }
            return params[ index ];
         });
      }
      return message;
   }
}
