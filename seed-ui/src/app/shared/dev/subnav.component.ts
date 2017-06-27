import { Component, OnInit, Input } from '@angular/core';
import { NavService } from "../../services/nav.service";
import { GlobalsService } from "../globals.service";

/**
 * Subnav component with tabs to switch between object views
 */
@Component({
   selector: 'subnav',
   templateUrl: './subnav.component.html',
   styleUrls: ['./subnav.component.scss']
})
export class SubnavComponent implements OnInit {
   // objectId and objectType injected by the parent component
   @Input() objectId;
   @Input() objectType;

   constructor(private gs: GlobalsService,
               public nav: NavService) {
   }

   ngOnInit() {
   }

}
