#!/usr/bin/env python3
"""
Comando: gerar_scripts

Analisa o banco de dados de vídeos (data/videos_db.json) e gera de 3 a 5 scripts
originais de alta performance para o perfil configurado (padrão: @theo_vasc),
usando a API da Anthropic (Claude) para a etapa criativa, embasada nos padrões
extraídos dos vídeos concorrentes de maior engajamento.

Uso:
    python gerar_scripts.py                    # gera 4 scripts (padrão)
    python gerar_scripts.py --num-scripts 5
"""
import argparse
import sys
from datetime import datetime

from core import config, database
from core.script_generator import gerar_scripts_com_claude, montar_relatorio_padroes


def main():
    parser = argparse.ArgumentParser(description="Gera scripts a partir da base de vídeos.")
    parser.add_argument(
        "--num-scripts", type=int, default=4, choices=range(3, 6),
        help="Quantidade de scripts a gerar (3 a 5, padrão 4)",
    )
    args = parser.parse_args()

    db = database.load_db()
    if len(db) == 0:
        print(
            "Banco de dados vazio. Rode 'python processar_video.py' primeiro "
            "para transcrever e indexar os vídeos concorrentes."
        )
        sys.exit(1)

    if len(db) < 3:
        print(
            f"[aviso] Apenas {len(db)} vídeo(s) na base. Os scripts serão gerados, "
            "mas a qualidade da análise de padrões melhora com mais vídeos."
        )

    print(f"Analisando {len(db)} vídeo(s) da base...")
    pattern_report = montar_relatorio_padroes(db)

    print(f"Gerando {args.num_scripts} script(s) com Claude ({config.CLAUDE_MODEL})...")
    try:
        scripts_md = gerar_scripts_com_claude(pattern_report, num_scripts=args.num_scripts)
    except RuntimeError as exc:
        print(f"[erro] {exc}")
        sys.exit(1)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = config.OUTPUT_DIR / f"scripts_{timestamp}.md"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(f"# Scripts gerados para {config.PERFIL_USUARIO}\n")
        f.write(f"_Gerado em {datetime.now().strftime('%d/%m/%Y %H:%M')} ")
        f.write(f"com base em {pattern_report['total_videos_na_base']} vídeo(s) da base._\n\n")
        f.write(scripts_md)

    print(f"\n{scripts_md}\n")
    print(f"Scripts salvos em: {output_path}")


if __name__ == "__main__":
    main()
