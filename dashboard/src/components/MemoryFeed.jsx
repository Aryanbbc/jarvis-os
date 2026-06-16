export default function MemoryFeed({ entries }) {
  const feed = entries.length > 0 ? [...entries, ...entries] : [];

  return (
    <footer className="h-24 border-t border-[#00ff88]/40 bg-black overflow-hidden">
      <div className="h-8 border-b border-[#00ff88]/40 flex items-center px-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300">
          Live Memory Feed
        </p>
      </div>

      <div className="relative h-16 flex items-center overflow-hidden">
        {feed.length === 0 ? (
          <p className="px-4 text-sm text-[#007a43]">
            No recent memory entries found.
          </p>
        ) : (
          <div className="flex gap-4 whitespace-nowrap animate-[vaultScroll_38s_linear_infinite]">
            {feed.map((entry, index) => (
              <div
                key={`${entry.path}-${index}`}
                className="border-r border-[#00ff88]/40 px-6 min-w-[420px]"
              >
                <span className="text-[#00ff88] text-xs uppercase tracking-[0.12em] mr-3">
                  {entry.date}
                </span>

                <span className="text-cyan-300 text-xs uppercase tracking-[0.12em] mr-3">
                  {entry.title}
                </span>

                <span className="text-[#007a43] text-xs">
                  {entry.preview}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes vaultScroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </footer>
  );
}