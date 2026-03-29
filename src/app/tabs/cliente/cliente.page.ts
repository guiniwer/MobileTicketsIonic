import { Component, OnInit } from '@angular/core';
import { FilaService } from 'src/app/services/fila.service';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.page.html',
  styleUrls: ['./cliente.page.scss'],
  standalone: false
})
export class ClientePage implements OnInit {

  constructor(private filaService: FilaService) { }

  ngOnInit() { }

  gerarSenha(tipo: 'SP' | 'SG' | 'SE') {
    const senha = this.filaService.adicionarSenha(tipo);
    alert(`Senha gerada: ${senha.numero}`);
  }
}