"""Banco de dados JSON consolidando perfil + transcrição + métricas de cada vídeo."""
import json
from datetime import datetime

from . import config


def load_db() -> dict:
    if not config.DB_PATH.exists():
        return {}
    with open(config.DB_PATH, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}


def save_db(db: dict) -> None:
    with open(config.DB_PATH, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)


def video_exists(db: dict, video_id: str) -> bool:
    return video_id in db


def upsert_video(db: dict, video_id: str, record: dict) -> None:
    record = dict(record)
    record["atualizado_em"] = datetime.now().isoformat(timespec="seconds")
    db[video_id] = record
