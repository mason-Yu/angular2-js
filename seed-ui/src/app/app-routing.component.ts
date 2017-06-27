import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Location }     from "@angular/common";
import { Subscription  } from "rxjs/Subscription";

import { GlobalsService }     from "./shared/index";

// AppRouting component below is specifically to handle the plugin mode where the document URL is
// .../index.html?view=<name>&objectId=<id> and translate this into router.navigate calls

@Component({
   templateUrl: "./app.component.html"
})
export class AppRoutingComponent implements OnInit, OnDestroy {
   private subscription: Subscription;

   constructor(public gs: GlobalsService,
               private router: Router,
               private location: Location,
               private route: ActivatedRoute) {
   }

   ngOnInit(): void {
      const path = this.location.path();
      console.log("app.component path = " + path);

      const FORWARD_SLASH_ENCODED2 = "%252F";
      const FORWARD_SLASH_ENCODED = /%2F/g;

      // Extract query parameters and navigate to view
      this.subscription = this.route.queryParams.subscribe(
         (param: any) => {
            const view = param["view"];
            let objectId = param["objectId"];
            const actionUid = param["actionUid"];
            let targets = param["targets"];
            const locale = param["locale"];
            const params = {};

            if (!view) {
               console.error("Missing view parameter! path = " + path);
               return;
            }
            if (objectId) {
               // Standard view URL
               objectId = objectId.replace(FORWARD_SLASH_ENCODED, FORWARD_SLASH_ENCODED2);
            }
            if (actionUid) {
               // Action URL's targets contains the objectId or null for a global action
               params["actionUid"] = actionUid;
               if (targets) {
                  if (targets.indexOf(",") >= 0) {
                     console.error("Multiple objects not supported in actions!  Will use the 1st id in: " + targets);
                     targets = targets.substring(0, targets.indexOf(","));
                  }
                  objectId = targets.replace(FORWARD_SLASH_ENCODED, FORWARD_SLASH_ENCODED2);
               } else if (!objectId || objectId === "null") {
                  objectId = "undefined";
               }
            }
            if (locale) {
               this.gs.locale = locale;
            }
            const commands: [any] = ["/" + view];
            if (objectId) {
               commands[1] = objectId;
            }
            if (actionUid) {
               commands[2] = actionUid;
            }

            this.router.navigate(commands, { replaceUrl : true });
         });
   }

   ngOnDestroy(): void {
      this.subscription.unsubscribe();
   }
}
