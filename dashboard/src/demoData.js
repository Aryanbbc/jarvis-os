export const demoMetrics = {
  total_word_count: 135000,
  file_count: 202,
  readable_file_count: 202,
  last_5_modified_files: [
    {
      name: "ai-engineer-roadmap.md",
      path: "reports/ai-engineer-roadmap.md",
      modified_at: "2026-06-16",
      size_bytes: 4200,
    },
    {
      name: "python-calculator.md",
      path: "reports/python-calculator.md",
      modified_at: "2026-06-16",
      size_bytes: 2100,
    },
    {
      name: "daily-brief.md",
      path: "daily/2026-06-16.md",
      modified_at: "2026-06-16",
      size_bytes: 1800,
    },
  ],
};

export const demoSkills = [
  {
    name: "coding",
    trigger_words: ["code", "build", "fix", "debug", "create", "implement", "setup"],
  },
  {
    name: "daily-brief",
    trigger_words: ["today", "schedule", "agenda", "tasks", "daily brief"],
  },
  {
    name: "research",
    trigger_words: ["find", "search", "research", "investigate", "compare", "summarize"],
  },
];

export const demoRecent = [
  {
    title: "AI Engineer Roadmap",
    date: "2026-06-16",
    path: "reports/ai-engineer-roadmap.md",
    preview: "A practical roadmap for becoming an AI engineer with projects, DSA, ML basics, and portfolio strategy.",
  },
  {
    title: "Python Calculator",
    date: "2026-06-16",
    path: "reports/python-calculator.md",
    preview: "A simple Python calculator with add, subtract, multiply, divide, and input validation.",
  },
  {
    title: "Daily Brief",
    date: "2026-06-16",
    path: "daily/2026-06-16.md",
    preview: "Today’s focus: Jarvis OS foundation, skills, vault memory, dashboard, and voice.",
  },
];

export function demoCommandReply(command) {
  return `Demo response for: "${command}". In local mode, this command routes through Ollama, saves into the vault, and appears in the memory feed.`;
}
