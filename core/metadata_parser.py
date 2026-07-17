"""Leitura dos arquivos .txt com os metadados (perfil, curtidas, comentários, views, data)."""
import re

ALIASES = {
    "perfil": ["perfil", "profile", "conta", "usuario", "usuário", "@"],
    "curtidas": ["curtidas", "likes", "like"],
    "comentarios": ["comentarios", "comentários", "comments", "comment"],
    "views": ["views", "visualizacoes", "visualizações", "plays", "view"],
    "data": ["data", "date", "publicado_em", "data_publicacao", "data_publicação"],
}

_KEY_LOOKUP = {alias: field for field, aliases in ALIASES.items() for alias in aliases}

_SUFFIX_MULTIPLIERS = [
    (r"mil\b", 1_000),
    (r"\bmi\b|\bmilh(ao|ões|oes)\b", 1_000_000),
    (r"k\b", 1_000),
    (r"m\b", 1_000_000),
]


def _normalize_key(raw_key: str) -> str:
    key = raw_key.strip().lower()
    key = key.replace(" ", "_")
    return key


def parse_number(raw: str):
    """Converte strings como '15.320', '15,3K', '1.2M', '3 mil' em int."""
    if raw is None:
        return None
    s = raw.strip().lower()
    if not s:
        return None

    multiplier = 1
    for pattern, mult in _SUFFIX_MULTIPLIERS:
        if re.search(pattern, s):
            multiplier = mult
            s = re.sub(pattern, "", s)
            break

    s = s.strip()
    s = re.sub(r"[^0-9.,]", "", s)
    if not s:
        return None

    if multiplier > 1:
        # com sufixo (K/M/mil) o número é pequeno: '.' ou ',' é sempre separador
        # decimal (ex.: "1.2M", "15,3K"), nunca separador de milhar.
        s = s.replace(",", ".")
        try:
            value = float(s)
        except ValueError:
            return None
        return int(round(value * multiplier))

    # sem sufixo: assume que '.' e ',' são separadores de milhar
    s = s.replace(".", "").replace(",", "")
    try:
        return int(s)
    except ValueError:
        return None


def parse_metadata_file(path) -> dict:
    """Lê um arquivo .txt no formato 'chave: valor' (uma por linha) e retorna um dict
    normalizado com as chaves: perfil, curtidas, comentarios, views, data.
    Campos não reconhecidos ou ausentes ficam como None.
    """
    result = {"perfil": None, "curtidas": None, "comentarios": None, "views": None, "data": None}
    raw_lines = []

    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    for line in content.splitlines():
        line = line.strip()
        if not line or ":" not in line and "=" not in line:
            continue
        sep = ":" if ":" in line else "="
        raw_key, _, raw_value = line.partition(sep)
        field = _KEY_LOOKUP.get(_normalize_key(raw_key))
        raw_value = raw_value.strip()
        raw_lines.append((raw_key.strip(), raw_value))
        if field is None:
            continue
        if field == "perfil":
            result["perfil"] = raw_value if raw_value.startswith("@") else f"@{raw_value}"
        elif field == "data":
            result["data"] = raw_value
        else:
            result[field] = parse_number(raw_value)

    result["_raw"] = raw_lines
    return result
