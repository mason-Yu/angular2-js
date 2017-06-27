/** Copyright 2012 VMware, Inc. All rights reserved. -- VMware Confidential */

package __packageName__;

import java.net.URI;
import java.net.URISyntaxException;

import com.vmware.vise.data.uri.ResourceTypeResolver;

/**
 * Resolver of URIs referencing ModelObject resources.
 *
 * It is registered with DataService through a uriSchemeInitializer bean
 * declared in bundle-context.xml. DataService use resolvers to extract type and
 * server guid of resources, and then route queries to the correct data adapters.
 *
 * This resolver supports URIs with the form <scheme>:<type>:<resourceId>
 * such as "urn:cr:samples:Chassis:server1/chassis-2"
 *
 * <scheme>: "urn:cr" is the registered scheme or prefix (strictly speaking the
 *     URI scheme is "urn",  the "cr" namespace is included in the prefix).
 *
 * <type>: the object qualified type, e.g. "samples:Chassis",
 *    which matches the types registered by the DataProviderAdapter.
 *
 * <resourceId>: a unique id in the form serverGuid/objectId, where serverGuid
 *    is the Guid of the server from which this object originates,  and objectId
 *    is a unique id of the object within the set of objects
 *    of the same type and originating from the same server.
 *
 * Note: resourceId cannot contain the type delimiter ":"!
 */
public class ModelObjectUriResolver implements ResourceTypeResolver {

   /**
    * The URI scheme can be the form "acme" or "urn:acme", but not "urn" alone
    * which is reserved. Here we use the namespace "cr" for chassis.
    * Note: "urn:vim25" and "urn:vri" are reserved too.
    */
   private static final String SCHEME = "urn";
   private static final String NAMESPACE = "cr";
   private static final String UID_PREFIX = SCHEME + ":" + NAMESPACE;

   /**
    * The delimiter that is used to separate the part of the URI that contains the
    * resource type from the actual resource identification part.
    */
   private static final String TYPE_DELIMITER = ":";

   private static final String FRAGMENT_SEPARATOR = "/";

   /* (non-Javadoc)
    * @see com.vmware.vise.data.uri.ResourceTypeResolver#getResourceType(java.net.URI)
    */
   @Override
   public String getResourceType(URI uri) {
      if (!isValid(uri)) {
         throwExceptionForInvalidURI(uri);
      }
      return parseUri(uri, true);
   }

   /* (non-Javadoc)
    * @see com.vmware.vise.data.uri.ResourceTypeResolver#getServerGuid(java.net.URI)
    */
   @Override
   public String getServerGuid(URI uri) {
      // The server Guid is the first part of the resource id
      String id = getId(uri);
      int fragmentSeparatorIndex = id.indexOf(FRAGMENT_SEPARATOR);
      if (fragmentSeparatorIndex <= 0) {
         throwExceptionForInvalidURI(uri);
      }
      return id.substring(0, fragmentSeparatorIndex);
   }

   /**
    * Get the resource id part of the URI. For instance "server1/chassis-2"
    *    is returned for URI "urn:cr:samples:Chassis:server1/chassis-2".
    */
   public String getId(URI uri) {
      if (!isValid(uri)) {
         throwExceptionForInvalidURI(uri);
      }
      return parseUri(uri, false);
   }

   /**
    * A unique identifier for the URI (its string representation) that can be
    * used for maps.
    */
   public String getUid(URI uri) {
      if (!isValid(uri)) {
         throwExceptionForInvalidURI(uri);
      }
      return uri.toString();
   }

   /**
    * Creates a new URI instance compatible with this resolver.
    *
    * @param type
    *    The type of the resource that the URI identifies.
    * @param id
    *    The resource identification part. May consists of multiple components
    *    allowed by the URI syntax e.g. path, query, fragment.
    * @return The newly created URI using the resolver scheme.
    * @throws IllegalArgumentException
    */
   public URI createUri(String type, String id) {
      if (type == null || type.length() < 1) {
         throw new IllegalArgumentException("type must be non-null.");
      }
      if (id == null || id.length() < 1) {
         throw new IllegalArgumentException("id must be non-null.");
      }
      URI uri = null;
      try {
         String schemeSpecificPart =
               NAMESPACE + TYPE_DELIMITER + type + TYPE_DELIMITER + id;
         String fragment = null;
         uri = new URI(SCHEME, schemeSpecificPart, fragment);
      } catch (URISyntaxException e) {
         throw new IllegalArgumentException(e);
      }
      return uri;
   }

   /**
    * Create an id combining a server id and object id such that the object can be
    * uniquely described across any server within that class of object, i.e.
    * server1/chassis-2. In a real implementation this id is typically returned
    * by the back-end where objects are stored.
    *
    * @param serverGuid
    *       Unique identifier for the server where the object originates.
    *
    * @param objectId
    *       Identifier unique within the instances of sub-type of ModelObject.
    *
    * @return
    *       An identifier to reference the object,
    */
   public String createResourceId(String serverGuid, String objectId) {
      String id = serverGuid + FRAGMENT_SEPARATOR + objectId;
      return id;
   }

   /**
    * @return true if the provided URI starts with the resolver's registered scheme.
    */
   public boolean isValid(URI uri) {
      return (uri != null) && uri.toString().startsWith(UID_PREFIX);
   }

   /**
    * Parses either the type or the resource identification parts of a URI.
    *
    * @return the type if parseType is true (i.e. "samples:Chassis"),
    *    and the resource id if parseType if false (i.e. "server1/chassis-2").
    */
   private String parseUri(URI uri, boolean parseType) {
      // Get the part after "urn:"
      String ssPart = uri.getSchemeSpecificPart();
      // Get the part after "cr:"
      int typeIndex = ssPart.indexOf(TYPE_DELIMITER);
      ssPart = ssPart.substring(typeIndex + 1);

      // Get the last ":", which separates the type from the resource id
      int resourceIndex = ssPart.lastIndexOf(TYPE_DELIMITER);
      if (resourceIndex == -1) {
         String message = "Invalid URI, missing type delimiter: " + toString(uri);
         throw new IllegalArgumentException(message);
      }

      String result;
      if (parseType) {
         result = ssPart.substring(0, resourceIndex);
      } else {
         result = ssPart.substring(resourceIndex + 1);
      }

      return result;
   }

   /**
    * Throws an IllegalArgumentException claiming that this URI is invalid for this
    * resolver.
    */
   private void throwExceptionForInvalidURI(URI uri) {
      throw new IllegalArgumentException(
            "URI " + toString(uri) + " is invalid for this resolver.");
   }

   /**
    * Null safe toString method for URI.
    */
   private String toString(URI uri) {
      if (uri == null) {
         return null;
      }
      return uri.toString();
   }
}
