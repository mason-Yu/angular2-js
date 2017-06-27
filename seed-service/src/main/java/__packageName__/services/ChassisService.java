/** Copyright 2016 VMware, Inc. All rights reserved. -- VMware Confidential */

package __packageName__.services;

import java.net.URI;

import __packageName__.model.ChassisInfo;

/**
 * Interface to perform operations on the Chassis object.
 */
public interface ChassisService {
   /**
    * Creates a new chassis with the given chassisInfo values.
    *
    * @param chassisInfo
    *    Chassis data used to create new Chassis.
    *
    * @return
    *    Returns the URI reference of the newly created Chassis,
    *    or null if the creation failed because the name was already taken.
    */
   URI createChassis(ChassisInfo chassisInfo);

   /**
    * Update a chassis object with given chassisInfo data.
    *
    * @param chassisRef Chassis reference.
    *
    * @param newInfo
    *    Chassis data for the update.
    *
    * @return true if the Chassis was updated successfully.
    */
   boolean updateChassis(URI chassisRef, ChassisInfo newInfo);

   /**
    * Delete the given chassis object.
    *
    * @param chassisRef  Chassis reference.
    * @return true if the chassis was deleted successfully.
    */
   boolean deleteChassis(URI chassisRef);

}
