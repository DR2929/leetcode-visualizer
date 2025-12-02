"use client";

import { useState } from "react";
import { ExplanationData } from "@/types";
import StepVisualization from "./StepVisualization";

interface VisualizerProps {
  data: ExplanationData;
}

export default function Visualizer({ data }: VisualizerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = data.steps || [];
  const currentStepData = steps[currentStep];

  const handleStepChange = (step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, steps.length - 1)));
  };

  if (steps.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <p className="text-gray-600 dark:text-gray-400">No visualization data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Step-by-Step Visualization
      </h2>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400 text-right max-w-md">
            {currentStepData?.description}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max={steps.length - 1}
          value={currentStep}
          onChange={(e) => handleStepChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex justify-between mt-2">
          <button
            onClick={() => handleStepChange(currentStep - 1)}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={() => handleStepChange(currentStep + 1)}
            disabled={currentStep === steps.length - 1}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="mt-6">
        {currentStepData ? (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700">
            <StepVisualization step={currentStepData} />
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No data for this step</p>
        )}
      </div>
    </div>
  );
}
