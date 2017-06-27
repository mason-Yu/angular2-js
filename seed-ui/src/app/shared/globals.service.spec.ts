// External imports
import { TestBed } from "@angular/core/testing";

// Internal imports
import { Globals, GlobalsService } from "./globals.service";
import { initGlobalService, globalStub } from "../testing/index";
import { userSettingServiceStub } from "../testing/service-stubs";
import { UserSettingService } from "./user-settings.service";

// ---------- Testing stubs ------------

// ----------- Testing vars ------------

let globalsService: GlobalsService;

// -------------- Tests ----------------

describe("Globals tests", () => {
   let globals: Globals;

   describe("when WEB_PLATFORM is defined", () => {
      beforeEach(() => {
         window.parent["WEB_PLATFORM"] = globalStub.webPlatform;
         globals = new Globals();
      });

      it("initializes globals.webPlatform to WEB_PLATFORM", () => {
         expect(globals.webPlatform).toBe(globalStub.webPlatform);
      });
   });

   describe("when WEB_PLATFORM is not defined", () => {
      beforeEach(() => {
         window.parent["WEB_PLATFORM"] = undefined;
         globals = new Globals();
      });

      it("initializes globals.webPlatform for Flex Client 6.0", () => {
         expect(globals.webPlatform.getClientType()).toBe("flex");
         expect(globals.webPlatform.getClientVersion()).toBe("6.0");
         expect(globals.webPlatform.getRootPath()).toBe("/vsphere-client");
      });
   });
});

describe("GlobalsService tests", () => {

   beforeEach(() => {
      TestBed.configureTestingModule({
         imports: [ ],
         providers: [ GlobalsService,
            { provide: Globals, useValue: globalStub },
            { provide: UserSettingService, useValue: userSettingServiceStub }
         ]
      });
   });
   describe("when pluginMode is true", () => {
      beforeEach(() => {
         globalsService = initGlobalService(true);
      });

      it ("has sideNav false and cannot change it", ()  => {
         expect(globalsService.showSidenav()).not.toBeTruthy();
         globalsService.toggleSidenav();
         expect(globalsService.showSidenav()).not.toBeTruthy();
      });

      it ("has liveData true and cannot change it", ()  => {
         expect(globalsService.useLiveData()).toBeTruthy();
         globalsService.toggleLiveData();
         expect(globalsService.useLiveData()).toBeTruthy();
      });

      it ("returns the current WEB_PLATFORM object", ()  => {
         expect(globalsService.getWebPlatform()).toEqual(globalStub.webPlatform);
      });

      it ("returns empty http headers", ()  => {
         expect(globalsService.getHttpHeaders()).toEqual({});
      });
   });

   describe("when pluginMode is false", () => {
      beforeEach(() => {
         globalsService = initGlobalService(false);
         spyOn(globalsService, "getClientId").and.returnValue("someClientId");
      });

      it ("starts with sideNav true and can change it", ()  => {
         expect(globalsService.showSidenav()).toBeTruthy();
         globalsService.toggleSidenav();
         expect(globalsService.showSidenav()).not.toBeTruthy();
      });

      it ("starts with liveData false and can change it", ()  => {
         expect(globalsService.useLiveData()).not.toBeTruthy();
         globalsService.toggleLiveData();
         expect(globalsService.useLiveData()).toBeTruthy();
      });

      it ("returns http headers for liveData", ()  => {
         spyOn(globalsService, "useLiveData").and.returnValue(true);
         const headers = globalsService.getHttpHeaders().headers;
         expect(headers.get("webClientSessionId")).toEqual("someClientId");
      });
   });
});
