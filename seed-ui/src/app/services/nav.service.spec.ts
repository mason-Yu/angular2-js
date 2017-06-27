// External imports
import { inject, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";

// Internal imports
import { NavService, ObjectViewType }     from "./index";
import { Globals, GlobalsService, APP_CONFIG } from "../shared/index";
import { globalStub, RouterStub } from "../testing/index";
import { userSettingServiceStub } from "../testing/service-stubs";
import { UserSettingService } from "../shared/user-settings.service";


// ---------- Testing stubs ------------


// ----------- Testing vars ------------

let globalsService: GlobalsService;
let navService: NavService;

// -------------- Tests ----------------

describe("NavService", () => {

   beforeEach(() => {
      TestBed.configureTestingModule({
         // Use real NavService and GlobalsService, others are stubs
         providers: [
            NavService, GlobalsService,
            { provide: Globals, useValue: globalStub },
            { provide: Router, useClass: RouterStub },
            { provide: UserSettingService, useValue: userSettingServiceStub }
         ]
      });
      navService = TestBed.get(NavService);
      globalsService = TestBed.get(GlobalsService);
   });

   describe("when pluginMode is false", () => {
      beforeEach(() => {
         spyOn(globalsService, "isPluginMode").and.returnValue(false);
      });

      it("routes to /monitor for showObjectView", inject([Router], (router: Router) => {

         const spy = spyOn(router, "navigate");
         const id = "some-id";
         navService.showObjectView(id, "host", ObjectViewType.monitor);

         // Get arguments for router.navigate()
         const navArgs = spy.calls.first().args[0];
         expect(navArgs[0]).toBe("/monitor");
         expect(navArgs[1]).toBe(id);

      }));
   });

   describe("when pluginMode is true", () => {
      beforeEach(() => {
         spyOn(globalsService, "isPluginMode").and.returnValue(true);
      });

      it("calls sendNavigationRequest for showObjectView", () => {

         const spy = spyOn(globalsService.getWebPlatform(), "sendNavigationRequest");
         const id = "some-id";
         navService.showObjectView(id, "host", ObjectViewType.monitor);

         const navArgs = spy.calls.first().args;
         expect(navArgs[0]).toBe(APP_CONFIG.packageName + ".host.monitorView");
         expect(navArgs[1]).toBe(id);

      });
   });
});
