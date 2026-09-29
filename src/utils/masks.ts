/**
 * UTILS - mascaras e sanitizacao de campos de formulario.
 */

/**
 * Formata telefone/celular no formato brasileiro:
 * 10 digitos: (00) 0000-0000
 * 11 digitos: (00) 00000-0000
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Formata valor monetario em tempo real (estilo moeda BRL: R$ 1.234,56).
 */
export function formatCurrency(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  const centsStr = (num % 100).toString().padStart(2, '0');
  const intPart = Math.floor(num / 100).toString();
  const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${intWithDots},${centsStr}`;
}

/**
 * Converte valor digitado (com ou sem mascara) para number sem ambiguidade.
 * Exemplos:
 * "R$ 1.500,00" -> 1500
 * "1.500,00"    -> 1500
 * "1500,00"     -> 1500
 * "1.500"       -> 1500 (reconhece ponto como milhar se tiver 3 digitos no final)
 * "1500"        -> 1500
 */
export function parseCurrencyToNumber(value: string): number | undefined {
  if (!value || !value.trim()) return undefined;
  const trimmed = value.trim();

  // Se contem virgula, padrao brasileiro decimal
  if (trimmed.includes(',')) {
    const cleaned = trimmed.replace(/[^\d,]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return Number.isNaN(num) ? undefined : num;
  }

  // Se contem ponto sem virgula
  if (trimmed.includes('.')) {
    const parts = trimmed.split('.');
    // Ex.: 1500.00
    if (parts.length === 2 && parts[1].length === 2) {
      const num = parseFloat(trimmed.replace(/[^\d.]/g, ''));
      return Number.isNaN(num) ? undefined : num;
    }
    // Ex.: 1.500 -> milhar
    const cleaned = trimmed.replace(/[^\d]/g, '');
    const num = parseFloat(cleaned);
    return Number.isNaN(num) ? undefined : num;
  }

  const cleaned = trimmed.replace(/[^\d]/g, '');
  if (!cleaned) return undefined;
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? undefined : num;
}

/**
 * Sanitiza nome e sobrenome: aceita apenas letras (com acentos), espacos, hifen e apostrofo.
 */
export function sanitizeName(value: string): string {
  return value.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s'-]/g, '');
}

/**
 * Sanitiza email: remove espacos e converte para minusculas.
 */
export function sanitizeEmail(value: string): string {
  return value.replace(/\s+/g, '').toLowerCase();
}
