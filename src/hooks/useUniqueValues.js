import { useState, useCallback } from "react";
import { API_URL } from "../config";

/**
 * Hook to fetch unique master-list values for a specific field.
 */
export const useUniqueValues = (fieldName, sutType) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOptions = useCallback(async () => {
    if (options.length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/unique-values?parameterName=${encodeURIComponent(fieldName)}`
      );
      if (!res.ok) throw new Error("Failed to fetch unique values");
      const json = await res.json();
      
      let parsed = [];
      const sutTypesMap = json?.sut_types || {};
      
      if (json?.unique_values) {
        // Handle format: { unique_values: { field: [...] } }
        const objVals = Object.values(json.unique_values);
        parsed = (objVals.length > 0 && Array.isArray(objVals[0])) ? objVals[0] : [];
      } else if (Array.isArray(json?.data)) {
        // Handle format: { data: [...] }
        parsed = json.data;
      } else if (Array.isArray(json)) {
        // Handle format: [...]
        parsed = json;
      }
      
      // Filter by sutType if provided
      if (sutType && parsed.length > 0) {
        const lowerSutType = sutType.toLowerCase();
        parsed = parsed.filter(val => {
          const typesForVal = sutTypesMap[val];
          if (Array.isArray(typesForVal)) {
            return typesForVal.some(t => t?.toLowerCase() === lowerSutType);
          }
          return true; // Keep the value if no specific SUT mapping exists
        });
      }
      
      setOptions(parsed);
    } catch (error) {
      console.error("useUniqueValues error:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [fieldName, options.length, sutType]);

  return { options, loading, fetchOptions };
};
