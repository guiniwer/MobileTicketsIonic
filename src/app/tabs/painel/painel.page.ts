import { Component, OnInit } from '@angular/core';
import { Senha, FilaService } from 'src/app/services/fila.service';

@Component({
  selector: 'app-painel',
  templateUrl: './painel.page.html',
  styleUrls: ['./painel.page.scss'],
  standalone: false
})
export class PainelPage implements OnInit {

  constructor(private filaService: FilaService) {}

  ngOnInit() {}

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
}