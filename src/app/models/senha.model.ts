export interface Senha {
  numero: string;
  tipo: 'SP' | 'SG' | 'SE';
  status: 'fila' | 'atendida' | 'descartada';
  horaEmissao: Date;
  horaAtendimento?: Date;
  guiche?: string;
}