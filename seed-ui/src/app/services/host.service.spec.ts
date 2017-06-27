// External imports
import { TestBed } from "@angular/core/testing";
import { HttpModule, Http, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { Router }      from "@angular/router";
import { Observable } from "rxjs/Observable";
import { MockBackend } from "@angular/http/testing";


// Internal imports
import { Host, HostService }     from "./index";
import { Globals, GlobalsService, AppAlertService } from "../shared/index";
import { AppErrorHandler } from "../shared/appErrorHandler";
import { globalStub, appErrorHandlerStub } from "../testing/index";
import { APP_CONFIG } from "../shared/app-config";
import { UserSettingService } from "../shared/user-settings.service";
import { userSettingServiceStub } from "../testing/service-stubs";

// ---------- Testing stubs ------------

const routerStub = {};

// ----------- Testing vars ------------

let hostService: HostService;
let globalsService: GlobalsService;
let http: Http;
let httpSpy: any;
let obs: Observable<Response>;
let resp: Response;


// -------------- Tests ----------------

describe("HostService tests", () => {
   beforeEach(() => {
      TestBed.configureTestingModule({
         imports: [ HttpModule ],
         providers: [ HostService, GlobalsService, AppAlertService,
            { provide: AppErrorHandler, useValue: appErrorHandlerStub },
            { provide: Globals, useValue: globalStub },
            { provide: Router, useValue: routerStub },
            { provide: UserSettingService, useValue: userSettingServiceStub },
            { provide: XHRBackend, useClass: MockBackend }
         ]
      });
      http = TestBed.get(Http);
      globalsService = TestBed.get(GlobalsService);
      hostService = TestBed.get(HostService);

      // Create an Observable returning a dummy response so that we can spy on http.get
      resp = new Response(new ResponseOptions({ status: 200, body: { data: [] } }));
      obs = Observable.create(function (observer) {
         observer.next(resp);
         observer.complete();
      });
      httpSpy = spyOn(http, "get").and.returnValue(obs);
   });

   describe("when useLiveData is true", () => {
      beforeEach(() => {
         spyOn(globalsService, "useLiveData").and.returnValue(true);
      });

      it ("makes the right http call for getHosts", ()  => {
         hostService.getHosts();

         const httpArgs = httpSpy.calls.first().args;
         expect(httpArgs[0]).toBe(globalsService.getWebContextPath() +
               "/rest/data/list/?targetType=HostSystem&properties=name");
      });

      it ("makes the right http call for getHostProperties", ()  => {
         const hostId = "host-id";
         const properties = ["prop1", "prop2"];

         hostService.getHostProperties(hostId, properties);

         const httpArgs = httpSpy.calls.first().args;
         expect(httpArgs[0]).toBe(globalsService.getWebContextPath() +
               "/rest/data/properties/" + hostId + "?properties=" + properties);
      });
   });

   describe("when useLiveData is false", () => {
      let mockDataUrl: string;
      beforeEach(() => {
         spyOn(globalsService, "useLiveData").and.returnValue(false);
         mockDataUrl = APP_CONFIG.getMockDataUrl(globalsService.isPluginMode());
      });

      it ("makes the right http call for getHosts", ()  => {
         hostService.getHosts();

         const httpArgs = httpSpy.calls.first().args;
         expect(httpArgs[0]).toBe(mockDataUrl + "/hosts");
      });

      it ("makes the right http call for getHostProperties", ()  => {
         const hostId = "host-id";
         const properties = ["prop1", "prop2"];

         hostService.getHostProperties(hostId, properties);

         const httpArgs = httpSpy.calls.first().args;
         expect(httpArgs[0]).toBe(mockDataUrl + "/hosts/" + hostId);
      });
   });
});

