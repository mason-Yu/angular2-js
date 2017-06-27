/** Copyright 2012 VMware, Inc. All rights reserved. -- VMware Confidential */

package __packageName__.services;

import __packageName__.ModelObjectUriResolver;
import __packageName__.ResultItemComparator;
import __packageName__.model.ModelObject;
import com.vmware.vise.data.Constraint;
import com.vmware.vise.data.PropertySpec;
import com.vmware.vise.data.ResourceSpec;
import com.vmware.vise.data.query.Comparator;
import com.vmware.vise.data.query.*;
import com.vmware.vise.vim.data.VimObjectReferenceService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.net.URI;
import java.util.*;

/**
 * Adapter making Chassis objects available via DataService (DS).
 *
 * The adapter is exported as an osgi-service in bundle-context-osgi.xml,
 * which leads to its automatic registration with the DataServiceExtensionRegistry.
 */
@SuppressWarnings("unused")
@type("samples:Chassis") // supported object types.
public class ChassisDataAdapter implements DataProviderAdapter {

   private static final Log _logger = LogFactory.getLog(ChassisDataAdapter.class);

   // Note that object types must be qualified with a namespace.
   // Only VMware Infrastructure internal types don't require a namespace.
   public static final String CHASSIS_TYPE = ModelObject.NAMESPACE + "Chassis";

   private static final ResultItem[] EMPTY_RESULT_ITEMS = new ResultItem[0];

   // Reference to the DataService to make additional queries
   private final DataService _dataService;

   // Resolver for URIs of resource objects provided by this adapter.
   private final ModelObjectUriResolver _uriResolver;

   // ObjectReferenceService that can also handle vSphere object references.
   // Must be used in this adapter since host objects are involved
   private final VimObjectReferenceService _objRefService;

   // In-memory object store to replace with a back-end server in a real implementation
   private final ObjectStore _objectStore;

   /**
    * Constructor (arguments are Spring-injected, see bundle-context.xml).
    *
    * @param dataService
    *       Platform dataService for making additional queries.
    *
    * @param uriResolver
    *       ModelObjectUriResolver used to handle URIs in this adapter.
    *
    * @param objRefService
    *       VimObjectReferenceService used to handle object references for both
    *       vSphere and non-vSphere objects.
    *
    * @param objectStore The in-memory store used for this sample.
    */
   public ChassisDataAdapter(
         DataService dataService,
         ModelObjectUriResolver uriResolver,
         VimObjectReferenceService objRefService,
         ObjectStore objectStore) {
      if (dataService == null || objRefService == null || uriResolver == null) {
         throw new IllegalArgumentException("constructor args cannot be null.");
      }
      _dataService = dataService;
      _uriResolver = uriResolver;
      _objRefService = objRefService;
      _objectStore = objectStore;

      // A DataProviderAdapter constructor should not do any data initialization.
   }

   @Override
   /**
    * Hook into vSphere client's DataService: all query requests for the types
    * supported by this adapter land here.  Depending on the request the
    * response will contain newly discovered objects, or properties on existing
    * objects, or relational data.
    *
    * @see com.vmware.vise.data.query.DataProviderAdapter#getData(
    *    com.vmware.vise.data.query.RequestSpec)
    */
   public Response getData(RequestSpec request) {
      if (request == null) {
         throw new IllegalArgumentException("request must be non-null.");
      }
      // The platform may be combining several queries in one call.
      // A real adapter should transform these queries into calls to a remote
      // plugin server to fetch data. In this sample we process everything in memory.
      QuerySpec[] querySpecs = request.querySpec;
      List<ResultSet> results = new ArrayList<ResultSet>(querySpecs.length);
      for (QuerySpec qs : querySpecs) {
         ResultSet rs = processQuery(qs);
         results.add(rs);
      }
      Response response = new Response();
      response.resultSet = results.toArray(new ResultSet[]{});
      return response;
   }

