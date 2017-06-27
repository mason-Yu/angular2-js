
import { Component } from "@angular/core";
import { GlobalsService } from "../../shared/globals.service";

/**
 * Generic component to fill in non-implemented-yet views
 */
@Component({
   selector: "not-implemented-yet",
   templateUrl: "./nyi.component.html",
})
export class NYIComponent  {
   constructor(public gs: GlobalsService) {
   }
}
