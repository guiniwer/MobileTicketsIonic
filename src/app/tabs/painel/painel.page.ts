import { Component } from '@angular/core';
import { FilaService } from 'src/app/services/fila.service';
import { Senha } from 'src/app/models/senha.model';

@Component({
  selector: 'app-painel',
  templateUrl: './painel.page.html',
  styleUrls: ['./painel.page.scss'],
  standalone: false
})
export class PainelPage {

  constructor(private filaService: FilaService) {}

  get senhasChamadas(): Senha[] {
    return this.filaService.senhasChamadas;
  }

  get filaSP(): Senha[] {
    return this.filaService.filaSP;
  }

  get filaSG(): Senha[] {
    return this.filaService.filaSG;
  }

  get filaSE(): Senha[] {
    return this.filaService.filaSE;
  }

  chamarProximaSenha() {
    this.filaService.chamarProxima();
  }

  tempoDecorrido(senha: Senha): string {
    if (!senha.horaAtendimento) return '';
    const agora = Date.now();
    const chamada = new Date(senha.horaAtendimento).getTime();
    const diffSeg = Math.floor((agora - chamada) / 1000);

    if (diffSeg < 60) return `${diffSeg}s atrás`;
    const min = Math.floor(diffSeg / 60);
    if (min < 60) return `${min}min atrás`;
    const horas = Math.floor(min / 60);
    return `${horas}h ${min % 60}min atrás`;
  }

  corTipo(tipo: string): string {
    const cores: Record<string, string> = {
      SP: 'var(--ion-color-danger)',
      SG: 'var(--ion-color-warning)',
      SE: 'var(--ion-color-success)'
    };
    return cores[tipo] ?? '';
  }
}