   /**
    * Process a single QuerySpec.
    */
   @SuppressWarnings("boxing")
   private ResultSet processQuery(QuerySpec qs) {
      ResultSet rs = new ResultSet();

      if (!validateQuerySpec(qs)) {
         // Ignore queries that cannot be handled by this adapter. Don't throw
         // an error in this case to avoid affecting the UI.
         return rs;
      }

      // Process the constraint.
      List<ResultItem> items =
            processConstraint(qs.resourceSpec.constraint, qs.resourceSpec.propertySpecs);

      // Prepare the ResultSet to return.
      // Note that totalMatchedObjectCount is only relevant when the query is
      // for discovering new objects (i.e. constraint is of type Constraint)
      // The actual number of items returned may be reduced because of paging.
      rs.totalMatchedObjectCount = (items != null) ? items.size() : 0;
      rs.items = adjustResultItems(items, qs.resultSpec);
      rs.queryName = qs.name;
      return rs;
   }

   /**
    * Sort items and handle paging if the query requires it.
    *
    * Notes:
    * - Such queries are generated by the inventory list and objects list
    * created by the extension objectViewTemplate and objectCollectionTemplate.
    * Usually the sorting requested is by object name. The page offset and size
    * is based on the current view. Not implementing paging can affect performance!
    * - In order to see the paging code in action in this sample you can
    * increase ObjectStore.CHASSIS_COUNT to a higher number, like 200.
    *
    * @param itemsList  the list of all ResultItems
    * @param resultSpec the spec containing the sorting and paging requirements
    * @return an array of sorted and paged ResultItems
    */
   private ResultItem[] adjustResultItems(
            List<ResultItem> itemsList, ResultSpec resultSpec) {
      ResultItem[] items = itemsList.toArray(new ResultItem[itemsList.size()]);

      int offset = (resultSpec.offset != null) ? resultSpec.offset.intValue() : 0;
      int startIndex = offset;

      if (startIndex < 0 || startIndex >= items.length) {
         return EMPTY_RESULT_ITEMS;
      }

      int maxResultCount = (resultSpec.maxResultCount != null) ?
            resultSpec.maxResultCount.intValue() : -1;

      if (maxResultCount == 0) {
         // no items to return, the query only cares about the object count
         return EMPTY_RESULT_ITEMS;
      }

      int endIndex = startIndex + maxResultCount;
      if ((endIndex >= items.length) || (maxResultCount < 0)) {
         endIndex = items.length;
      }

      // IMPORTANT NOTE:
      // In this sample we need to sort items first before reducing the array
      // size in case of paging. A real world plugin would use a database or
      // server back-end capability to apply the right sorting and paging.
      // DO NOT use in-memory processing like here for large applications!
      // Also, if there is no order specified, the adapter is still supposed
      // to use the same default ordering for each query, not a random one.

      if (resultSpec.order != null) {
         Arrays.sort(items, new ResultItemComparator(resultSpec.order));
      }

      ResultItem[] adjustedItems = items;
      if ((startIndex > 0) || (endIndex < items.length)) {
         adjustedItems = Arrays.copyOfRange(items, startIndex, endIndex);
      }
      return adjustedItems;
   }


   /**
    * Process a particular constraint and return the ResultItem list for that
    * constraint (this can be nested)
    */
   private List<ResultItem> processConstraint(
            Constraint constraint, PropertySpec[] propertySpecs) {
      List<ResultItem> items = null;
      if (constraint instanceof ObjectIdentityConstraint) {
         // Constraint for getting properties of a specific chassis
         // i.e. the matching criteria is on the object itself.
         ObjectIdentityConstraint oic = (ObjectIdentityConstraint)constraint;
         items = processObjectIdentityConstraint(oic, propertySpecs);
      } else if (constraint instanceof CompositeConstraint) {
         // Constraint is a composite of nested constraints
         CompositeConstraint cc = (CompositeConstraint)constraint;
         items = processCompositeConstraint(cc, propertySpecs);
      } else if (constraint instanceof PropertyConstraint) {
         // Constraint where the matching criteria is based on properties of
         // the target objects.
         PropertyConstraint pc = (PropertyConstraint)constraint;
         items = processPropertyConstraint(pc, propertySpecs);
      } else if (isSimpleConstraint(constraint)) {
         // Simple constraint with only a targetType, which means that the
         // adapter should return all objects of that type.
         items = processSimpleConstraint(constraint, propertySpecs);
      }
      if (items == null) {
         // no items found or constraint could not be handled.
         items = new ArrayList<ResultItem>();
      }
      return items;
   }

