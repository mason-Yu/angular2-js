// Angular imports
import { Http, Headers, Response, RequestOptions, URLSearchParams } from "@angular/http";
import { Injectable } from '@angular/core';

// VMware imports
import { APP_CONFIG } from "./app-config";
import { AppErrorHandler } from "./appErrorHandler";
import { GlobalsService } from "./globals.service";

// RXJS Observable imports
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Injectable()
export class HttpRequestService {

    constructor(
        private http: Http,
        private errorHandler: AppErrorHandler,
        private gs: GlobalsService
    ) { }

    /**
     * Get a full REST URL
     * @param baseURL - a basic URL string except the root path
     * @param params - URLSearchParams object
     * @return a URL similar to:
     * https://localhost:9443/ui/vsi/rest/data/types/extensionManager?
     * key=com.emc.vsi.plugin (in live data and plugin mode)
     * http://localhost:3000/rest/data/types/extensionManager (in dev mode)
     */
    public getFullURL(baseURL: string, params?: URLSearchParams): string {
        const url = "http://localhost:8084";
        const paramsUrl = params ? ("/" + params.toString()) : "";

        return url + baseURL + paramsUrl;
    }

    /**
     * https://angular.io/docs/ts/latest/api/http/index/RequestOptions-class.html
     * https://angular.io/docs/ts/latest/api/http/index/Headers-class.html
     * @param headers For now only Headers object, can be expanded for a true RequestOptionsArgs
     * @return RequestOptions
     */
    public buildRequestOptions(headers?: Headers): RequestOptions {
        if (!headers) {
            headers = new Headers();
        }
        headers.append('Content-Type', 'application/json');
        return new RequestOptions({ 'headers': headers });
    }

    /**
     * GET call to retrieve object
     * @param url - a full url string
     * @param options(optional) - a map of request options
     * @return a generic observable array
     */
    public GET<T>(url: string, options?: RequestOptions): Observable<T> {
        return this.http.get(url, options) // Using GET request
               .map(res => this.responseHandler(res))
               .catch(err => this.errorHandler.httpObservableError(err));
    }

    /**
     * POST call to add object
     * @param url - a full url string
     * @param body - js Object
     * @param options(optional) - a map of request options
     * @return a generic observable array
     */
    public POST<T>(url: string, body: Object, options?: RequestOptions): Observable<T> {
        return this.http.post(url, body, options) // Using POST request
               .map(res => this.responseHandler(res))
               .catch(err => this.errorHandler.httpObservableError(err));
    }

    /**
     * PUT call to update object
     * @param url - a full url string
     * @param body - js Object
     * @param options(optional) - a map of request options
     * @return a generic observable array
     */
    public PUT<T>(url: string, body: Object, options?: RequestOptions): Observable<T> {
        return this.http.put(url, body, options) // Using PUT request
               .map(res => this.responseHandler(res))
               .catch(err => this.errorHandler.httpObservableError(err));
    }

    /**
     * DELETE call to remove object
     * @param url - a full url string
     * @param options(optional) - a map of request options
     * @return a generic observable array
     */
    public DELETE<T>(url: string, options?: RequestOptions): Observable<T> {
        return this.http.delete(url, options) // Using DELETE request
               .map(res => this.responseHandler(res))
               .catch(err => this.errorHandler.httpObservableError(err));
    }

    private responseHandler(res: Response) {
        const errorMsg = res.json().errorMsg;
        if (errorMsg != null) {
            // If there is error message in response data,
            // throw an exception for catching it later
            throw errorMsg;
        } else {
            // Calling .json() on the response to return data
            return res.json();
        }
    }
}
