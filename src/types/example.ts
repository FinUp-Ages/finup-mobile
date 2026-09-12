/**
 * TYPES - contratos de dado compartilhados entre as camadas.
 *
 * Espelham o que a API devolve (view/response do finup-backend2).
 *
 * TODO: implementar em tarefa futura - tipos reais do dominio.
 */
export interface Example {
  id: string;
  name: string;
  description: string;
}

export interface ExamplePayload {
  name: string;
  description: string;
}
