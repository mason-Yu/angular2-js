// External imports
import { TestBed } from "@angular/core/testing";
import { HttpModule, Http, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { MockBackend } from "@angular/http/testing";

// Internal imports
import { EchoService }     from "./index";
import { Globals, GlobalsService } from "../shared/index";
import { globalStub, appErrorHandlerStub } from "../testing/index";
import { AppErrorHandler } from "../shared/appErrorHandler";
import { APP_CONFIG } from "../shared/app-config";
import { UserSettingService } from "../shared/user-settings.service";
import { userSettingServiceStub } from "../testing/service-stubs";


// ---------- Testing stubs ------------

// ----------- Testing vars ------------

let echoService: EchoService;
let globalsService: GlobalsService;
let http: Http;
let httpSpy: any;
let obs: Observable<Response>;
let resp: Response;

// -------------- Tests ----------------
describe("EchoService tests", () => {

   beforeEach(() => {
      TestBed.configureTestingModule({
         imports: [ HttpModule ],
         providers: [ EchoService, GlobalsService,
            { provide: Globals, useValue: globalStub },
            { provide: AppErrorHandler, useValue: appErrorHandlerStub },
            { provide: UserSettingService, useValue: userSettingServiceStub },
            { provide: XHRBackend, useClass: MockBackend }
         ]
      });
      http = TestBed.get(Http);
      echoService = TestBed.get(EchoService);
      globalsService = TestBed.get(GlobalsService);

      // Create an Observable returning a dummy response so that we can spy on http.get
      resp = new Response(new ResponseOptions({ status: 200, body: { data: [] } }));
      obs = Observable.create(function (observer) {
         observer.next(resp);
         observer.complete();
      });
      httpSpy = spyOn(http, "post").and.returnValue(obs);
   });

   describe("when useLiveData is true", () => {
      beforeEach(() => {
         spyOn(globalsService, "useLiveData").and.returnValue(true);
      });

      it ("makes the right http call for sendEcho", ()  => {
         echoService.sendEcho("foo");

         const httpArgs = httpSpy.calls.first().args;
         expect(httpArgs[0]).toBe(globalsService.getWebContextPath() + "/rest/services/echo");
         expect(httpArgs[1].get("message")).toBe("foo");
      });

      it ("makes the right http call for sendEchoVersions2", ()  => {
         echoService.sendEchoVersion2("foo");

         const httpArgs = httpSpy.calls.first().args;
         expect(httpArgs[0]).toBe(globalsService.getWebContextPath() + "/rest/services/echo");
         expect(httpArgs[1].get("message")).toBe("foo");
      });
   });

   describe("when useLiveData is false", () => {
      beforeEach(() => {
         spyOn(globalsService, "useLiveData").and.returnValue(false);
      });

      it ("makes the right http call for sendEcho", ()  => {
         echoService.sendEcho("foo");
         const echoUrl = APP_CONFIG.getMockDataUrl(globalsService.isPluginMode()) + "/echos";
         const httpArgs = httpSpy.calls.first().args;
         expect(httpArgs[0]).toBe(echoUrl);
         expect(httpArgs[1].get("message")).toBe("foo");
      });
   });

});


