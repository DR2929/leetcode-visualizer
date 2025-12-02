"use client";

import { useState } from "react";
import InputPanel from "@/components/InputPanel";
import ProblemInfo from "@/components/ProblemInfo";
import Visualizer from "@/components/Visualizer";
import ExplanationPanel from "@/components/ExplanationPanel";
import { ExplanationData } from "@/types";

export default function Home() {
  const [explanationData, setExplanationData] = useState<ExplanationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"beginner" | "intermediate" | "advanced">("intermediate");

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            LeetCode Visualizer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Turn any LeetCode solution into an interactive explanation
          </p>
        </header>

        <InputPanel
          onGenerate={setExplanationData}
          loading={loading}
          setLoading={setLoading}
          mode={mode}
          setMode={setMode}
        />

        {explanationData && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ProblemInfo data={explanationData} />
            </div>
            <div className="lg:col-span-1">
              <Visualizer data={explanationData} />
            </div>
            <div className="lg:col-span-1">
              <ExplanationPanel data={explanationData} mode={mode} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

