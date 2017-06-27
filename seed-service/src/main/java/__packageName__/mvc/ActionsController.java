package __packageName__.mvc;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.gson.Gson;
import __packageName__.services.SampleActionService;
// [removable-chassis-code]
import __packageName__.model.ChassisInfo;
import __packageName__.services.ChassisDataAdapter;
import __packageName__.services.ChassisService;
// [end-chassis-code]
import com.vmware.vise.data.query.ObjectReferenceService;


/**
 * A controller to serve HTTP JSON GET/POST requests to the endpoint "/actions.html".
 */
@Controller
@RequestMapping(value = "/actions.html")
public class ActionsController {
   private final static Log _logger = LogFactory.getLog(ActionsController.class);

   // UI plugin resource bundle for localized messages
   private final String RESOURCE_BUNDLE = "__bundleName__";

   private final SampleActionService _actionService;
   private final ChassisService _chassisService;   // [removable-chassis-line]

   private final ObjectReferenceService _objectReferenceService;

   @Autowired
   public ActionsController(
         SampleActionService actionService,
         ChassisService chassisService,         // [removable-chassis-line]
         @Qualifier("objectReferenceService") ObjectReferenceService objectReferenceService) {
      _actionService = actionService;
      _chassisService = chassisService;         // [removable-chassis-line]
      _objectReferenceService = objectReferenceService;
      QueryUtil.setObjectReferenceService(objectReferenceService);
   }

   // Empty controller to avoid warnings in __projectName-ui__'s bundle-context.xml
   // where the bean is declared
   public ActionsController() {
      _actionService = null;
      _chassisService = null;       // [removable-chassis-line]
      _objectReferenceService = null;
   }


   /**
    * Generic method to invoke an action on a given object or a global action.
    *
    * @param actionUid  the action Uid as defined in plugin.xml
    *
    * @param targets  null for a global action, comma-separated list of object ids
    *    for an action on 1 or more objects
    *
    * @param json additional data in JSON format, or null for the delete action.
    *
    * @return
    *    Returns a map with key values.
    */
   @RequestMapping(method = RequestMethod.POST)
   @ResponseBody
   public Map<String, Object> invoke(
            @RequestParam(value = "actionUid", required = true) String actionUid,
            @RequestParam(value = "targets", required = false) String targets,
            @RequestParam(value = "json", required = false) String json)
            throws Exception {
      // Parameters validation
      Object objectRef = null;
      String objectId = null;

      if (targets != null) {
         String[] objectIds = targets.split(",");
         if (objectIds.length > 1) {
            // Our actions only support 1 target object for now
            _logger.warn("Action " + actionUid + " called with " + objectIds.length
                  + " target objects, will use only the first one");
         }
         objectId = ObjectIdUtil.decodeParameter(objectIds[0]);
         objectRef = _objectReferenceService.getReference(objectId);
         if (objectRef == null) {
            String errorMsg = "Error in action " + actionUid +
                  ", object not found with id: " + objectId;
            _logger.error(errorMsg);
            throw new Exception(errorMsg);
         }
      }

      // [removable-chassis-code]
      if (actionUid.equals("__packageName__.editChassis") ||
            actionUid.equals("__packageName__.deleteChassis") ||
            actionUid.equals("__packageName__.createChassis")) {
         // Chassis actions must be called with the correct object type
         if ((objectRef != null) && !(objectRef instanceof URI)) {
            throw new Exception(objectId + " is not a URI, in action " + actionUid);
         }
         return handleChassisActions(actionUid, (URI)objectRef, json);
      }
      // [end-chassis-code]

      // ------------ Samples actions under the Host menu ----------------

      ActionResult actionResult = new ActionResult(actionUid, RESOURCE_BUNDLE);

      if (actionUid.equals("__packageName__.sampleAction1")) {
         // Call the corresponding service method:
         // Normally json would be converted to some Java object and used as argument
         // and if the method succeeds we would return the correct actionResult.
         // Here we return a dummy error message to show that the action was called
         // (the current SDK doesn't support notification for successful actions)
         boolean result = _actionService.sampleAction1(objectRef);
         actionResult.setErrorLocalizedMessage("Action1 was called with: " + json);

      } else if (actionUid.equals("__packageName__.sampleAction2")) {
         // Same comment as above
         boolean result = _actionService.sampleAction2(objectRef);
         actionResult.setErrorLocalizedMessage("Action2 was called with: " + json);
      } else {
         String warning = "Action not implemented yet! "+ actionUid;
         _logger.warn(warning);
         actionResult.setErrorLocalizedMessage(warning);
      }
      return actionResult.getJsonMap();
   }

   // [removable-chassis-code]
   private Map<String, Object> handleChassisActions(String actionUid, URI objectRef, String json)
         throws Exception {

      ChassisInfo chassisInfo = null;
      if (json != null) {
         // Create a ChassisInfo java object from the json data.
         Gson gson = new Gson();
         chassisInfo = gson.fromJson(json, ChassisInfo.class);
      } else if (!actionUid.equals("__packageName__.deleteChassis")) {
         throw new Exception("Missing json data for " + actionUid);
      }

      ActionResult actionResult = new ActionResult(actionUid, RESOURCE_BUNDLE);

      if (actionUid.equals("__packageName__.editChassis")) {
         boolean result = _chassisService.updateChassis((URI)objectRef, chassisInfo);
         actionResult.setObjectChangedResult(result, "editAction.notFound");

      } else if (actionUid.equals("__packageName__.deleteChassis")) {
         boolean result = _chassisService.deleteChassis((URI)objectRef);
         actionResult.setObjectDeletedResult(result, "deleteAction.notFound");

      } else if (actionUid.equals("__packageName__.createChassis")) {
         Object result = _chassisService.createChassis(chassisInfo);
         if (result != null) {
            actionResult.setObjectAddedResult((URI) result, ChassisDataAdapter.CHASSIS_TYPE, null);
         } else {
            // Case where the name is already taken
            String[] params = new String[]{chassisInfo.name};
            actionResult.setErrorMessage("createAction.nameTaken", params);
         }
      }
      return actionResult.getJsonMap();
   }
   // [end-chassis-code]

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
}

