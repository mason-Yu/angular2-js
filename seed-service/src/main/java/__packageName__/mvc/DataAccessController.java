package __packageName__.mvc;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.vmware.vise.data.query.DataService;
import com.vmware.vise.data.query.ObjectReferenceService;
import com.vmware.vise.data.query.PropertyValue;
import com.vmware.vise.data.query.ResultItem;
import com.vmware.vise.data.query.ResultSet;

/**
 * A generic controller to serve HTTP JSON GET requests to the endpoint "/data".
 *
 */
@Controller
@RequestMapping(value = "/data", method = RequestMethod.GET)
public class DataAccessController {
   private final static String OBJECT_ID = "id";

   private final DataService _dataService;
   private final ObjectReferenceService _objectReferenceService;

   @Autowired
   public DataAccessController(
         DataService dataService,
         @Qualifier("objectReferenceService") ObjectReferenceService objectReferenceService) {
      _dataService = dataService;
      _objectReferenceService = objectReferenceService;
      QueryUtil.setObjectReferenceService(objectReferenceService);
   }

   // Empty controller to avoid warnings in __projectName-ui__'s bundle-context.xml
   // where the bean is declared
   public DataAccessController() {
      _dataService = null;
      _objectReferenceService = null;
   }

   /**
    * Generic method to fetch properties for a given object.
    * e.g. /properties/{objectId}?properties=name,config
    *
    * @param encodedObjectId
    *    Encoded object id.
    *
    * @param properties
    *    Properties passed as a request parameter that needs to be fetched.
    *    They are comma separated.
    *    For e.g. name,runtime
    *
    * @return
    *    Returns a map with property name as key and property value as the value.
    */
   @RequestMapping(value = "/properties/{objectId}")
   @ResponseBody
   public Map<String, Object> getProperties(
            @PathVariable("objectId") String encodedObjectId,
            @RequestParam(value = "properties", required = true) String properties)
            throws Exception {

      Object ref = getDecodedReference(encodedObjectId);
      String objectId = _objectReferenceService.getUid(ref);

      String[] props = properties.split(",");
      PropertyValue[] pvs = QueryUtil.getProperties(_dataService, ref, props);
      Map<String, Object> propsMap = new HashMap<String, Object>();
      propsMap.put(OBJECT_ID, objectId);
      for (PropertyValue pv : pvs) {
         propsMap.put(pv.propertyName, pv.value);
      }
      return propsMap;
   }

   /**
    * Generic method to fetch properties using relation for the given object.
    *
    * @param encodedObjectId
    *    Encoded object id.
    *
    * @param relation
    *    Relationship, like vm for a host, the relation would be "vm".
    *
    * @param targetType
    *    Type of objects targeted by this data request.
    *
    * @param properties
    *    Properties passed as a request parameter that needs to be fetched.
    *    They are comma separated.
    *    For e.g. name,runtime
    *
    * @return
    *    Returns an array of <code>PropertyValue</code>
    * @throws Exception
    */
   @RequestMapping(value = "/propertiesByRelation/{objectId}")
   @ResponseBody
   public PropertyValue[] getPropertiesForRelatedObject(
            @PathVariable("objectId") String encodedObjectId,
            @RequestParam(value = "relation", required = true) String relation,
            @RequestParam(value = "targetType", required = true) String targetType,
            @RequestParam(value = "properties", required = true) String properties)
            throws Exception {
      Object ref = getDecodedReference(encodedObjectId);
      String[] props = properties.split(",");
      PropertyValue []result = QueryUtil.getPropertiesForRelatedObjects(
            _dataService, ref, relation, targetType, props);
      return result;
   }

   /**
    * Gets a list items of the given type and extract the given properties
    *
    * @param targetType  object type
    *
    * @param properties
    *    List of properties to request for the matched objects, i.e. prop1,prop2,prop3.
    *
    * @param offset
    *    The offset into the result of items.
    *    If the offset is N then items from N to N + maxResultCount - 1 will be returned.
    *    If empty, it will default to 0.
    *
    * @param maxResultCount
    *    The max number of items to retrieve. By default all results are retrieved.
    *
    * @param sorting
    *    A pair of strings: the property to sort on and the sorting direction,
    *    i.e. prop1,asc  or prop2,desc. By defaut "name,asc" will be used
    *
    * @return
    *    Returns a map where "data" is a list of items and "totalResultCount" is a total
    *    number of items satisfying the constraint.
    *
    * @throws Exception
    */
   @RequestMapping(value = "/list/")
   @ResponseBody
   public Map<String, Object> getListDataEx(
         @RequestParam(value="targetType") String targetType,
         @RequestParam(value="properties") String properties,
         @RequestParam(value="offset", defaultValue="0") int offset,
         @RequestParam(value="maxResultCount", defaultValue="-1") int maxResultCount,
         @RequestParam(value="sorting", required = false) String sorting) throws Exception {

      String[] props = properties.split(",");
      String[] sortParams = (sorting != null) ? sorting.split(",") : null;
      ResultSet rs = QueryUtil.getListData(_dataService, targetType, props, offset, maxResultCount, sortParams);
      return transformListDataToMap(rs);
   }

   /**
    * @return a map for the /list API above.
    */
   private  Map<String, Object> transformListDataToMap(ResultSet rs) {
      List<Map<String, Object>> itemDataResult = new ArrayList<Map<String,Object>>();
      for (ResultItem ri : rs.items) {
         Map<String, Object> itemData = new HashMap<String, Object>();
         for (PropertyValue pv : ri.properties) {
            itemData.put(pv.propertyName, pv.value);
         }
         itemData.put("id", _objectReferenceService.getUid(ri.resourceObject, true));
         itemDataResult.add(itemData);
      }
      Map<String, Object> resultObject = new HashMap<String, Object>();
      resultObject.put("data", itemDataResult);
      resultObject.put("totalResultCount", rs.totalMatchedObjectCount);
      return resultObject;
   }


   /**
    * Generic handling of internal exceptions.
    * Sends a 500 server error response along with a json body with messages
    *
    * @param ex The exception that was thrown.
    * @param response
    * @return a map containing the exception message, the cause, and a stackTrace
    */
   @ExceptionHandler(Exception.class)
   @ResponseBody
   public Map<String, String> handleException(Exception ex, HttpServletResponse response) {
      response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());

      Map<String,String> errorMap = new HashMap<String,String>();
      errorMap.put("message", ex.getMessage());
      if(ex.getCause() != null) {
         errorMap.put("cause", ex.getCause().getMessage());
      }
      StringWriter sw = new StringWriter();
      PrintWriter pw = new PrintWriter(sw);
      ex.printStackTrace(pw);
      errorMap.put("stackTrace", sw.toString());

      return errorMap;
   }

   /**
    * Retrieves the object reference corresponding to the given encoded object id.
    *
    * Note: objectIds sent to controllers are encoded in case they contain "/".
    *
    * @param encodedObjectId the encoded id of the desired object reference
    * @return an object reference with the given id
    * @throws Exception if an object reference with the given id is not found
    */
   private Object getDecodedReference(String encodedObjectId) throws Exception {
      Object ref = _objectReferenceService.getReference(encodedObjectId, true);
      if (ref == null) {
         throw new Exception("Object not found with id: " + encodedObjectId);
      }
      return ref;
   }
}

