package __packageName__.services;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import __packageName__.ModelObjectUriResolver;
import __packageName__.model.Chassis;
import __packageName__.model.ChassisInfo;
import __packageName__.model.ModelObject;

/**
 * Simplified data store for the Chassis objects, and related utilities.
 *
 * ***************************************************************************** *
 * IMPORTANT: this implementation uses in-memory data to keep the setup easy,    *
 * a real implementation should retrieve data from a remote server or database   *
 * and have very minimal or no storing/caching in the java layer because the     *
 * server must remain stateless and be able to scale out.                        *
 * ***************************************************************************** *
 *
 * Note that this class is thread-safe but doesn't deal with complex operations
 * or large data sets. It is not intended to be used as-is!
 */
public class ObjectStore {

   // You can increase CHASSIS_COUNT to test paging/sorting
   private static final int CHASSIS_COUNT = 20;

   // The custom object types
   private static final String CHASSIS_TYPE = ChassisDataAdapter.CHASSIS_TYPE;

   // Map of chassis objects used in the sample.
   // The key is the object's uid and the value the Chassis instance.
   private final Map<String, Chassis> _chassisMap =
         new HashMap<String, Chassis>(CHASSIS_COUNT);

   // Internal index used to create unique ids
   private static int _index = 0;

   // Resolver for URIs of resource objects.
   private final ModelObjectUriResolver _uriResolver;

   /**
    * Helper method to enforce name uniqueness.
    *
    * @param map  The object map passed in a thread-safe manner.
    * @param name The name to check
    * @return true if the given chassis name is already taken.
    */
   private static boolean mapContainsName(Map<String, Chassis> map, String name) {
      Iterator<String> i = map.keySet().iterator();
      while(i.hasNext()) {
         String uid = i.next();
         Chassis chassis = map.get(uid);
         if (name.equals(chassis.getName())) {
            return true;
         }
      }
      return false;
   }

   /**
    * Constructor.
    *
    * @param uriResolver
    *    Custom type resolver for ModelObject resources used in this sample
    *
    */
   public ObjectStore(ModelObjectUriResolver uriResolver) {
      _uriResolver = uriResolver;
   }

   /**
    * Initializes the local object store with Chassis objects.
    * This bean init method is defined in bundle-context.xml.
    *
    * Note:  This initialization done during bean creation must not be time-consuming.
    *  A real implementation will need some info to access its back-end. It can be stored
    *  in a properties file, or fetched from the plugin's vCenter extension meta data,
    *  or else some configuration will be required in the UI.
    */
   public void init() {

      Chassis[] allChassis = new Chassis[CHASSIS_COUNT];
      for (int i = 0; i < CHASSIS_COUNT; i++) {
         String[] data = {"Chassis "+(i+1), "Server_Type "+ (i%3), "20in x 30in x 17in"};

         allChassis[i] = createChassis(new ChassisInfo(data), false);
      }
   }

   /**
    * Bean destroy method defined in bundle-context.xml.
    */
   public void destroy() {
      // nothing to clean-up in this sample.
   }

   /**
    * Get the current chassis objects in a thread-safe manner which allows the caller
    * to iterate through the list. Making a copy and exposing ObjectStore internals is
    * OK for this small example. A real implementation should provide a thread-safe
    * way of iterating through objects stored in a back-end server, without caching
    * them in memory.
    *
    * @return a copy of the current map of chassis.
    */
   Map<String, ModelObject> getAllChassis() {
      synchronized(_chassisMap) {
         return new HashMap<String, ModelObject>(_chassisMap) ;
      }
   }

   /**
    * Access a Chassis object.
    *
    * @param uri the object URI
    * @return the ModelObject or null if none was found.
    */
   ModelObject getModelObject(URI uri) {
      String type = _uriResolver.getResourceType(uri);
      String uid = _uriResolver.getUid(uri);

      if (CHASSIS_TYPE.equals(type)) {
         return getChassis(uid);
      }
      return null;
   }

   /**
    * Access a Chassis from the internal object store.
    *
    * @param uid  Unique identifier.
    * @return the Chassis object for the given uid, or null.
    */
   Chassis getChassis(String uid) {
      synchronized(_chassisMap) {
         return _chassisMap.get(uid);
      }
   }

   /**
    * Remove a Chassis from the internal object store.
    *
    * @param uid  Unique identifier.
    * @return the Chassis object that was removed, or null if no object was found for that uid.
    */
   Chassis removeChassis(String uid) {
      synchronized(_chassisMap) {
         Chassis chassis = _chassisMap.remove(uid);
         return chassis;
      }
   }

   /**
    * Add a new Chassis to the object store
    *
    * @param chassisInfo
    *          The data used to create the chassis.
    * @param checkName
    *          true if the name should be checked first, to ensure unique names.
    * @return
    *          The new Chassis object, or null if the name is already taken.
    */
   Chassis createChassis(ChassisInfo chassisInfo, boolean checkName) {
      synchronized(_chassisMap) {
         // Enforce unique names
         if (checkName && mapContainsName(_chassisMap, chassisInfo.name)) {
            return null;
         }

         // Resource id that would normally be supplied by the back-end.
         String id = _uriResolver.createResourceId("server1", "chassis-"+(_index++));

         Chassis chassis = new Chassis(chassisInfo, id);

         // Add chassis to object store. Use the uid as key instead of resource id for
         // convenience. Real implementation would store object in separate back-end.
         URI chassisRef = chassis.getUri(_uriResolver);
         String uid = _uriResolver.getUid(chassisRef);
         _chassisMap.put(uid, chassis);

         return chassis;
      }
   }

   /**
    * Replace an existing chassis entry with a new one sharing
    * the same uid.
    *
    * @param uid The chassis unique identifier.
    * @param newChassisInfo The data about the new chassis.
    * @return true if success, false if the uid didn't exist anymore
    */
   boolean replaceChassis(String uid, ChassisInfo newChassisInfo) {
      synchronized(_chassisMap) {
         if (!_chassisMap.containsKey(uid)) {
            return false;
         }

         Chassis oldChassis = _chassisMap.get(uid);
         String chassisId = oldChassis.getId();

         // Create a new chassis re-using the same resource id, so the uid is also the same
         Chassis newChassis = new Chassis(newChassisInfo, chassisId);
         assert(uid.equals(_uriResolver.getUid(newChassis.getUri(_uriResolver))));

         _chassisMap.put(uid, newChassis);

         return true;
      }
   }

   public List<Object> getObjectsByPropertyValue(
            String targetType, String property, String comparableValue) {
      List<Object> objectList = new ArrayList<Object>();

      if (CHASSIS_TYPE.equals(targetType)) {
         synchronized (_chassisMap) {
            for (Chassis chassis : _chassisMap.values()) {
               Object propertyValue = chassis.getProperty(property);
               if (!(propertyValue instanceof String)) {
                  continue;
               }
               String lowerCaseVal = ((String) propertyValue).toLowerCase();
               if (lowerCaseVal.indexOf(comparableValue) >= 0) {
                  objectList.add(chassis);
               }
            }
         }
      }
      return objectList;
   }

}
