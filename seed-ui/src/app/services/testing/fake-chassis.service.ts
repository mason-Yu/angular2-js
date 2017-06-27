import { Chassis, ChassisServiceBase } from "../chassis/index";
import { chassisList }       from "./fake-chassis";

// [removable-chassis-code]

// Export fakeChassisData to use it inside tests
export const fakeChassisData: Chassis[] = chassisList.map(item => {
   const chassis = new Chassis();
   chassis.id = item.id;
   chassis.name = item.name;
   chassis.dimensions = item.dimensions;
   chassis.serverType = item.serverType;
   return chassis;
});

export class FakeChassisService implements ChassisServiceBase {

   getChassisList(): Promise<Chassis[]> {
      return Promise.resolve<Chassis[]>(fakeChassisData);
   }

   getChassis(objectId: string): Promise<Chassis> {
      const chassis = fakeChassisData.find(elt => elt.id === objectId);
      return Promise.resolve<Chassis>(chassis);
   }

   save(chassis: Chassis): Promise<any> {
      return null;
   }

   delete(chassis: Chassis): Promise<any> {
      return null;
   }
}
