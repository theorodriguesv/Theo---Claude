# Analisador de Vídeos Vencedores → Scripts para @theo_vasc

Sistema local em Python que analisa vídeos de alta performance de concorrentes do
Instagram e gera scripts originais para o perfil **@theo_vasc**
(nicho: empreendedorismo, liderança empresarial e assessoria de marketing e vendas
para centros automotivos — tom de voz: direto e didático).

## Como funciona

1. Você coloca os vídeos concorrentes (`.mp4`/`.mov`) na pasta `input/`, cada um
   acompanhado de um `.txt` de mesmo nome com os metadados.
2. `processar_video.py` transcreve os vídeos (Whisper local) e consolida tudo
   (perfil, curtidas, comentários, views, data, transcrição) em `data/videos_db.json`.
3. `gerar_scripts.py` analisa os vídeos de maior engajamento da base e usa a API
   da Anthropic (Claude) para gerar de 3 a 5 scripts originais, com gancho,
   desenvolvimento, CTA, legenda e justificativa baseada nos padrões encontrados.

## Instalação

```bash
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

O Whisper local (`faster-whisper`) decodifica áudio/vídeo com PyAV — não é
necessário instalar `ffmpeg` separadamente na maioria dos casos, mas se der erro
de codec, instale-o:
- macOS: `brew install ffmpeg`
- Ubuntu/Debian: `sudo apt install ffmpeg`

Configure sua chave de API (necessária apenas para `gerar_scripts.py`):

```bash
cp .env.example .env
# edite .env e preencha ANTHROPIC_API_KEY=sk-ant-...
```

## Formato do arquivo .txt de metadados

Um arquivo por vídeo, mesmo nome, `chave: valor` por linha (aceita variações em
português/inglês e números com `.`, `,`, `K`/`M`/`mil`):

```
perfil: @concorrente_exemplo
curtidas: 15.320
comentarios: 412
views: 180 mil
data: 2026-06-10
```

Exemplo: `input/concorrente1_reel03.mp4` + `input/concorrente1_reel03.txt`

## Comandos

### 1. Processar vídeos

```bash
python processar_video.py
```

- Ignora vídeos sem `.txt` correspondente (avisa no terminal).
- Já processados são pulados automaticamente; use `--force` para reprocessar.
- Salva incrementalmente — se algo falhar no meio do caminho, o progresso não se perde.

Opções:
```bash
python processar_video.py --force              # reprocessa tudo
python processar_video.py --input-dir outra/pasta
```

### 2. Gerar scripts

```bash
python gerar_scripts.py
python gerar_scripts.py --num-scripts 5         # 3 a 5, padrão 4
```

Gera um arquivo `output/scripts_AAAAMMDD_HHMMSS.md` e imprime o resultado no
terminal. Cada script traz:

- **Gancho** (primeiros 3s, texto literal)
- **Desenvolvimento** em bullets
- **CTA final**
- **Sugestão de legenda**
- **Por que funciona** (padrão identificado na base de concorrentes)

## Configuração (`.env`, opcional)

Todos os valores abaixo já têm um padrão sensato (veja `.env.example`):

| Variável | Padrão | Descrição |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | obrigatória para `gerar_scripts.py` |
| `WHISPER_MODEL_SIZE` | `small` | `tiny`/`base`/`small`/`medium`/`large-v3` — maior = mais preciso e mais lento |
| `WHISPER_DEVICE` | `cpu` | `cpu` ou `cuda` (se tiver GPU NVIDIA) |
| `WHISPER_COMPUTE_TYPE` | `int8` | `int8` (cpu) ou `float16` (gpu) |
| `CLAUDE_MODEL` | `claude-sonnet-5` | modelo usado na geração dos scripts |
| `PERFIL_USUARIO` | `@theo_vasc` | perfil para o qual os scripts são escritos |
| `NICHO` | empreendedorismo/liderança/marketing e vendas para centros automotivos | |
| `TOM_DE_VOZ` | direto e didático | |

## Estrutura do projeto

```
input/                  # coloque aqui os vídeos + .txt dos concorrentes
data/videos_db.json     # banco consolidado (gerado automaticamente)
output/                 # scripts gerados (.md)
core/
  config.py             # configurações e variáveis de ambiente
  metadata_parser.py     # leitura dos .txt de metadados
  transcription.py       # transcrição local com faster-whisper
  database.py             # leitura/escrita do banco JSON
  script_generator.py     # análise de padrões + geração via API Claude
processar_video.py       # comando 1
gerar_scripts.py         # comando 2
```