   /**
    * @return true if constraint has the type Constraint, not a sub-type.
    */
   private boolean isSimpleConstraint(Object constraint) {
      // Note that a comparison on the class itself would fail when the class
      // loader is different.
      return (constraint.getClass().getSimpleName().equals(
            Constraint.class.getSimpleName()));
   }

   /**
    * Handle a PropertyConstraint with a textual comparator
    *
    * @return a ResultItem list with the objects for which the value of
    * pc.propertyName is a String and contain pc.comparableValue
    * (case insensitive comparison)
    */
   private List<ResultItem> processPropertyConstraint(
            PropertyConstraint pc, PropertySpec[] propertySpecs) {
      assert (pc.comparator == Comparator.TEXTUALLY_MATCHES);
      String comparableValue = pc.comparableValue.toString().toLowerCase();

      List<Object> matchItems = _objectStore.getObjectsByPropertyValue(
            pc.targetType, pc.propertyName, comparableValue);
      return createResultItemsForModelObject(matchItems, propertySpecs);
   }

   /**
    * Handles a CompositeConstraint by delegating
    * the processing of each constraint to the appropriate handler.
    */
   private List<ResultItem> processCompositeConstraint(
         CompositeConstraint cc,
         PropertySpec[] propertySpecs) {
      List<ResultItem> resultItems = new ArrayList<ResultItem>();
      if (cc.conjoiner == Conjoiner.AND) {
         // Intersect results from all nested constraints
         for (Constraint constraint : cc.nestedConstraints) {
            List<ResultItem> items = processConstraint(constraint, propertySpecs);
            if (items.size() == 0) {
               return items;
            }
            if (resultItems.size() == 0) {
               // first non-empty list of items
               resultItems = items;
               continue;
            }
            resultItems = intersect(resultItems, items);
            if (resultItems.size() == 0) {
               // no need to continue intersecting
               break;
            }
         }
      }
      else if (cc.conjoiner == Conjoiner.OR) {
         // Add results from all nested constraints
         for (Constraint constraint : cc.nestedConstraints) {
            List<ResultItem> items = processConstraint(constraint, propertySpecs);
            resultItems.addAll(items);
         }
      }
      return resultItems;
   }

   /**
    * Simple implementation of an intersection of 2 lists of ResultItem.
    * Note that this doesn't merge the properties of ResultItems found in the
    * intersection, but this is good enough for our purpose.
    *
    * @param list1
    * @param list2
    * @return a list containing the items from list1 for which the object Uid
    * is also found in list2.
    */
   private List<ResultItem> intersect(List<ResultItem> list1,  List<ResultItem> list2) {
      List<ResultItem> list3 = new ArrayList<ResultItem>();
      for (ResultItem item1 : list1) {
         String uid1 =  _objRefService.getUid(item1.resourceObject);
         if (uid1 == null) {
            continue;
         }
         for (ResultItem item2 : list2) {
            String uid2 =  _objRefService.getUid(item2.resourceObject);
            if (uid1.equals(uid2)) {
               list3.add(item1);
               break;
            }
         }
      }

      return list3;
   }

