import { Host, HostServiceBase } from "../index";

export const fakeHostData: Host[] = [ ];

export class FakeHostService implements HostServiceBase {
   getHosts(): Promise<Host[]> {
      return Promise.resolve<Host[]>(fakeHostData);
   }
   getHostProperties(id, properties): Promise<Host> {
      return Promise.resolve<Host>(fakeHostData[0]);
   }
}
