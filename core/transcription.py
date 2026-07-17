"""Transcrição local de vídeos usando faster-whisper.

Mantém o modelo carregado em memória (singleton) para não recarregar
a cada vídeo processado.
"""
from . import config

_model = None


def _get_model():
    global _model
    if _model is None:
        try:
            from faster_whisper import WhisperModel
        except ImportError as exc:
            raise RuntimeError(
                "faster-whisper não está instalado. Rode: pip install -r requirements.txt"
            ) from exc

        print(
            f"[transcricao] Carregando modelo Whisper '{config.WHISPER_MODEL_SIZE}' "
            f"({config.WHISPER_DEVICE}/{config.WHISPER_COMPUTE_TYPE})..."
        )
        _model = WhisperModel(
            config.WHISPER_MODEL_SIZE,
            device=config.WHISPER_DEVICE,
            compute_type=config.WHISPER_COMPUTE_TYPE,
        )
    return _model


def transcribe_video(video_path) -> dict:
    """Transcreve um vídeo e retorna {'texto': str, 'idioma': str, 'duracao_segundos': float}."""
    model = _get_model()
    segments, info = model.transcribe(
        str(video_path),
        language=config.WHISPER_LANGUAGE,
        beam_size=5,
        vad_filter=True,
    )
    texto = " ".join(segment.text.strip() for segment in segments).strip()
    return {
        "texto": texto,
        "idioma": info.language,
        "duracao_segundos": round(info.duration, 1) if info.duration else None,
    }
