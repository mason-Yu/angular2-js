import { Injectable } from "@angular/core";
import { Response, URLSearchParams } from "@angular/http";
import { GlobalsService }     from "../../shared/index";
import { AppErrorHandler } from "../../shared/appErrorHandler";

import { Observable } from "rxjs/Rx";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { APP_CONFIG } from "../../shared/app-config";
import { HttpRequestService } from "../../shared/http-request.service";

@Injectable()
export class USerLoginService {
   constructor(private httpRequestService: HttpRequestService,
               private errorHandler: AppErrorHandler,
               private gs: GlobalsService) {
   }

   /**
    * Send a message to be userLogin by a backend service
    * @param userInfo
    * @returns an Observable with the UserInfo response
    *
    */
   login(userName: string, password: string): Observable<string> {
       const url = "/login/";
       const fullUrl = this.httpRequestService.getFullURL(url + userName + "/" + password);
       const options = this.httpRequestService.buildRequestOptions();
       return this.httpRequestService.GET(fullUrl, options);
   }


}
