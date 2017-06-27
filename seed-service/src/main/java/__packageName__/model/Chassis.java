/** Copyright 2016 VMware, Inc. All rights reserved. -- VMware Confidential */

package __packageName__.model;

import __packageName__.model.ChassisInfo;
import com.vmware.vise.data.query.ObjectReferenceService;

/**
 * Chassis infrastructure for housing multiple servers.
 *
 * NOTES:
 * - Chassis objects are immutable and de-facto thread safe.
 * - Real implementations should use immutable Java DTOs populated by the back-end.
 * - It is important to understand the difference between the Chassis object and
 *    its URI reference used to represent the object in the UI.
 */
public class Chassis extends ModelObject {

   // Object property names, must match the names used in the client's requests
   private static final String CHASSIS_NAME = "name";
   private static final String CHASSIS_SERVER_TYPE = "serverType";
   private static final String CHASSIS_DIMENSIONS = "dimensions";

   // Chassis properties
   private final String _name;
   private final String _dimensions;
   private final String _serverType;


   /**
    * Constructor.
    *
    * @param chassisInfo   Chassis data.
    * @param id            Resource id.
    */
   public Chassis(ChassisInfo chassisInfo, String id) {
      this.setId(id);
      this._name = chassisInfo.name;
      this._dimensions = chassisInfo.dimensions;
      this._serverType = chassisInfo.serverType;
   }

   /**
    * Name of the object.
    */
   public String getName() {
      return _name;
   }

   /**
    * Free form string representing the chassis dimensions
    */
   public String getDimensions() {
      return _dimensions;
   }

   /**
    * Free form string representing the type of server hosted by this chassis.
    */
   public String getServerType() {
      return _serverType;
   }

   @Override
   public Object getProperty(String property) {
      if ("name".equals(property)) {
         return getName();
      } else if ("serverType".equals(property)) {
         return getServerType();
      } else if ("dimensions".equals(property)) {
         return getDimensions();
      }
      return UNSUPPORTED_PROPERTY;
   }

   // Override equals and hashCode to be able to compare chassis in lists

   /* (non-Javadoc)
    * @see java.lang.Object#equals(java.lang.Object)
    */
   @Override
   public boolean equals(Object o) {
      if (o == null || !(o instanceof Chassis)) {
         return false;
      }
      return getId().equals(((Chassis)o).getId());
   }

   /* (non-Javadoc)
    * @see java.lang.Object#hashCode()
    */
   @Override
   public int hashCode() {
      return getId().hashCode();
   }

}
