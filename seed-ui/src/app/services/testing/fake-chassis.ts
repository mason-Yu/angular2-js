/**
 * Fake chassis data used for standalone mode and for unit testing
 *
 * chassisList is an array of <chassisCount> objects like:
 * {
 *    id: "urn:cr:samples:Chassis:server1%252Fchassis-1",
 *    name: "Chassis 1",
 *    dimensions: "20in x 30in x 17in",
 *    serverType: "Server_Type 0"
 * }
 *
 * [removable-chassis-code]
 */

export const initialChassisCount = 30;

export const chassisIdConstant = "urn:cr:samples:Chassis:server1%252Fchassis-";

export const chassisList = new Array(initialChassisCount)
      .fill(undefined).map((val, index) => {
   return {
      id: chassisIdConstant + index,
      name: "mock-Chassis " + (index + 1),
      dimensions: "20in x 30in x 17in",
      serverType: "Server Type " + (index % 3)
   };
});


