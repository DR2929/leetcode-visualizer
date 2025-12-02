"use client";

import { ExplanationData, UserMode } from "@/types";

interface ExplanationPanelProps {
  data: ExplanationData;
  mode: UserMode;
}

export default function ExplanationPanel({ data, mode }: ExplanationPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Explanation
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Intuition
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {data.intuition}
          </p>
        </div>

        {data.code && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Code
            </h3>
            <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto text-xs">
              <code className="text-gray-800 dark:text-gray-200">{data.code}</code>
            </pre>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Line-by-Line Explanation
          </h3>
          <div className="space-y-3">
            {data.code_explanation.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border-l-4 border-blue-500"
              >
                <div className="font-mono text-xs text-blue-600 dark:text-blue-400 mb-1">
                  Line {item.line}: {item.code}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {item.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {mode === "beginner" && data.syntax_tips && data.syntax_tips.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Syntax Tips
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {data.syntax_tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Complexity Analysis
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Time Complexity:
              </span>{" "}
              <span className="font-mono text-blue-600 dark:text-blue-400">
                {data.complexity.time}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Space Complexity:
              </span>{" "}
              <span className="font-mono text-blue-600 dark:text-blue-400">
                {data.complexity.space}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {data.complexity.reasoning}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

