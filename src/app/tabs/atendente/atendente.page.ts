import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
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

  constructor(
    private filaService: FilaService,
    private toastController: ToastController
  ) { }

  chamarSenha() {
    this.filaService.chamarProxima().subscribe({
      next: async (senha) => {
        this.senhaAtual = senha;
        this.jaChamou = true;

        if (this.senhaAtual) {
          setTimeout(() => {
            this.filaService.playSound();
          }, 100);
        } else {
          const toast = await this.toastController.create({
            message: 'Não há senha disponível para atendimento ou uma senha foi descartada.',
            duration: 3000,
            position: 'top',
            color: 'warning'
          });

          await toast.present();
        }
      },
      error: async (erro) => {
        this.senhaAtual = null;
        this.jaChamou = true;

        const mensagem = erro?.error?.mensagem ?? 'Erro ao chamar senha. Verifique se a API está rodando.';

        const toast = await this.toastController.create({
          message: mensagem,
          duration: 3500,
          position: 'top',
          color: 'danger'
        });

        await toast.present();
      }
    });
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
