// app/hooks/useEquipmentForm.ts
import { useState, useEffect, useCallback } from 'react';
import { LocationDropdown, Location, EquipmentNode } from '../types';
// ========= TYPE DEFINITIONS (can be shared in a types file) =========


export const FORM_API_BASE_URL = 'http://10.60.75.142:8181'

// ========= useLocations Hook =========
export const useLocations = () => {
  const [dropdowns, setDropdowns] = useState<LocationDropdown[]>([]);
  const [finalLocationId, setFinalLocationId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async (parentId: number | null = null, currentLevel = 1) => {
    const url = parentId ? `${FORM_API_BASE_URL}/api/locations?parent_id=${parentId}` : `${FORM_API_BASE_URL}/api/locations`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const locations: Location[] = await response.json();

      if (locations.length === 0 && parentId) {
        setFinalLocationId(parentId);
        return; // Reached the end
      }

      setDropdowns(prev => [
        ...prev.slice(0, currentLevel - 1),
        { level: currentLevel, options: locations, selectedValue: '' }
      ]);
    } catch (err: unknown) {
      console.error("Failed to fetch locations:", err);
      setError(`Error: Could not load location data.`);
    }
  }, []);
  
  // Initial fetch
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleLocationChange = (selectedValue: string, level: number) => {
    const selectedId = selectedValue ? parseInt(selectedValue, 10) : null;
    
    // Update the changed dropdown's value and remove subsequent dropdowns
    setDropdowns(prev => prev.slice(0, level).map(dd => 
      dd.level === level ? { ...dd, selectedValue } : dd
    ));
    setFinalLocationId(null);
    setError(null);

    if (selectedId) {
      fetchLocations(selectedId, level + 1);
    }
  };

  const resetLocations = () => {
      setDropdowns([]);
      setFinalLocationId(null);
      fetchLocations();
  };

  return { dropdowns, finalLocationId, error, handleLocationChange, resetLocations };
};


// ========= useEquipment Hook =========

// --- UPDATED INTERFACES ---
// This interface reflects the data coming from your API endpoint
export interface FetchedEquipment {
  equipment_id: number;
  equipment_name: string;
  parent_equipment_id: number | null;
  // Add other properties if needed
}

// // This is the structure for your final tree
// export interface EquipmentNode {
//   id: number;
//   text: string;
//   children?: EquipmentNode[];
// }

// --- REVISED HOOK ---
export const useEquipment = (locationId: number | null) => {
  const [equipmentTree, setEquipmentTree] = useState<EquipmentNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!locationId) {
      setEquipmentTree([]);
      return;
    }

    const fetchEquipmentTree = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${FORM_API_BASE_URL}/api/equipment?location_id=${locationId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        // Directly set the response, as the API now returns a pre-built tree
        const tree: EquipmentNode[] = await response.json();
        setEquipmentTree(tree);

      } catch (err: unknown) {
        console.error("Failed to fetch equipment:", err);
        setError(`Error: Could not load equipment data.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipmentTree();
  }, [locationId]);

  return { equipmentTree, isLoading, error };
};