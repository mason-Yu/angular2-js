
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { Response, ResponseOptions } from "@angular/http";

// [removable-chassis-code]
import { Chassis } from "../services/chassis/chassis.model";
import { chassisList } from "../services/testing/fake-chassis";
// [end-chassis-code]

/*
 * Various service stubs used for components unit tests
 */

export const globalsServiceStub = {
   showDevUI: function() { return false; },
   showSidenav: function() { return false; },
   isPluginMode: function() { return true; },
   getWebPlatform: function() { return null; }
};

export const appAlertServiceStub = {
   closeAlert: function() { },
   showError: function(any) { }
};

// [removable-chassis-code]
export const chassisServiceStub = {
   delete(chassis: Chassis): Promise<Response> {
      const resp = new Response(new ResponseOptions({status: 200, body: {data: []}}));
      return Promise.resolve(resp);
   },
   getChassisList():  Promise<Chassis[]> {
      return Promise.resolve(chassisList);
   }
};
// [end-chassis-code]

export const echoServiceStub = {
   sendEcho(echoMsg: string): Observable<string> {
      console.log("sendEcho: " + echoMsg);
      return new Subject().asObservable();
   },
   sendEchoVersion2(echoMsg: string): Promise<string> {
      console.log("sendEchoVersion2: " + echoMsg);
      return Promise.resolve(echoMsg);
   }
};

export const i18nServiceStub = {
   translate: function(key: string) { return key; }
};

export const navServiceStub = {
   showSettingsView: function() {  }
};

export const userSettingServiceStub = {
   getSetting: function(key: string) { return null; },
   setSetting: function(key: string, value: any) {  }
};

