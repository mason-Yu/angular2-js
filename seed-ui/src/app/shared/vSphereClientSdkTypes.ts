/**
 * Interface with the vSphere Client SDK 6.5 Javascript APIs
 * Although not required we recommend to use this interface along with globals.services.ts
 * to take advantage of compiler type checking and code completion in your IDE
 */
export interface WebPlatform {
   callActionsController(url: string, jsonData: string, targets?: string): void;
   closeDialog(): void;
   getClientType(): string;
   getClientVersion(): string;
   getString(bundleName: string, key: string, params: any): string;
   getRootPath(): string;
   getUserSession(): UserSession;
   openModalDialog(title, url, width, height, objectId): void;
   sendModelChangeEvent(objectId, opType): void;
   sendNavigationRequest(targetViewId, objectId): void;
   setDialogSize(width, height): void;
   setDialogTitle(title): void;
   setGlobalRefreshHandler(callback, document): void;
}

export class UserSession {
   userName: string;
   clientId: string;
   locale: string;
   serversInfo: ServerInfo[];
}

export class ServerInfo {
   serviceGuid: string;
   serviceUrl: string;
   sessionId: string;
}
