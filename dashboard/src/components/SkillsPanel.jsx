export default function SkillsPanel({ skills }) {
  return (
    <aside className="bg-black min-h-[620px] flex flex-col">
      <div className="border-b border-[#00ff88]/40 p-4">
        <p className="text-xs text-cyan-300 tracking-[0.3em] uppercase">
          Skill Registry
        </p>

        <h2 className="text-2xl font-black tracking-[0.18em] mt-2">
          ROUTERS
        </h2>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {skills.length === 0 ? (
          <div className="border border-[#00ff88]/30 p-4 text-[#007a43] text-sm">
            No skills detected in skills/.
          </div>
        ) : (
          <div className="space-y-4">
            {skills.map((skill) => (
              <article
                key={skill.name}
                className="border border-[#00ff88]/35 bg-black"
              >
                <div className="flex items-center justify-between border-b border-[#00ff88]/30 p-3">
                  <h3 className="text-[#00ff88] text-lg font-black tracking-[0.14em] uppercase">
                    {skill.name}
                  </h3>

                  <span className="border border-[#00ff88]/60 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#00ff88]">
                    active
                  </span>
                </div>

                <div className="p-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 mb-3">
                    Trigger Words
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {(skill.trigger_words || []).length === 0 ? (
                      <span className="text-[#007a43] text-xs">
                        No triggers found.
                      </span>
                    ) : (
                      skill.trigger_words.map((trigger) => (
                        <span
                          key={`${skill.name}-${trigger}`}
                          className="border border-cyan-300/50 px-2 py-1 text-[11px] text-cyan-300 bg-black uppercase tracking-[0.08em]"
                        >
                          {trigger}
                        </span>
                      ))
                    )}
                  </div>

                  <div className="mt-4 text-[10px] text-[#007a43] tracking-[0.12em] truncate">
                    {skill.path}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[#00ff88]/40 p-4 text-xs uppercase tracking-[0.2em]">
        <div className="flex justify-between mb-2">
          <span className="text-cyan-300">Loaded</span>
          <span>{skills.length}</span>
        </div>

        <div className="h-2 border border-[#00ff88]/50">
          <div
            className="h-full bg-[#00ff88]"
            style={{
              width: `${Math.min(100, Math.max(8, skills.length * 25))}%`,
            }}
          />
        </div>
      </div>
    </aside>
  );
}