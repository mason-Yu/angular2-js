/** Copyright 2016 VMware, Inc. All rights reserved. -- VMware Confidential */

package __packageName__.model;

import java.net.URI;

import __packageName__.ModelObjectUriResolver;

/**
 * Base type for Chassis objects used this sample.
 */
public abstract class ModelObject {

   /** Namespace to add to the raw types */
   public static final String NAMESPACE = "samples:";

   /** Flag representing an unsupported property */
   public static final Object UNSUPPORTED_PROPERTY = new Object();

   private String _id;
   private URI    _uri;
   private String _type;

   /**
    * Resource id, unique within the same class of objects.
    * For instance "server1/chassis-2" in this sample. In a real implementation
    * this would be an identifier provided by the back-end server.
    *
    * @return the object identifier
    */
   public String getId() {
      return _id;
   }

   protected void setId(String value) {
      _id = value;
   }

   /**
    * @return the object type, i.e. "samples:Chassis"
    */
   public String getType() {
      if (_type == null) {
         _type = NAMESPACE + this.getClass().getSimpleName();
      }
      return _type;
   }

   /**
    * Get the URI reference to use in the UI.
    *
    * @param resolver
    * @return the URI representation of this object.
    */
   public URI getUri(ModelObjectUriResolver resolver) {
      if (_uri == null) {
         _uri = resolver.createUri(this.getType(), _id);
      }
      return _uri;
   }

   /**
    * @param property Property name
    * @return the property value
    */
   public abstract Object getProperty(String property);
}
