import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { FilaService } from 'src/app/services/fila.service';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.page.html',
  styleUrls: ['./cliente.page.scss'],
  standalone: false
})
export class ClientePage {

  constructor(
    private filaService: FilaService,
    private toastController: ToastController
  ) { }

  async gerarSenha(tipo: 'SP' | 'SG' | 'SE') {
    this.filaService.adicionarSenha(tipo).subscribe({
      next: async (senha) => {
        const toast = await this.toastController.create({
          message: `Senha gerada: ${senha.numero}`,
          duration: 3000,
          position: 'top',
          color: 'success'
        });

        await toast.present();
      },
      error: async (erro) => {
        const mensagem = erro?.error?.mensagem ?? 'Não foi possível gerar a senha. Verifique se a API está rodando.';

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
}
