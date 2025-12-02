"use client";

interface HashMapVisualizationProps {
  map: Record<string, any>;
  mapName?: string;
}

export default function HashMapVisualization({
  map,
  mapName = "Hash Map",
}: HashMapVisualizationProps) {
  const entries = Object.entries(map);

  if (entries.length === 0) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {mapName}
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 text-center text-sm text-gray-500 dark:text-gray-400">
          Empty
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {mapName}
      </div>
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-600">
        <div className="grid grid-cols-1 gap-2">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
            >
              <div className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400 min-w-[60px]">
                {key}
              </div>
              <div className="text-gray-400 dark:text-gray-500">→</div>
              <div className="font-mono text-sm text-gray-800 dark:text-gray-200">
                {typeof value === "object" ? JSON.stringify(value) : String(value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