   /**
    * Returns all objects matching the targetType specified in the constraint.
    *
    * Note that in this simple implementation we have to return ALL objects
    * regardless of the paging and sorting parameters in the query's ResultSpec
    * (this is handled later in adjustResultItems()). A normal adapter should
    * have its back-end data source handle paging and sorting.
    */
   private List<ResultItem> processSimpleConstraint(
         Constraint constraint,
         PropertySpec[] propertySpecs) {

      List<ResultItem> items = new ArrayList<ResultItem>();

      // Get a snapshot of the current chassis list.
      // An implementation with a large data set should handle paging.
      Map<String, ModelObject> currentObjects =  _objectStore.getAllChassis();

      for(ModelObject mo : currentObjects.values()) {
         URI objectUri = mo.getUri(_uriResolver);
         ResultItem resultItem = createResultItem(mo, objectUri, propertySpecs);
         if (resultItem != null) {
            items.add(resultItem);
         }
      }
      return items;
   }

   /**
    * Processes an ObjectIdentityConstraint, i.e. where the constraint.target
    * is a specific object for which we need to return requested properties.
    */
   private List<ResultItem> processObjectIdentityConstraint(
         ObjectIdentityConstraint constraint,
         PropertySpec[] propertySpecs) {

      List<ResultItem> items = new ArrayList<ResultItem>();
      URI objectUri = toURI(constraint.target);
      // ref is null if constraint.target is a Host

      if (objectUri != null) {
         ModelObject mo = _objectStore.getModelObject(objectUri);
         ResultItem ri = createResultItem(mo, objectUri, propertySpecs);
         if (ri != null) {
            items.add(ri);
         }
      }
      return items;
   }

   /**
    * Return the list of ResultItems containing each object's URI and the values
    * for the requested properties.
    */
   private List<ResultItem> createResultItems(
            List<Object> objectList, PropertySpec[] propertySpecs) {
      assert (objectList != null && propertySpecs != null);
      List<ResultItem> items = new ArrayList<ResultItem>(objectList.size());

      items.addAll(createResultItemsForModelObject(objectList, propertySpecs));
      return items;
   }

   /**
    * Return the list of ResultItems only for objects that are ModelObject.
    */
   private List<ResultItem> createResultItemsForModelObject(
            List<Object> objectList, PropertySpec[] propertySpecs) {
      List<ResultItem> items = new ArrayList<ResultItem>();
      for (Object mo : objectList) {
         if (!(mo instanceof ModelObject)) {
            continue;
         }

         URI objectUri = ((ModelObject)mo).getUri(_uriResolver);
         ResultItem ri = createResultItem((ModelObject)mo, objectUri, propertySpecs);
         if (ri != null) {
            items.add(ri);
         }
      }
      return items;
   }


   /**
    * Return data for objects/properties this adapter doesn't handle.
    */
   private List<ResultItem> getResultItemsFromDataService(
         List<ObjectIdentityConstraint> objConstraints,
         PropertySpec[] propertySpecs) {

      // Wraps up the supplied Constraints and PropertySpecs into a QuerySpec
      // and requests the data from DataService.
      CompositeConstraint constraint = new CompositeConstraint();
      constraint.conjoiner = Conjoiner.OR;
      constraint.nestedConstraints = objConstraints.toArray(
            new Constraint[objConstraints.size()]);

      QuerySpec qrySpc = new QuerySpec();
      qrySpc.resourceSpec = new ResourceSpec();
      qrySpc.resourceSpec.constraint = constraint;
      qrySpc.resourceSpec.propertySpecs = propertySpecs;
      qrySpc.resultSpec = new ResultSpec();

      RequestSpec requestSpec = new RequestSpec();
      requestSpec.querySpec = new QuerySpec[]{qrySpc};

      Response results = _dataService.getData(requestSpec);

      if ((results == null) || (results.resultSet.length == 0)) {
         return new ArrayList<ResultItem>();
      }
      return Arrays.asList(results.resultSet[0].items);
   }

