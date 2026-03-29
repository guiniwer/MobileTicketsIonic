import { Injectable } from '@angular/core';

export interface Senha {
  numero: string;
  tipo: 'SP' | 'SG' | 'SE';
  status: string;
  horaEmissao: Date;
  guiche?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FilaService {

  filaSP: Senha[] = [];
  filaSG: Senha[] = [];
  filaSE: Senha[] = [];

  senhasChamadas: Senha[] = [];

  adicionarSenha(tipo: 'SP' | 'SG' | 'SE') {

    const novaSenha: Senha = {
      numero: this.gerarNumero(tipo),
      tipo,
      status: 'fila',
      horaEmissao: new Date()
    };

    if (tipo === 'SP') this.filaSP.push(novaSenha);
    if (tipo === 'SG') this.filaSG.push(novaSenha);
    if (tipo === 'SE') this.filaSE.push(novaSenha);

    return novaSenha;
  }

  chamarProxima(): Senha | null {

    let senha = null;

    if (this.filaSP.length > 0) senha = this.filaSP.shift();
    else if (this.filaSE.length > 0) senha = this.filaSE.shift();
    else if (this.filaSG.length > 0) senha = this.filaSG.shift();

    if (!senha) return null;

    senha.guiche = String(Math.floor(Math.random() * 5) + 1).padStart(2, '0');

    this.senhasChamadas.unshift(senha);

    return senha;
  }

  private gerarNumero(tipo: string): string {
    const data = new Date();

    const yy = String(data.getFullYear()).slice(2);
    const mm = String(data.getMonth() + 1).padStart(2, '0');
    const dd = String(data.getDate()).padStart(2, '0');

    const seq = Math.floor(Math.random() * 99)
      .toString()
      .padStart(2, '0');

    return `${yy}${mm}${dd}-${tipo}${seq}`;
  }

  playSound() {
  const audio = new Audio();
  audio.src = 'assets/sounds/chamada.mp3';
  audio.load();
  audio.play();
}
}