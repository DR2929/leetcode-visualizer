"use client";

import { useState, useEffect, useRef } from "react";
import { UserMode, ExplanationData } from "@/types";

interface Problem {
  id: number;
  problem_number: number;
  title: string;
  slug: string;
  difficulty: string;
}

interface InputPanelProps {
  onGenerate: (data: ExplanationData) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  mode: UserMode;
  setMode: (mode: UserMode) => void;
}

export default function InputPanel({
  onGenerate,
  loading,
  setLoading,
  mode,
  setMode,
}: InputPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [suggestions, setSuggestions] = useState<Problem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [language, setLanguage] = useState<"python" | "java" | "cpp">("python");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const debounceTimer = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, 300);

      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions([]);
      setSelectedProblem(null);
    }
  }, [searchQuery]);

  // Auto-select if there's exactly one suggestion that matches well
  useEffect(() => {
    if (suggestions.length === 1 && !selectedProblem) {
      const queryLower = searchQuery.toLowerCase();
      const suggestion = suggestions[0];
      const suggestionText = `${suggestion.problem_number} ${suggestion.title}`.toLowerCase();
      
      // Auto-select if query matches problem number or title closely
      if (
        searchQuery === String(suggestion.problem_number) ||
        queryLower === suggestion.title.toLowerCase() ||
        suggestionText.includes(queryLower)
      ) {
        setSelectedProblem(suggestion);
        setSearchQuery(`${suggestion.problem_number}. ${suggestion.title}`);
        setShowSuggestions(false);
      }
    }
  }, [suggestions, searchQuery, selectedProblem]);

  const fetchSuggestions = async (query: string) => {
    try {
      const response = await fetch(`/api/problems?q=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleProblemSelect = (problem: Problem) => {
    setSelectedProblem(problem);
    setSearchQuery(`${problem.problem_number}. ${problem.title}`);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If no problem selected, try to find one from suggestions or search by number
    let problemToUse = selectedProblem;
    
    if (!problemToUse) {
      // Try to find exact match in suggestions
      const exactMatch = suggestions.find(
        (p) =>
          searchQuery === String(p.problem_number) ||
          searchQuery.toLowerCase() === p.title.toLowerCase()
      );
      
      if (exactMatch) {
        problemToUse = exactMatch;
      } else if (suggestions.length === 1) {
        // Use the only suggestion
        problemToUse = suggestions[0];
      } else {
        // Try to fetch by problem number if search query is a number
        const problemNum = parseInt(searchQuery.trim());
        if (!isNaN(problemNum)) {
          try {
            const response = await fetch(`/api/problems/${problemNum}`);
            if (response.ok) {
              const data = await response.json();
              problemToUse = {
                id: data.id,
                problem_number: data.problem_number,
                title: data.title,
                slug: data.slug,
                difficulty: data.difficulty,
              };
            }
          } catch (error) {
            console.error("Error fetching problem:", error);
          }
        }
      }
    }
    
    if (!problemToUse) {
      alert("Please select a LeetCode problem from the dropdown");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemNumber: problemToUse.problem_number,
          language,
          mode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate explanation");
      }

      const data: ExplanationData = await response.json();
      onGenerate(data);
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Failed to generate explanation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-600 dark:text-green-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "hard":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            LeetCode Problem
          </label>
          <div className="relative" ref={dropdownRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value) {
                  setSelectedProblem(null);
                }
              }}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              placeholder="Search by problem number or title (e.g., '1' or 'Two Sum')"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                {suggestions.map((problem) => (
                  <div
                    key={problem.id}
                    onClick={() => handleProblemSelect(problem)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {problem.problem_number}. {problem.title}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-medium ${getDifficultyColor(
                          problem.difficulty
                        )}`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedProblem && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selected:{" "}
              <a
                href={selectedProblem.slug ? `https://leetcode.com/problems/${selectedProblem.slug}/` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {selectedProblem.problem_number}. {selectedProblem.title}
              </a>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Solution Language
          </label>
          <div className="flex gap-4">
            {(["python", "java", "cpp"] as const).map((lang) => (
              <label key={lang} className="flex items-center">
                <input
                  type="radio"
                  name="language"
                  value={lang}
                  checked={language === lang}
                  onChange={(e) => setLanguage(e.target.value as typeof language)}
                  className="mr-2"
                />
                <span className="capitalize text-sm text-gray-700 dark:text-gray-300">
                  {lang === "cpp" ? "C++" : lang}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Learning Mode
          </label>
          <div className="flex gap-4">
            {(["beginner", "intermediate", "advanced"] as UserMode[]).map((m) => (
              <label key={m} className="flex items-center">
                <input
                  type="radio"
                  name="mode"
                  value={m}
                  checked={mode === m}
                  onChange={(e) => setMode(e.target.value as UserMode)}
                  className="mr-2"
                />
                <span className="capitalize text-sm text-gray-700 dark:text-gray-300">
                  {m}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || (!selectedProblem && suggestions.length === 0 && searchQuery.trim().length === 0)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading
            ? "Generating Solution & Explanation..."
            : "Generate Solution & Visualize"}
        </button>
      </form>
    </div>
  );
}
