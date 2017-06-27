import { NgModule }           from '@angular/core';

import { ClientidComponent }     from '../../shared/dev/clientid.component';
import { SettingsComponent }     from './settings.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { SharedModule }          from "../../shared/shared.module";

/**
 * Settings is an example of lazy loaded module, i.e. the code will be loaded only
 * when the router takes you to that module.
 */
@NgModule({
   imports:      [ SettingsRoutingModule, SharedModule ],
   declarations: [ SettingsComponent, ClientidComponent ],
   providers:    [ ]
})
export class SettingsModule { }
