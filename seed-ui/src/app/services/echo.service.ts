import { Injectable } from "@angular/core";
import { Http, Response, URLSearchParams } from "@angular/http";
import { GlobalsService }     from "../shared/index";
import { AppErrorHandler } from "../shared/appErrorHandler";

import { Observable } from "rxjs/Rx";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { APP_CONFIG } from "../shared/app-config";

@Injectable()
export class EchoService {
   constructor(private http: Http,
               private errorHandler: AppErrorHandler,
               private gs: GlobalsService) {
   }

   private getEchoUrl(): string {
      return this.gs.useLiveData() ?
            // Live data uses the Java service rest endpoint
            (this.gs.getWebContextPath() + "/rest/services/echo") :
            // Mock data uses the local json-server
            APP_CONFIG.getMockDataUrl(this.gs.isPluginMode()) + "/echos";
   }

   /**
    * Send a message to be echoed by a backend service
    * @param echoMsg
    * @returns an Observable with the echoMsg response
    *
    * @see sendEchoVersion2 which returns a Promise instead of an Observable
    */
   sendEcho(echoMsg: string): Observable<string> {
      const data = new URLSearchParams();
      data.append("message", echoMsg);

      return this.http.post(this.getEchoUrl(), data)
            .map((res: Response) => res.json().message)
            .catch((error: any) => this.errorHandler.httpObservableError(error));
   }

   /**
    * Send a message to be echoed by a backend service (Version 2)
    * @param echoMsg
    * @returns a promise with the echoMsg response
    *
    * @see sendEcho which returns an Observable instead of a Promise
    */
   sendEchoVersion2(echoMsg: string): Promise<string> {
      const data = new URLSearchParams();
      data.append("message", echoMsg);

      return this.http.post(this.getEchoUrl(), data)
            .toPromise()
            .then((res: Response) => res.json().message)
            .catch(error => this.errorHandler.httpPromiseError(error));
   }

}
