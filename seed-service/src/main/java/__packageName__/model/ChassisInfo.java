package __packageName__.model;

/**
 * Data model used to create a chassis.
 * This maps to the JS object in chassis-html in order to send chassis data.
 */
public class ChassisInfo {
   public String name;
   public String serverType;
   public String dimensions;

   public ChassisInfo() {
      // An empty constructor is required for the AMF serialization to work.
   }

   public ChassisInfo(String[] data) {
      name = data[0];
      serverType = data[1];
      dimensions = data[2];
   }
}
