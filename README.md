# LeetCode Visualizer

Turn any LeetCode solution into an interactive explanation with diagrams, step-by-step execution, and topic/pattern/algorithm breakdown — tailored to your level.

## Features

- **Database of LeetCode Problems**: Search and select from 200+ LeetCode problems
- **AI-Generated Optimal Solutions**: GPT generates the most optimized solution for any problem
- **Interactive React/SVG Visualizations**: Dynamic step-by-step visualizations rendered with React and CSS
- **Smart Data Structure Rendering**: Automatically visualizes arrays, hash maps, pointers, and more
- **Image Storage**: Optional image generation and caching system for future use
- **Three Learning Modes**: Beginner, Intermediate, and Advanced explanations
- **Comprehensive Breakdown**: 
  - Topic identification (Arrays, DP, Trees, Graphs...)
  - Pattern recognition (Two pointers, sliding window, binary search...)
  - Algorithm explanation (DFS, BFS, KMP, Dijkstra, etc.)
- **Code Analysis**: Line-by-line explanations with syntax tips for beginners
- **Complexity Analysis**: Time and space complexity with intuitive reasoning
- **Multi-Language Support**: Python, Java, and C++ solutions

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key (required for solution generation)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up OpenAI API key:
```bash
# Create a .env.local file in the root directory
# Add the following line:
OPENAI_API_KEY=your_api_key_here
```

3. Seed the database with LeetCode problems:
```bash
npm run db:seed
```

   This will fetch and store the first 200 LeetCode problems in the database. The process may take a few minutes due to rate limiting.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Select a LeetCode Problem**:
   - Type a problem number (e.g., "1") or problem title (e.g., "Two Sum") in the search box
   - Select from the dropdown suggestions
   - The app will show the problem difficulty and link

2. **Choose Solution Language**:
   - Select Python, Java, or C++

3. **Select Learning Mode**:
   - **Beginner**: More focus on basic syntax and detailed explanations
   - **Intermediate**: Emphasis on patterns and algorithm intuition
   - **Advanced**: Brief pattern callout and complexity analysis

4. **Click "Generate Solution & Visualize"**:
   - GPT will generate an optimal solution for the selected problem
   - The app will create step-by-step explanations with variable states
   - Navigate through steps using the slider or buttons
   - View dynamic React/SVG visualizations of:
     - Arrays with highlighted indices (i, left, right pointers)
     - Hash maps with key-value pairs
     - Other variables and data structures
   - Read line-by-line code explanations
   - Understand time and space complexity

## How It Works

1. **Problem Selection**: User selects a LeetCode problem from the database
2. **Solution Generation**: GPT generates an optimal solution in the selected language
3. **Explanation Generation**: GPT creates structured explanations with step-by-step variable states
4. **Visualization Rendering**: React components dynamically render visualizations from step data:
   - Arrays with index highlighting
   - Hash maps with key-value displays
   - Pointer tracking (i, left, right, etc.)
5. **Caching**: Solutions and explanations are cached to minimize API costs
6. **Interactive Navigation**: Users can step through the algorithm execution visually

## Database Schema

The app uses SQLite to store:

- **Problems**: LeetCode problem metadata (number, title, difficulty, topics, etc.)
- **Explanations**: Generated solutions and explanations (cached by problem, language, and mode)
- **Images**: Optional image storage (for future export/sharing features)

## Project Structure

```
Algorithm_visualizer/
├── app/
│   ├── api/
│   │   ├── explain/
│   │   │   └── route.ts          # Generate solutions & explanations
│   │   ├── problems/
│   │   │   ├── route.ts          # Search problems
│   │   │   └── [number]/
│   │   │       └── route.ts      # Get problem by number
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page component
├── components/
│   ├── InputPanel.tsx            # Problem search & selection
│   ├── ProblemInfo.tsx           # Problem metadata and tags
│   ├── Visualizer.tsx            # Step-by-step visualization
│   └── ExplanationPanel.tsx      # Code explanations and complexity
├── lib/
│   └── db.ts                     # Database utilities
├── scripts/
│   └── seed-leetcode.ts          # Seed LeetCode problems
├── types/
│   └── index.ts                  # TypeScript type definitions
└── data/
    └── leetcode.db               # SQLite database (created automatically)
```

## API Integration

### OpenAI API

The app uses OpenAI's API for:
- **Solution Generation**: GPT-4o-mini generates optimal solutions
- **Explanation Generation**: Structured JSON explanations with step-by-step variable states

### Visualization System

- **React Components**: Dynamic visualizations rendered from step data
- **Array Visualization**: Shows arrays with highlighted indices and pointer tracking
- **Hash Map Visualization**: Displays key-value pairs in a structured format
- **Automatic Detection**: Intelligently detects and visualizes data structures from step variables

### Cost Optimization

- **Caching**: All generated solutions and explanations are cached in the database
- **Database Lookup**: Before generating, the app checks if data already exists
- **No Image API Costs**: Uses React/SVG visualizations instead of DALL-E, eliminating image generation costs

## Database Seeding

To seed more problems or update existing ones:

```bash
npm run db:seed
```

The script will:
- Fetch problems from LeetCode's GraphQL API
- Store problem metadata in the database
- Skip problems that already exist
- Rate limit requests to avoid API throttling

## Environment Variables

Create a `.env.local` file with:

```env
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Enable DALL-E image generation (disabled by default)
# GENERATE_IMAGES=true

# Optional: Use cached images if available (disabled by default)
# USE_CACHED_IMAGES=true
```

## Future Enhancements

- Browser extension for LeetCode
- Language switching (show equivalent solutions side-by-side)
- Practice mode (hide code, show visual, ask user to fill missing lines)
- Pattern navigator (show all problems of a specific pattern)
- Error explainer (explain why code fails and which edge cases it misses)
- Brave Search API integration for additional problem context

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (better-sqlite3)
- **LLM**: OpenAI API (GPT-4o-mini for text, DALL-E 3 for images)

## License

MIT
