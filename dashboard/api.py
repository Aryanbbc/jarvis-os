import os
import re
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parents[1]
ENV_PATH = BASE_DIR / ".env"

load_dotenv(ENV_PATH)

VAULT_PATH = Path(os.getenv("VAULT_PATH", "./vault"))
SKILLS_PATH = Path(os.getenv("SKILLS_PATH", "./skills"))

if not VAULT_PATH.is_absolute():
    VAULT_PATH = BASE_DIR / VAULT_PATH

if not SKILLS_PATH.is_absolute():
    SKILLS_PATH = BASE_DIR / SKILLS_PATH

REPORTS_DIR = VAULT_PATH / "reports"

VAULT_PATH.mkdir(parents=True, exist_ok=True)
SKILLS_PATH.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


app = FastAPI(
    title="Jarvis OS Dashboard API",
    version="1.0.0",
    description="Local dashboard API for jarvis-os vault and skills.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VaultSaveRequest(BaseModel):
    title: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)


def now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def today_str() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def slugify(text: str, max_len: int = 80) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"-+", "-", text)
    text = text.strip("-")

    if not text:
        text = "untitled"

    return text[:max_len].strip("-") or "untitled"


def safe_read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        try:
            return path.read_text(encoding="latin-1")
        except Exception:
            return ""
    except Exception:
        return ""


def count_words(text: str) -> int:
    return len(re.findall(r"\b\w+\b", text))


def get_all_vault_files() -> List[Path]:
    if not VAULT_PATH.exists():
        return []

    return [
        path
        for path in VAULT_PATH.rglob("*")
        if path.is_file() and not path.name.startswith(".")
    ]


def relative_to_base(path: Path, base: Path) -> str:
    try:
        return path.relative_to(base).as_posix()
    except ValueError:
        return path.as_posix()


def file_modified_iso(path: Path) -> str:
    return datetime.fromtimestamp(path.stat().st_mtime).isoformat(timespec="seconds")


def extract_title(content: str, fallback: str) -> str:
    for line in content.splitlines():
        stripped = line.strip()

        if stripped.startswith("#"):
            title = stripped.lstrip("#").strip()

            if title:
                return title

    return fallback


def extract_date_from_filename(path: Path) -> str:
    match = re.search(r"\d{4}-\d{2}-\d{2}", path.name)

    if match:
        return match.group(0)

    return datetime.fromtimestamp(path.stat().st_mtime).strftime("%Y-%m-%d")


def make_preview(content: str, limit: int = 100) -> str:
    clean = re.sub(r"\s+", " ", content).strip()
    return clean[:limit]


def parse_trigger_words(skill_content: str) -> List[str]:
    triggers: List[str] = []

    match = re.search(
        r"##\s*Trigger Words\s*(.*?)(?:\n##\s|\Z)",
        skill_content,
        flags=re.IGNORECASE | re.DOTALL,
    )

    if not match:
        return triggers

    block = match.group(1)

    for line in block.splitlines():
        stripped = line.strip()

        if stripped.startswith("-"):
            trigger = stripped.lstrip("-").strip()

            if trigger:
                triggers.append(trigger)

    return triggers


def unique_report_path(title: str) -> Path:
    date = today_str()
    slug = slugify(title)
    path = REPORTS_DIR / f"{date}-{slug}.md"

    counter = 2

    while path.exists():
        path = REPORTS_DIR / f"{date}-{slug}-{counter}.md"
        counter += 1

    return path


@app.get("/")
def root() -> Dict[str, Any]:
    return {
        "app": "jarvis-os-dashboard-api",
        "status": "running",
        "time": now_iso(),
    }


@app.get("/metrics")
def get_metrics() -> Dict[str, Any]:
    files = get_all_vault_files()

    total_word_count = 0
    readable_file_count = 0

    for file_path in files:
        content = safe_read_text(file_path)

        if content:
            readable_file_count += 1
            total_word_count += count_words(content)

    last_modified = sorted(
        files,
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )[:5]

    last_5_modified_files = [
        {
            "name": path.name,
            "path": relative_to_base(path, VAULT_PATH),
            "modified_at": file_modified_iso(path),
            "size_bytes": path.stat().st_size,
        }
        for path in last_modified
    ]

    return {
        "vault_path": str(VAULT_PATH),
        "total_word_count": total_word_count,
        "file_count": len(files),
        "readable_file_count": readable_file_count,
        "last_5_modified_files": last_5_modified_files,
    }


