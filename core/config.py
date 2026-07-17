"""Configurações centrais do sistema de análise de vídeos do Instagram."""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
INPUT_DIR = Path(os.getenv("INPUT_DIR", BASE_DIR / "input"))
DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))
OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", BASE_DIR / "output"))
DB_PATH = DATA_DIR / "videos_db.json"

VIDEO_EXTENSIONS = {".mp4", ".mov"}

# --- Transcrição (Whisper local) ---
WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "small")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "cpu")
WHISPER_COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
WHISPER_LANGUAGE = os.getenv("WHISPER_LANGUAGE", "pt")

# --- Geração de scripts (Claude / Anthropic API) ---
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-5")

# --- Perfil e posicionamento ---
PERFIL_USUARIO = os.getenv("PERFIL_USUARIO", "@theo_vasc")
NICHO = os.getenv(
    "NICHO",
    "Empreendedorismo, liderança empresarial e assessoria de marketing e vendas "
    "para centros automotivos",
)
TOM_DE_VOZ = os.getenv("TOM_DE_VOZ", "Direto e didático")

for _dir in (INPUT_DIR, DATA_DIR, OUTPUT_DIR):
    _dir.mkdir(parents=True, exist_ok=True)
