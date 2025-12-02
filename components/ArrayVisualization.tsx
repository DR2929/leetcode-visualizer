"use client";

interface ArrayVisualizationProps {
  array: any[];
  currentIndex?: number;
  leftIndex?: number;
  rightIndex?: number;
  arrayName?: string;
}

export default function ArrayVisualization({
  array,
  currentIndex,
  leftIndex,
  rightIndex,
  arrayName = "Array",
}: ArrayVisualizationProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {arrayName}
      </div>
      <div className="flex gap-2 items-end">
        {array.map((val, idx) => {
          const isCurrent = idx === currentIndex;
          const isLeft = idx === leftIndex;
          const isRight = idx === rightIndex;
          const isHighlighted = isCurrent || isLeft || isRight;

          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 font-mono text-sm font-semibold transition-all ${
                  isCurrent
                    ? "bg-yellow-200 dark:bg-yellow-900 border-yellow-500 dark:border-yellow-400 shadow-lg scale-110"
                    : isLeft
                    ? "bg-blue-200 dark:bg-blue-900 border-blue-500 dark:border-blue-400"
                    : isRight
                    ? "bg-green-200 dark:bg-green-900 border-green-500 dark:border-green-400"
                    : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                }`}
              >
                {val}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                [{idx}]
              </div>
              {(isCurrent || isLeft || isRight) && (
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {isCurrent && "i"}
                  {isLeft && "left"}
                  {isRight && "right"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

