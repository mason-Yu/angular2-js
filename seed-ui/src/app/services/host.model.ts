// A simple Host object model
export class Host {
   id: string;
   name: string;
   status: string;
   model: string;
   vmCount: number;

   constructor(clone: Host = null) {
      this.id = clone ? clone.id : "";
      this.name = clone ? clone.name : "";
      this.status = clone ? clone.status : "";
      this.model = clone ? clone.model : "";
      this.vmCount = clone ? clone.vmCount : 0;
   }

   /**
    * Conversion between the vSphere property names and our model
    * @param hostData
    * @returns {Host}
    */
   static convertProperties(hostData: any): Host {
      const host = new Host();
      host.id = hostData.id;
      host.name = hostData.name;
      host.status = hostData["overallStatus"];
      host.model = hostData["hardware.systemInfo.model"];
      host.vmCount = hostData.vm ? hostData.vm.length : 0;
      return host;
   }
}