@app.get("/skills")
def get_skills() -> Dict[str, Any]:
    skills: List[Dict[str, Any]] = []

    if not SKILLS_PATH.exists():
        return {
            "skills_path": str(SKILLS_PATH),
            "count": 0,
            "skills": [],
        }

    for skill_file in sorted(SKILLS_PATH.glob("*/SKILL.md")):
        content = safe_read_text(skill_file)
        skill_name = skill_file.parent.name
        trigger_words = parse_trigger_words(content)

        skills.append(
            {
                "name": skill_name,
                "path": relative_to_base(skill_file, BASE_DIR),
                "trigger_words": trigger_words,
            }
        )

    return {
        "skills_path": str(SKILLS_PATH),
        "count": len(skills),
        "skills": skills,
    }


@app.get("/vault/recent")
def get_recent_vault_entries() -> Dict[str, Any]:
    files = get_all_vault_files()

    markdown_files = [
        path
        for path in files
        if path.suffix.lower() in {".md", ".txt"}
    ]

    recent_files = sorted(
        markdown_files,
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )[:5]

    entries: List[Dict[str, Any]] = []

    for path in recent_files:
        content = safe_read_text(path)
        title = extract_title(content, path.stem)
        date = extract_date_from_filename(path)

        entries.append(
            {
                "title": title,
                "date": date,
                "path": relative_to_base(path, VAULT_PATH),
                "preview": make_preview(content, 100),
                "modified_at": file_modified_iso(path),
                "word_count": count_words(content),
            }
        )

    return {
        "count": len(entries),
        "entries": entries,
    }


@app.post("/vault/save")
def save_to_vault(payload: VaultSaveRequest) -> Dict[str, Any]:
    title = payload.title.strip()
    content = payload.content.strip()

    if not title:
        raise HTTPException(status_code=400, detail="Title cannot be empty.")

    if not content:
        raise HTTPException(status_code=400, detail="Content cannot be empty.")

    path = unique_report_path(title)

    markdown = f"""# {title}

Date: {today_str()}
Created: {now_iso()}

## Content

{content}
"""

    path.write_text(markdown, encoding="utf-8")

    return {
        "status": "saved",
        "title": title,
        "date": today_str(),
        "path": relative_to_base(path, VAULT_PATH),
        "absolute_path": str(path),
        "word_count": count_words(markdown),
        "preview": make_preview(markdown, 100),
    }
class CommandRequest(BaseModel):
    command: str = Field(..., min_length=1)


def call_ollama(prompt: str) -> str:
    import requests

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "gemma3:1b",
                "prompt": prompt,
                "stream": False,
            },
            timeout=180,
        )
        response.raise_for_status()
        data = response.json()
        return data.get("response", "").strip() or "Local model returned no response."

    except requests.exceptions.ConnectionError:
        return "Ollama is not running. Open the Ollama app and try again."

    except Exception as exc:
        return f"Ollama error: {exc}"


def detect_skill(command: str) -> str:
    lowered = command.lower()

    if any(word in lowered for word in ["find", "search", "research", "investigate", "look up"]):
        return "research"

    if any(word in lowered for word in ["code", "build", "fix", "debug", "create", "implement"]):
        return "coding"

    if any(word in lowered for word in ["today", "schedule", "agenda", "tasks", "daily brief"]):
        return "daily-brief"

    return "general"


@app.post("/command")
def run_command(payload: CommandRequest) -> Dict[str, Any]:
    command = payload.command.strip()

    if not command:
        raise HTTPException(status_code=400, detail="Command cannot be empty.")

    skill = detect_skill(command)

    system_prompt = f"""
You are Jarvis OS, a local AI operating system assistant.

Current mode: {skill}

Rules:
- Be direct and useful.
- If the user asks for code, give runnable code.
- If the user asks for research, structure the answer clearly.
- If the user asks for schedule or today, give a daily brief style answer.
- Keep answers practical.
"""

    final_prompt = f"""
{system_prompt}

User command:
{command}
"""

    reply = call_ollama(final_prompt)

    path = unique_report_path(command)

    markdown = f"""# Jarvis Command: {command}

Date: {today_str()}
Created: {now_iso()}
Skill: {skill}

## Command

{command}

## Reply

{reply}
"""

    path.write_text(markdown, encoding="utf-8")

    return {
        "status": "ok",
        "command": command,
        "skill": skill,
        "reply": reply,
        "saved_to": relative_to_base(path, VAULT_PATH),
        "word_count": count_words(markdown),
        "created": now_iso(),
    }

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "dashboard.api:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )