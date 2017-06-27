import { NgModule }            from '@angular/core';
import { RouterModule, Routes }        from '@angular/router';

import { SettingsComponent }    from './settings.component';

/**
 * Routing for the lazy loaded settings module.
 * (There is only one view to go to under this simple component)
 */
const routes: Routes = [
   { path: '', component: SettingsComponent }
];

@NgModule({
   imports: [ RouterModule.forChild(routes) ],
   exports: [ RouterModule ]
})
export class SettingsRoutingModule {}
