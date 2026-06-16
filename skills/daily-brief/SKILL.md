# Daily Brief Skill

## Description
Use this skill when the user asks Jarvis OS about today, schedule, plans, priorities, daily notes, or what is happening.

## Trigger Words
- today
- schedule
- what's on
- what is on
- daily brief
- plan
- agenda
- tasks
- priorities
- morning
- evening
- recap

## Steps
1. Read the current daily note from `vault/daily/`.
2. If today's note exists, summarize it.
3. If today's note does not exist, create a new daily note.
4. Extract tasks, reminders, goals, notes, and priorities.
5. Present the daily brief clearly.
6. Add any new user instructions or updates to the daily note.
7. Update `vault/index.md` with the daily note link and word count.

## Output Format

# Daily Brief: <YYYY-MM-DD>

## Today’s Focus
<Main priority>

## Schedule
- <Time> — <Event>

## Tasks
- [ ] <Task 1>
- [ ] <Task 2>

## Notes
- <Important note>

## Suggested Next Actions
- <Action 1>
- <Action 2>

## Where To Save In Vault
Save daily notes to:

vault/daily/<YYYY-MM-DD>.md