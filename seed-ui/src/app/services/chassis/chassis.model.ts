/**
 * A simple Chassis model
 */
export class Chassis {
   id: string;
   name: string;
   dimensions: string;
   serverType: string;

   constructor(clone: Chassis = null) {
      this.id = clone ? clone.id : "";
      this.name = clone ? clone.name : "";
      this.dimensions = clone ? clone.dimensions : "";
      this.serverType = clone ? clone.serverType : "";
   }

   // Warning: methods defined below can only be used on chassis objects created explicitly.
   // i.e. they won't exist on chassis objects converted from Json data

   clone(): Chassis {
      return new Chassis(this);
   }

   equals(other: Chassis): boolean {
      return other &&
         (this.name === other.name && this.dimensions === other.dimensions && this.serverType === other.serverType);
   }
}
