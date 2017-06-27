import { Chassis } from "./chassis.model";
import { fakeChassisData }   from "../testing/fake-chassis.service";


// ----------- Testing vars ------------

const chassis0 = fakeChassisData[0];


// ----------- Tests ------------

describe("Chassis", () => {
   it("has id, name, dimensions, serverType", () => {
      const chassis = new Chassis(chassis0);
      expect(chassis.id).toBe(chassis0.id);
      expect(chassis.name).toBe(chassis0.name);
      expect(chassis.dimensions).toBe(chassis0.dimensions);
      expect(chassis.serverType).toBe(chassis0.serverType);
   });

   it("can clone itself", () => {
      const chassis = new Chassis(chassis0);
      const clone = chassis.clone();
      expect(chassis).toEqual(clone);
   });

   it("equals another chassis with same properties", () => {
      const chassis1 = new Chassis(chassis0);
      chassis1.id = "id1";
      const chassis2 = new Chassis(chassis0);
      chassis2.id = "id2";
      expect(chassis1.equals(chassis2)).toBeTruthy();
   });

});
