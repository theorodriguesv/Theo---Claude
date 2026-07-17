#!/usr/bin/env python3
"""
Comando: processar_video

Varre a pasta input/ procurando pares (vídeo.mp4|mov + vídeo.txt),
transcreve o áudio com Whisper local e consolida tudo no banco JSON
(data/videos_db.json): perfil, curtidas, comentários, views, data e transcrição.

Uso:
    python processar_video.py                # processa só os vídeos novos
    python processar_video.py --force         # reprocessa tudo, inclusive já existentes
    python processar_video.py --input-dir X   # usa outra pasta de input
"""
import argparse
import sys

from core import config, database
from core.metadata_parser import parse_metadata_file
from core.transcription import transcribe_video


def encontrar_pares(input_dir):
    """Retorna lista de (video_path, txt_path) para cada vídeo com metadado correspondente."""
    pares = []
    for video_path in sorted(input_dir.iterdir()):
        if video_path.suffix.lower() not in config.VIDEO_EXTENSIONS:
            continue
        txt_path = video_path.with_suffix(".txt")
        if not txt_path.exists():
            print(f"[aviso] '{video_path.name}' ignorado: falta o arquivo '{txt_path.name}'")
            continue
        pares.append((video_path, txt_path))
    return pares


def processar(input_dir, force=False):
    db = database.load_db()
    pares = encontrar_pares(input_dir)

    if not pares:
        print(f"Nenhum par vídeo+txt encontrado em '{input_dir}'.")
        return

    processados, pulados, erros = 0, 0, 0

    for video_path, txt_path in pares:
        video_id = video_path.stem

        if database.video_exists(db, video_id) and not force:
            print(f"[pulado] {video_id} (já processado, use --force para refazer)")
            pulados += 1
            continue

        print(f"[processando] {video_id}...")
        try:
            metadata = parse_metadata_file(txt_path)
            resultado = transcribe_video(video_path)
        except Exception as exc:  # noqa: BLE001 - queremos seguir para o próximo vídeo
            print(f"[erro] Falha ao processar '{video_id}': {exc}")
            erros += 1
            continue

        curtidas = metadata.get("curtidas")
        views = metadata.get("views")
        comentarios = metadata.get("comentarios")
        engajamento = None
        if views:
            engajamento = round(((curtidas or 0) + (comentarios or 0)) / views, 5)

        record = {
            "video_id": video_id,
            "arquivo_video": str(video_path.name),
            "perfil": metadata.get("perfil"),
            "curtidas": curtidas,
            "comentarios": comentarios,
            "views": views,
            "data": metadata.get("data"),
            "taxa_engajamento": engajamento,
            "transcricao": resultado["texto"],
            "idioma_detectado": resultado["idioma"],
            "duracao_segundos": resultado["duracao_segundos"],
        }
        database.upsert_video(db, video_id, record)
        database.save_db(db)  # salva incrementalmente para não perder progresso
        processados += 1
        print(f"[ok] {video_id} -> {len(resultado['texto'])} caracteres transcritos")

    print(
        f"\nResumo: {processados} processado(s), {pulados} pulado(s), {erros} erro(s). "
        f"Banco: {config.DB_PATH}"
    )


def main():
    parser = argparse.ArgumentParser(description="Processa vídeos e popula o banco de dados.")
    parser.add_argument(
        "--input-dir", default=str(config.INPUT_DIR), help="Pasta com os vídeos e .txt"
    )
    parser.add_argument(
        "--force", action="store_true", help="Reprocessa vídeos já existentes no banco"
    )
    args = parser.parse_args()

    from pathlib import Path

    input_dir = Path(args.input_dir)
    if not input_dir.exists():
        print(f"Pasta de input não encontrada: {input_dir}")
        sys.exit(1)

    processar(input_dir, force=args.force)


if __name__ == "__main__":
    main()
