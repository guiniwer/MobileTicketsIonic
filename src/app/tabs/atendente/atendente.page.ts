import { Component, OnInit } from '@angular/core';
import { Senha, FilaService } from 'src/app/services/fila.service';

@Component({
  selector: 'app-atendente',
  templateUrl: './atendente.page.html',
  styleUrls: ['./atendente.page.scss'],
  standalone: false
})
export class AtendentePage implements OnInit {

  senhaAtual: Senha | null = null;

  constructor(private filaService: FilaService) { }

  ngOnInit() { }

  chamarSenha() {
  this.senhaAtual = this.filaService.chamarProxima();

  if (this.senhaAtual) {
    setTimeout(() => {
      this.filaService.playSound();
    }, 100);
  }
}
}