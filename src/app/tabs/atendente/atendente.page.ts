import { Component } from '@angular/core';
import { FilaService } from 'src/app/services/fila.service';
import { Senha } from 'src/app/models/senha.model';

@Component({
  selector: 'app-atendente',
  templateUrl: './atendente.page.html',
  styleUrls: ['./atendente.page.scss'],
  standalone: false
})
export class AtendentePage {

  senhaAtual: Senha | null = null;
  jaChamou = false;

  constructor(private filaService: FilaService) { }

  chamarSenha() {
    this.senhaAtual = this.filaService.chamarProxima();
    this.jaChamou = true;

    if (this.senhaAtual) {
      // Aguarda breve atualização do DOM antes de tocar o áudio
      setTimeout(() => {
        this.filaService.playSound();
      }, 100);
    }
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