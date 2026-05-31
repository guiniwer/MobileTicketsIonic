export interface Senha {
  numero: string;
  tipo: 'SP' | 'SG' | 'SE';
  status: 'fila' | 'atendida' | 'descartada';
  horaEmissao: string | Date;
  horaAtendimento?: string | Date | null;
  horaDescarte?: string | Date | null;
  guiche?: string | null;
  tempoAtendimentoMinutos?: number | null;
  motivoDescarte?: string | null;
}
