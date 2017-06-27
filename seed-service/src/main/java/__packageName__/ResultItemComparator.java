/** Copyright 2012 VMware, Inc. All rights reserved. -- VMware Confidential */
package __packageName__;

import java.util.Comparator;

import com.vmware.vise.data.query.OrderingCriteria;
import com.vmware.vise.data.query.OrderingPropertySpec;
import com.vmware.vise.data.query.PropertyValue;
import com.vmware.vise.data.query.ResultItem;
import com.vmware.vise.data.query.SortType;

/**
 * Generic comparator to sort an array or ResultItem objects based on
 * an <code>OrderingCriteria<code>.
 *
 * IMPORTANT: this is a only given as an example to understand the OrderingCriteria
 * API used for sorting results and make our sample work correctly. A real plugin
 * should rely on its back-end server to return results in the requested order!
 */
public final class ResultItemComparator implements Comparator<ResultItem> {

   private final OrderingCriteria _orderingCriteria;

   public ResultItemComparator(OrderingCriteria orderingCriteria) {
      _orderingCriteria = orderingCriteria;

      // Replace the object "id" criteria with "name" which makes more sense here.
      // (If we don't do that you will notice that the objects list is not sorted
      // by name, whereas the inventory navigator is.)
      for (OrderingPropertySpec propSpec : _orderingCriteria.orderingProperties) {
         for (int i = 0; i <  propSpec.propertyNames.length; i++) {
            if ("id".equals(propSpec.propertyNames[i])) {
               propSpec.propertyNames[i] = "name";
            }
         }
      }
   }

   /* (non-Javadoc)
    * @see java.util.Comparator#compare(java.lang.Object, java.lang.Object)
    */
   @Override
   public int compare(ResultItem resItem1, ResultItem resItem2) {

      for (OrderingPropertySpec propSpec : _orderingCriteria.orderingProperties) {
         boolean ascending = (propSpec.orderingType == SortType.ASCENDING);

         for (String propName : propSpec.propertyNames) {
            PropertyValue prop1 = getPropertyValue(resItem1, propName);
            PropertyValue prop2 = getPropertyValue(resItem2, propName);
            int comparisonValue = compareTo(prop1, prop2, ascending);
            // if properties with the highest priority are equals then sort by
            // next property
            if (comparisonValue != 0) {
               return comparisonValue;
            }
         }
      }

      // no order found
      return 0;
   }

   /**
    * Compares two PropertyValue objects
    * @param prop1
    * @param prop2
    * @param ascending
    * @return comparison number, i.e. negative, positive or 0
    */
   private int compareTo(PropertyValue prop1, PropertyValue prop2, boolean ascending) {
      int compareResult = 0;

      if (prop1 == null || prop1.value == null || prop2 == null || prop2.value == null) {
         // unable to compare
         return compareResult;
      }
      Object val1 = prop1.value;
      Object val2 = prop2.value;
      if (val1 instanceof String && val2 instanceof String) {
         compareResult = ((String) val1).toLowerCase().compareTo(
               ((String) val2).toLowerCase());
      } else if (val1 instanceof Comparable<?>) {
         @SuppressWarnings({ "unchecked" })
         final int comparison = ((Comparable<Object>)val1).compareTo(val2);
         compareResult = comparison;
      } else {
         // by default lexicographically case-insensitive sort
         compareResult = prop1.value.toString().compareToIgnoreCase(
               prop2.value.toString());
      }
      // to change the sign for descending order
      return ascending ? compareResult : -compareResult;
   }
   /**
    * Get property value from the resultItem based on the property name.
    */
   private PropertyValue getPropertyValue(ResultItem resultItem, String propName) {
      if ((resultItem == null) || (resultItem.properties == null)
            || (propName == null) || (propName.length() == 0)) {
         return null;
      }

      for (PropertyValue propValue : resultItem.properties) {
         if (propValue.propertyName.equals(propName)) {
            return propValue;
         }
      }
      return null;
   }

}

