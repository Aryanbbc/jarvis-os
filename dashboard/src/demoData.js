export const demoMetrics = {
  total_word_count: 135000,
  file_count: 202,
  readable_file_count: 202,
  last_5_modified_files: [
    {
      name: "2026-06-16-ai-engineer-roadmap.md",
      path: "reports/2026-06-16-ai-engineer-roadmap.md",
      modified_at: "2026-06-16T18:45:00",
      size_bytes: 4200
    },
    {
      name: "2026-06-16-python-calculator.md",
      path: "reports/2026-06-16-python-calculator.md",
      modified_at: "2026-06-16T18:38:00",
      size_bytes: 2100
    },
    {
      name: "2026-06-16-daily-brief.md",
      path: "daily/2026-06-16.md",
      modified_at: "2026-06-16T18:20:00",
      size_bytes: 1800
    }
  ]
};

export const demoSkills = [
  {
    name: "coding",
    trigger_words: ["code", "build", "fix", "debug", "create", "implement", "setup"]
  },
  {
    name: "daily-brief",
    trigger_words: ["today", "schedule", "agenda", "tasks", "daily brief"]
  },
  {
    name: "research",
    trigger_words: ["find", "search", "research", "investigate", "compare", "summarize"]
  }
];

export const demoRecent = [
  {
    title: "AI Engineer Roadmap",
    date: "2026-06-16",
    path: "reports/2026-06-16-ai-engineer-roadmap.md",
    preview: "A practical roadmap for becoming an AI engineer with projects, DSA, ML basics, and portfolio strategy."
  },
  {
    title: "Python Calculator",
    date: "2026-06-16",
    path: "reports/2026-06-16-python-calculator.md",
    preview: "A simple Python calculator with add, subtract, multiply, divide, and input validation."
  },
  {
    title: "Daily Brief",
    date: "2026-06-16",
    path: "daily/2026-06-16.md",
    preview: "Today’s focus: build Jarvis OS foundation, connect skills, vault memory, dashboard, and voice."
  }
];

export function demoCommandReply(command) {
  return `Demo response for: "${command}". In local mode, this command is routed through Ollama, saved into the vault, and appears in memory feed.`;
}
