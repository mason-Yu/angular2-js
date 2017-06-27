
import { Injectable } from "@angular/core";
import { APP_CONFIG } from "app/shared";

/**
 * Service to store user preferences that are used across views.
 *
 * In plugin mode, each view is a separate webapp, so runtime values cannot be
 * easily between views. This service uses the browser "local storage" to save
 * preferences locally. It could be extended to save data on the backend instead.
 *
 * In Dev mode this service is useful for restoring settings each time the app is refreshed.
 */
@Injectable()
export class UserSettingService {
   setSetting(key: string, value: any): void {
      const pluginKey = APP_CONFIG.pluginName + "-" + key;
      const strValue = "" + value;
      localStorage.setItem(pluginKey, strValue);
   }

   getSetting(key: string): string {
      const pluginKey = APP_CONFIG.pluginName + "-" + key;
      return localStorage.getItem(pluginKey);
   }
}
