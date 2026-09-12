/**
 * Comparacao textual entre o que foi falado e o que foi transcrito.
 *
 * E medicao de qualidade da transcricao, nao interpretacao: aqui ninguem
 * procura valor, categoria ou estabelecimento. So compara duas strings.
 */

/**
 * Acentos removidos na mao em vez de `normalize('NFD')`: o resultado nao
 * depende do suporte a Unicode do motor JS do aparelho.
 */
const ACCENTS: Record<string, string> = {
  á: 'a',
  à: 'a',
  â: 'a',
  ã: 'a',
  ä: 'a',
  é: 'e',
  è: 'e',
  ê: 'e',
  ë: 'e',
  í: 'i',
  ì: 'i',
  î: 'i',
  ï: 'i',
  ó: 'o',
  ò: 'o',
  ô: 'o',
  õ: 'o',
  ö: 'o',
  ú: 'u',
  ù: 'u',
  û: 'u',
  ü: 'u',
  ç: 'c',
  ñ: 'n',
};

/**
 * Deixa o texto comparavel: minusculas, sem acento e sem pontuacao.
 *
 * Pontuacao sai porque o reconhecedor a insere por conta propria
 * (`addsPunctuation`) e ela nao diz nada sobre ter entendido a frase.
 */
export function normalizeTranscript(text: string): string {
  return text
    .toLowerCase()
    .replace(/[áàâãäéèêëíìîïóòôõöúùûüçñ]/g, (char) => ACCENTS[char] ?? char)
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Palavras normalizadas do texto. */
export function toWords(text: string): string[] {
  const normalized = normalizeTranscript(text);
  return normalized.length > 0 ? normalized.split(' ') : [];
}

/**
 * Taxa de erro por palavra (WER): distancia de edicao entre as duas frases,
 * contada em palavras, dividida pelo numero de palavras esperadas.
 *
 * 0 = transcricao identica. 0,2 = uma palavra errada a cada cinco. Pode passar
 * de 1 quando o reconhecedor inventa mais palavras do que as faladas.
 *
 * Retorna `null` quando nao ha frase esperada para comparar (modo livre).
 */
export function wordErrorRate(expected: string, actual: string): number | null {
  const target = toWords(expected);
  if (target.length === 0) return null;

  const got = toWords(actual);

  // Levenshtein em uma linha so: as frases da POC sao curtas, mas nao ha razao
  // para guardar a matriz inteira.
  let previous = Array.from({ length: got.length + 1 }, (_, index) => index);

  for (let i = 1; i <= target.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= got.length; j += 1) {
      const substitution = previous[j - 1] + (target[i - 1] === got[j - 1] ? 0 : 1);
      const insertion = current[j - 1] + 1;
      const deletion = previous[j] + 1;
      current[j] = Math.min(substitution, insertion, deletion);
    }
    previous = current;
  }

  return previous[got.length] / target.length;
}

/** WER em percentual de acerto, para exibir. */
export function accuracyLabel(rate: number | null): string {
  if (rate === null) return '—';
  const accuracy = Math.max(0, 1 - rate) * 100;
  return `${accuracy.toFixed(0)}%`;
}
