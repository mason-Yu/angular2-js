import { Component, OnInit, ViewChild } from '@angular/core';

import { GlobalsService, ClientidComponent }   from "../../shared/index";
import { NavService } from "../../services/nav.service";
import { I18nService } from "../../shared/i18n.service";

/**
 * SettingsComponent is a lazy loaded component. It cannot be referenced directly
 * in other parts of the app. It is invoked only through the router.
 */
@Component({
  selector: 'settings-view',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  // Dev only
  @ViewChild(ClientidComponent) clientidComponent: ClientidComponent;

  constructor(public  gs: GlobalsService,
              public  i18n: I18nService,
              public  nav: NavService) {
  }

  ngOnInit() {
  }

}
