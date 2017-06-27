import { Injectable }  from "@angular/core";
import { Router }      from "@angular/router";
import { APP_CONFIG } from "../shared/app-config";
import { GlobalsService }  from "../shared/index";
import { extensionToRoutes } from "../app-routing.module";

export enum ObjectViewType {
   summary,
   monitor,
   manage
}

/**
 * Navigation service for jumping to another view
 */
@Injectable()
export class NavService {
   // Keep track of the selected view type.
   // Default value used the first time an object is selected.
   viewType: ObjectViewType = ObjectViewType.monitor;

   private navigate(extensionId: string, objectId: string = null): void {
      if (this.gs.isPluginMode()) {
         this.gs.getWebPlatform().sendNavigationRequest(extensionId, objectId);
      } else if (objectId) {
         this.router.navigate([extensionToRoutes[extensionId], objectId]);
      } else {
         this.router.navigate([extensionToRoutes[extensionId]]);
      }
   }

   constructor(private gs: GlobalsService,
               private router: Router) {
   }

   // public edit(id: string): void {
   //    this.router.navigate(["/editor", id]);
   // }

   showMainView(): void {
      this.navigate(APP_CONFIG.packageName + ".mainView");
   }

   showSettingsView(): void {
      this.navigate(APP_CONFIG.packageName + ".settingsView");
   }

   /**
    * Navigate to the view of giving type for given object id
    * @param id
    * @param objectType 'host' or 'chassis' in this sample, used to generate the view extension id
    * @param viewType (optional) an ObjectViewType enum, or the corresponding name.
    *             or re-use the current view type if no type is given.
    */
   showObjectView(id: string, objectType: string, viewType: ObjectViewType | string = this.viewType): void {
      this.setViewType(viewType);

      // The view extension name ends with .host.summaryView, .host.manageView, .host.monitorView
      const viewExtension = APP_CONFIG.packageName + "." + objectType + "." + this.getViewType() + "View";
      this.navigate(viewExtension, id);
   }

   /**
    * Keep track of the selected view type, i.e. summary, monitor or manage
    * @param type an ObjectViewType enum, or the corresponding name
    */
   setViewType(type: ObjectViewType | string): void {
      if (typeof type === "string") {
         if (typeof ObjectViewType[type] === "undefined") {
            throw new Error("Invalid view type: " + type);
         }
         this.viewType = ObjectViewType[type];
      } else {
         this.viewType = type;
      }
   }

   /**
    * @returns the name of the current view type
    */
   getViewType(): string {
      return ObjectViewType[this.viewType];
   }
}
