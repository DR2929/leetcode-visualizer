"use client";

import { Step } from "@/types";
import ArrayVisualization from "./ArrayVisualization";
import HashMapVisualization from "./HashMapVisualization";

interface StepVisualizationProps {
  step: Step;
}

export default function StepVisualization({ step }: StepVisualizationProps) {
  const { variables } = step;

  // Find index variables and related scalar variables FIRST (needed for array detection)
  const indexVars: Record<string, number> = {};
  const scalarVars: Record<string, any> = {};
  
  Object.entries(variables).forEach(([key, value]) => {
    // Index variables
    if (
      (key === "i" ||
        key === "j" ||
        key === "index" ||
        key === "left" ||
        key === "right" ||
        key === "start" ||
        key === "end") &&
      typeof value === "number"
    ) {
      indexVars[key] = value as number;
    }
    // Scalar variables that might be related to arrays (current element, target, etc.)
    else if (
      typeof value !== "object" &&
      (key === "num" ||
        key === "target" ||
        key === "sum" ||
        key === "complement" ||
        key === "val" ||
        key === "value" ||
        key === "current")
    ) {
      scalarVars[key] = value;
    }
  });

  // Find array variables (comprehensive detection - check for ANY array)
  const arrayVars = Object.entries(variables).filter(([key, value]) => {
    // First check if it's actually an array
    if (!Array.isArray(value)) return false;
    
    const keyLower = key.toLowerCase();
    // Check if key matches common array patterns, OR if it's any array (fallback)
    return (
      keyLower.includes("array") ||
      keyLower.includes("nums") ||
      keyLower.includes("arr") ||
      keyLower.includes("list") ||
      keyLower.includes("string") ||
      keyLower === "s" ||
      keyLower === "str" ||
      // Fallback: if it's an array and not a known object type, treat it as an array
      (Array.isArray(value) && value.length > 0 && typeof value[0] !== "object")
    );
  });
  
  // If no array found with name matching, but we have index variables, 
  // look for ANY array in variables (GPT might use unexpected names)
  if (arrayVars.length === 0 && (indexVars.i !== undefined || indexVars.index !== undefined)) {
    const anyArray = Object.entries(variables).find(([_, value]) => Array.isArray(value));
    if (anyArray) {
      arrayVars.push(anyArray);
    }
  }

  // Find hash map variables
  const mapVars = Object.entries(variables).filter(([key, value]) => {
    const keyLower = key.toLowerCase();
    return (
      (keyLower.includes("map") ||
        keyLower.includes("dict") ||
        keyLower.includes("hash") ||
        keyLower.includes("set")) &&
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    );
  });

  return (
    <div className="space-y-6">
      {/* Array Visualizations */}
      {arrayVars.map(([arrayName, arrayValue]) => {
        const arr = arrayValue as any[];
        const currentIdx = indexVars.i ?? indexVars.index;
        return (
          <div key={arrayName} className="space-y-3">
            <ArrayVisualization
              array={arr}
              currentIndex={currentIdx}
              leftIndex={indexVars.left ?? indexVars.start}
              rightIndex={indexVars.right ?? indexVars.end}
              arrayName={arrayName}
            />
            {/* Show current element if we have an index and a related scalar variable */}
            {currentIdx !== undefined && currentIdx >= 0 && currentIdx < arr.length && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                  Current Element
                </div>
                <div className="flex items-center gap-2">
                  {Object.entries(scalarVars).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-1">
                      <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {key}:
                      </span>
                      <span className="font-mono text-sm text-gray-800 dark:text-gray-200">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                  {Object.keys(scalarVars).length === 0 && (
                    <span className="font-mono text-sm text-gray-800 dark:text-gray-200">
                      arr[{currentIdx}] = {arr[currentIdx]}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Show warning if we have index but no array - this shouldn't happen with proper GPT prompts */}
      {arrayVars.length === 0 && (indexVars.i !== undefined || indexVars.index !== undefined) && (
        <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
          <div className="font-semibold mb-1">⚠️ Array data missing</div>
          <div className="text-xs">
            The step has index variables (i={indexVars.i ?? indexVars.index}) but no array was found.
            This usually means the GPT didn't include the array in step variables. Try regenerating the explanation.
          </div>
        </div>
      )}

      {/* Hash Map Visualizations */}
      {mapVars.map(([mapName, mapValue]) => (
        <HashMapVisualization
          key={mapName}
          map={mapValue as Record<string, any>}
          mapName={mapName}
        />
      ))}

      {/* Other Variables */}
      {Object.entries(variables)
        .filter(([key, value]) => {
          const keyLower = key.toLowerCase();
          const isArray =
            keyLower.includes("array") ||
            keyLower.includes("nums") ||
            keyLower.includes("arr") ||
            keyLower.includes("list") ||
            keyLower.includes("string") ||
            keyLower === "s" ||
            keyLower === "str";
          const isMap =
            keyLower.includes("map") ||
            keyLower.includes("dict") ||
            keyLower.includes("hash") ||
            keyLower.includes("set");
          const isIndex =
            key === "i" ||
            key === "j" ||
            key === "index" ||
            key === "left" ||
            key === "right" ||
            key === "start" ||
            key === "end";
          const isScalar =
            key === "num" ||
            key === "target" ||
            key === "sum" ||
            key === "complement" ||
            key === "val" ||
            key === "value" ||
            key === "current";
          // Only show in "Other Variables" if it's not an array, map, index, or scalar (scalars shown with arrays)
          return !isArray && !isMap && !isIndex && !isScalar;
        })
        .length > 0 && (
        <div>
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Other Variables
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
            {Object.entries(variables)
              .filter(([key, value]) => {
                const keyLower = key.toLowerCase();
                const isArray =
                  keyLower.includes("array") ||
                  keyLower.includes("nums") ||
                  keyLower.includes("arr") ||
                  keyLower.includes("list") ||
                  keyLower.includes("string") ||
                  keyLower === "s" ||
                  keyLower === "str";
                const isMap =
                  keyLower.includes("map") ||
                  keyLower.includes("dict") ||
                  keyLower.includes("hash") ||
                  keyLower.includes("set");
                const isIndex =
                  key === "i" ||
                  key === "j" ||
                  key === "index" ||
                  key === "left" ||
                  key === "right" ||
                  key === "start" ||
                  key === "end";
                const isScalar =
                  key === "num" ||
                  key === "target" ||
                  key === "sum" ||
                  key === "complement" ||
                  key === "val" ||
                  key === "value" ||
                  key === "current";
                return !isArray && !isMap && !isIndex && !isScalar;
              })
              .map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {key}:
                  </span>
                  <span className="font-mono text-sm text-gray-800 dark:text-gray-200">
                    {typeof value === "object" && value !== null
                      ? JSON.stringify(value)
                      : String(value)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

