"use client";

import { ExplanationData } from "@/types";

interface ProblemInfoProps {
  data: ExplanationData;
}

export default function ProblemInfo({ data }: ProblemInfoProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-fit">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {data.problem_title || "Problem Information"}
      </h2>

      {data.problem_description && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Description
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.problem_description}
          </p>
        </div>
      )}

      {data.constraints && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Constraints
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
            {data.constraints}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Topic
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.topic.map((t, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Pattern
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.pattern.map((p, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Algorithm
          </h3>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium">
            {data.algorithm}
          </span>
        </div>
      </div>
    </div>
  );
}

