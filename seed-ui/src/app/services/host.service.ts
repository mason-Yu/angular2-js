import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/toPromise";

import { GlobalsService, AppAlertService } from "../shared/index";
import { AppErrorHandler } from "../shared/appErrorHandler";
import { Host } from "./index";
import { APP_CONFIG } from "../shared/app-config";

/**
 * This HostServiceBase interface is optional for HostService but it helps
 * define a simple FakeHostService for testing purposes
 */
export interface HostServiceBase {
   getHosts(): Promise<Host[]>;
   getHostProperties(objectId: string, properties: string[]): Promise<Host>;
}

// Object type
export const hostType = "HostSystem";

@Injectable()
export class HostService implements HostServiceBase {
   constructor(private http: Http,
               private errorHandler: AppErrorHandler,
               private gs: GlobalsService,
               private appAlertService: AppAlertService) {
   }

   /**
    * Build the REST url endpoint for retrieving a list of properties.
    * This is mapped to the DataAccessController on the java side.
    */
   buildDataUrl (objectId, propList): string {
      const propStr = propList.toString();
      const dataUrl = this.gs.getWebContextPath() +
            "/rest/data/properties/" + objectId + "?properties=" + propStr;
      return dataUrl;
   };

   private getHostsUrl(): string {
      let url: string;
      if (this.gs.useLiveData()) {
         // Use plugin's REST endpoint to get list of object names with type HostSystem
         url = this.gs.getWebContextPath() + "/rest/data/list/?"
               + "targetType=" + hostType + "&properties=name";
      } else {
         url = APP_CONFIG.getMockDataUrl(this.gs.isPluginMode()) + "/hosts";
      }
      return url;
   }

   private getHostPropertiesUrl(objectId: string, properties: string[]): string {
      let url: string;
      if (this.gs.useLiveData()) {
         // Use rest/data/properties/[objectId]?properties=... to get data from the Java service
         url = this.buildDataUrl(objectId, properties);
      } else {
         url = APP_CONFIG.getMockDataUrl(this.gs.isPluginMode()) + "/hosts/" + objectId;
      }
      return url;
   }

   /**
    * Get all hosts with some default properties.
    * Note: this is only used for populating the sidenav component used in dev mode.
    *
    * @returns {Promise<Host[]>}
    */
   getHosts(): Promise<Host[]> {
      const headers = this.gs.getHttpHeaders();
      const useLiveData = this.gs.useLiveData();

      return this.http.get(this.getHostsUrl(), headers)
            .toPromise()
            // Normal response has a data field, mock response from db.json doesn't
            .then(response => (useLiveData ? response.json().data : response.json()) as Host[])
            .catch(error => this.errorHandler.httpPromiseError(error));
   }

   /**
    * Query a list of properties for a specific host id.
    *
    * @param objectId
    * @param properties  Array of property names matching the Host model definition and the db.json mock data
    * @returns a Promise with the host model set with corresponding value
    */
   getHostProperties(objectId: string, properties: string[]): Promise<Host> {
      const headers = this.gs.getHttpHeaders();
      const url = this.getHostPropertiesUrl(objectId, properties);
      const useLiveData = this.gs.useLiveData();

      return this.http.get(url, headers)
            .toPromise()
            .then(response => {
               if (useLiveData) {
                  // A conversion is necessary between the real HostSystem properties and the Host model
                  return Host.convertProperties(response.json());
               }
               // Mock data can be cast to Host directly, but id must be converted to string
               const host = response.json() as Host;
               host.id = host.id.toString();
               return host;
            })
            .catch(error => {
               if (!useLiveData && error.status === 404) {
                  // return an empty mock host when mock data is not available
                  return new Host();
               }
               return this.errorHandler.httpPromiseError(error);
            });
   }

   /**
    * Shortcut to retrieve a host name and handle errors
    * @param objectId
    * @param callback  Function to be called with the new Host object, which has only id and name.
    */
   getHostName(objectId: string, callback: Function): void {
      this.getHostProperties(objectId, ["name"])
            .then(host => callback(host))
            .catch(errorMsg => {
               this.appAlertService.showError(errorMsg);
            });
   }
}
