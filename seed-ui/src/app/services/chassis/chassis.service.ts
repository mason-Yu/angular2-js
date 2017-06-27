import { Injectable } from "@angular/core";
import { Http, Response, ResponseOptions } from "@angular/http";
import { GlobalsService, AppAlertService } from "../../shared/index";
import { APP_CONFIG } from "../../shared/app-config";
import { AppErrorHandler } from "../../shared/appErrorHandler";
import { WebPlatform }  from "../../shared/vSphereClientSdkTypes";
import { Chassis } from "./chassis.model";
import { chassisIdConstant, initialChassisCount } from "../testing/fake-chassis";

import "rxjs/add/operator/toPromise";

// ChassisServiceBase interface is not really required for ChassisService but
// it helps define a simple FakeChassisService for testing purposes
export interface ChassisServiceBase {
   getChassisList(): Promise<Chassis[]>;
   getChassis(objectId: string): Promise<Chassis>;
   save(chassis: Chassis): Promise<Response>;
   delete(chassis: Chassis): Promise<Response>;
}

// Object type
export const chassisType = "samples:Chassis";

@Injectable()
export class ChassisService implements ChassisServiceBase {
   private readonly inMemoryChassisUrl = "app/chassisList";
   private readonly webPlatform: WebPlatform;
   private readonly webContextPath: string;
   private chassisCount: number = initialChassisCount;

   constructor(private http: Http,
               private errorHandler: AppErrorHandler,
               private gs: GlobalsService,
               private appAlertService: AppAlertService) {
      this.webContextPath = this.gs.getWebContextPath();
      this.webPlatform = this.gs.getWebPlatform();
   }

   /**
    * Build the REST url endpoint for retrieving a list of properties.
    * This is mapped to the DataAccessController on the java side.
    */
   buildDataUrl (objectId, propList): string {
      const propStr = propList.toString();
      const dataUrl = this.webContextPath +
            "/rest/data/properties/" + objectId + "?properties=" + propStr;
      return dataUrl;
   };

   private getChassisUrl(): string {
      let url: string;
      const properties = APP_CONFIG.chassisProperties.toString();

      if (this.gs.useLiveData()) {
         // Use plugin's REST endpoint to get list of object names with type HostSystem
         url = this.webContextPath + "/rest/data/list/?"
               + "targetType=" + chassisType + "&properties=" + properties;
      } else {
         // Mock data
         url = this.inMemoryChassisUrl;
      }
      return url;
   }

   /**
    * Get all chassis with their standard properties
    *
    * @param sorted  true for sorting the list by names
    */
   getChassisList(sorted: boolean = false): Promise<Chassis[]> {
      const headers = this.gs.getHttpHeaders();

      return this.http.get(this.getChassisUrl(), headers)
            .toPromise()
            .then(response => {
               const chassisList = response.json().data as Chassis[];
               return chassisList.sort(function(chassis1, chassis2) {
                     return chassis1.name.localeCompare(chassis2.name);
               });
            })
            .catch(error => this.errorHandler.httpPromiseError(error));

   }

   /**
    * Get a chassis by id
    */
   getChassis(objectId: string): Promise<Chassis> {
      if (this.gs.useLiveData()) {
         // Use rest/data/properties/[objectId]?properties=... to get data from the Java service
         const url = this.buildDataUrl(objectId, APP_CONFIG.chassisProperties);
         const headers = this.gs.getHttpHeaders();

         return this.http.get(url, headers)
            .toPromise()
            .then(function (response) {
               const chassis = response.json() as Chassis;
               // Use the original objectId to avoid encoding issues
               chassis.id = objectId;
               return chassis;
            })
            .catch(error => this.errorHandler.httpPromiseError(error));
      } else {
         // Standalone mode: find the chassis.id in the in-memory chassisList
         return this.getChassisList()
            .then(chassisList => chassisList.find(chassis => chassis.id === objectId));
      }
   }

   // Create or update a chassis.
   // Return a failure if the chassis name already exists.
   save(chassis: Chassis): Promise<Response> {
      if (chassis.id) {
         return this.put(chassis);
      }
      return this.post(chassis);
   }

   // Delete an existing chassis
   delete(chassis: Chassis): Promise<Response> {
      if (this.gs.useLiveData()) {
         const url = this.webContextPath + "/rest/actions.html?actionUid=__packageName__.deleteChassis";
         this.webPlatform.callActionsController(url, null, chassis.id);

         // Response doesn't matter here
         return this.getDummyResponsePromise();
      }
      // Encode url
      const url = `${this.inMemoryChassisUrl}/${chassis.id}`;
      console.log("deleteChassis, url = " + url);

      return this.http
         .delete(url)
         .toPromise()
         .catch(error => this.errorHandler.httpPromiseError(error));
   }

   // Return null or a duplicate chassis with the same name
   private checkDuplicateName(chassis: Chassis): Promise<Chassis | void> {
      const newName = chassis.name;
      const currentId = chassis.id;
      return this.getChassisList()
         .then(chassisList => chassisList.find(
            chassis1 => (chassis1.name === newName && currentId !== chassis1.id)));
   }

   // Add a new chassis
   private post(chassis: Chassis): Promise<Response> {
      if (!this.gs.useLiveData()) {
         // generate a mock id for the new chassis
         chassis.id = chassisIdConstant + this.chassisCount++;
      }
      const jsonStr = JSON.stringify(chassis);

      if (this.gs.useLiveData()) {
         const url = this.webContextPath + "/rest/actions.html?actionUid=__packageName__.createChassis";
         this.webPlatform.callActionsController(url, jsonStr);
         return this.getDummyResponsePromise();
      }

      // ---- Dev mode ----
      // First check for dup name in memory, since the post request won"t return any error in this mode
      return this.checkDuplicateName(chassis).then<Response | void>(dupChassis => {
         if (dupChassis) {
            return Promise.reject(chassis.name + " already exists!");
         }
         return this.http
            .post(this.inMemoryChassisUrl, jsonStr)
            .toPromise()
            .catch(error => this.errorHandler.httpPromiseError(error));
      });
   }

   // Update an existing chassis
   private put(chassis: Chassis): Promise<Response> {
      const jsonStr = JSON.stringify(chassis);
      console.log("put Chassis = " + jsonStr);

      if (this.gs.useLiveData()) {
         const url = this.webContextPath + "/rest/actions.html?actionUid=__packageName__.editChassis";
         this.webPlatform.callActionsController(url, jsonStr);
         return this.getDummyResponsePromise();
      }

      // ---- Standalone mode ----
      // First check for dup name in memory, since the post request won't return any error in this mode
      return this.checkDuplicateName(chassis).then<Response | void>(dupChassis => {
         if (dupChassis) {
            return Promise.reject(chassis.name + " already exists!");
         }
         // Encode url
         const url = `${this.inMemoryChassisUrl}/${chassis.id}`;

         return this.http
            .put(url, jsonStr)
            .toPromise()
            .catch(error => this.errorHandler.httpPromiseError(error));
      });
   }

   private getDummyResponsePromise(): Promise<Response> {
      const resp = new Response(new ResponseOptions({status: 200, body: {data: []}}));
      return Promise.resolve(resp);
   }
}
