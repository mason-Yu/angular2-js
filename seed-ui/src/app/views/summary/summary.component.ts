import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from "@angular/router";

import { GlobalsService, RefreshService, I18nService }   from "../../shared/index";
import { NavService } from "../../services/index";

/**
 * Summary view component
 *
 * No host data was added to this view to keep it simple.
 * See the MonitorComponent code to load host data, use RefreshService, etc.
 */
@Component({
   selector: 'host-summary',
   styleUrls: ['./summary.component.scss'],
   templateUrl: './summary.component.html'
})
export class SummaryComponent implements OnInit {
   hostId: string;

   constructor(public gs: GlobalsService,
               public i18n: I18nService,
               public nav: NavService,
               private route: ActivatedRoute) {
   }

   ngOnInit() {
      // Initialize the component's host based on the id parameter
      this.route.params.forEach((params: Params) => {
         this.hostId = params["id"];
      });
      this.nav.setViewType('summary');
   }

}