   /**
    * Create a ResultItem containing the values of the requested
    * properties for the given ModelObject.
    *
    * @param mo   The ModelObject
    * @param objectUri  The URI reference of that object
    * @param propertySpecs The requested properties
    * @return
    */
   private ResultItem createResultItem(
            ModelObject mo, URI objectUri, PropertySpec[] propertySpecs) {
      if (mo == null) {
         return null;
      }
      String[] requestedProperties = getRequestedPropertyNames(propertySpecs);
      try {
         ResultItem ri = new ResultItem();
         ri.resourceObject = objectUri;

         ArrayList<PropertyValue> propValues =
               new ArrayList<PropertyValue>(requestedProperties.length);

         for (int i = 0; i < requestedProperties.length; ++i) {
            String requestedProperty = requestedProperties[i];
            Object value = mo.getProperty(requestedProperty);

            // Queries may include properties unsupported by this adapter,
            // it is recommended to skip them instead of returning a null value.
            if (value != ModelObject.UNSUPPORTED_PROPERTY) {
               PropertyValue pv = new PropertyValue();
               pv.resourceObject = objectUri;
               pv.propertyName = requestedProperty;
               pv.value = value;
               propValues.add(pv);
            }
         }
         ri.properties = propValues.toArray(new PropertyValue[0]);
         return ri;
      } catch (Exception ex) {
         _logger.error("Error getting the ResultItem for " + objectUri, ex);
         return null;
      }
   }

   /**
    * Validates the input query spec.
    *
    * @return
    *    Returns false if the query spec cannot be processed by this data adapter.
    */
   private boolean validateQuerySpec(QuerySpec qs) {
      if (qs == null) {
         return false;
      }

      ResourceSpec resourceSpec = qs.resourceSpec;
      if (resourceSpec == null) {
         return false;
      }
      return validateConstraint(resourceSpec.constraint);
   }

   /**
    * Validate the query constraint.
    */
   private boolean validateConstraint(Constraint constraint) {
      if (constraint == null) {
         return false;
      }

      if (constraint instanceof ObjectIdentityConstraint) {
         // Only handles queries on objects of the supported types
         String sourceType = _objRefService.getResourceObjectType(
               ((ObjectIdentityConstraint)constraint).target);
         return isSupportedType(sourceType);

      } else if (constraint instanceof CompositeConstraint) {
         // All nested constraints must be valid
         CompositeConstraint cc = (CompositeConstraint)constraint;
         for (Constraint c : cc.nestedConstraints) {
            if (!validateConstraint(c)) {
               return false;
            }
         }
         return true;

      } else if (constraint instanceof PropertyConstraint) {
         // Only handles constraint for text comparisons
         return isSupportedType(constraint.targetType) &&
               ((PropertyConstraint)constraint).comparator == Comparator.TEXTUALLY_MATCHES;

      } else if (isSimpleConstraint(constraint)) {
         // Simple Constraint for fetching all objects of a specific type.
         return isSupportedType(constraint.targetType);
      }

      // This should not happen because this adapter supports all Constraint types
      _logger.error("querySpec constraint not supported: " +
            constraint.getClass().getName());
      return false;
   }

   /**
    * Checks if the type is supported by this adapter.
    */
   private boolean isSupportedType(String type) {
      return CHASSIS_TYPE.equals(type);
   }

   /**
    * Extract names of all requested properties from the PropertySpecs.
    */
   private String[] getRequestedPropertyNames(PropertySpec[] pSpecs) {
      Set<String> properties = new HashSet<String>();
      if (pSpecs != null) {
         for (PropertySpec pSpec : pSpecs) {
            for (String property : pSpec.propertyNames) {
               properties.add(property);
            }
         }
      }
      return properties.toArray(new String[]{});
   }

   /**
    * Helper that cast objects to URI.
    */
   private URI toURI(Object target) {
      if (!(target instanceof URI)) {
         return null;
      }
      return (URI)target;
   }

   /**
    * Helper that cast objects to ModelObject.
    */
   private ModelObject toModelObject(Object target) {
      if (!(target instanceof ModelObject)) {
         return null;
      }
      return (ModelObject)target;
   }

}
