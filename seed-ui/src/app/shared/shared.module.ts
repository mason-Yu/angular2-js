import { NgModule }     from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule }   from "@angular/forms";


import { AppAlertComponent, AppHeaderComponent }   from "./index";
import { ClarityModule } from "clarity-angular";
import { SidenavComponent } from "./dev/sidenav.component";
import { SubnavComponent } from "./dev/subnav.component";

/**
 * Module for shared UI components
 *
 * IMPORTANT: Do not specify app-wide singleton providers in this shared module. Because
 * a lazy loaded module that imports this shared module will make its own copy of the service.
 * See doc at https://angular.io/docs/ts/latest/guide/ngmodule.html#!#shared-module
 */
@NgModule({
   imports:     [ CommonModule, ClarityModule, FormsModule ],
   declarations: [ AppAlertComponent, AppHeaderComponent,
                  SidenavComponent, SubnavComponent ],
   providers:   [  ],
   exports:     [ AppAlertComponent, AppHeaderComponent,
                  CommonModule, ClarityModule, FormsModule,
                  SidenavComponent, SubnavComponent ]
})
export class SharedModule { }
