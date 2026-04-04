import { Injectable } from '@angular/core';
import { Senha } from '../models/senha.model';

const STORAGE_KEY = 'filaService';

interface FilaState {
  filaSP: Senha[];
  filaSG: Senha[];
  filaSE: Senha[];
  senhasChamadas: Senha[];
  contadores: Record<string, number>;
}

@Injectable({
  providedIn: 'root'
})
export class FilaService {

  private readonly TOTAL_GUICHES = 5;

  filaSP: Senha[] = [];
  filaSG: Senha[] = [];
  filaSE: Senha[] = [];

  senhasChamadas: Senha[] = [];

  private filas: Record<string, Senha[]> = {};
  private contadores: Record<string, number> = { SP: 0, SG: 0, SE: 0 };

  constructor() {
    this.filas = { SP: this.filaSP, SG: this.filaSG, SE: this.filaSE };
    this.carregarState();
  }

  adicionarSenha(tipo: 'SP' | 'SG' | 'SE'): Senha {
    const novaSenha: Senha = {
      numero: this.gerarNumero(tipo),
      tipo,
      status: 'fila',
      horaEmissao: new Date()
    };

    this.filas[tipo].push(novaSenha);
    this.salvarState();

    return novaSenha;
  }

  chamarProxima(): Senha | null {
    let senha: Senha | undefined;

    if (this.filaSP.length > 0) senha = this.filaSP.shift();
    else if (this.filaSE.length > 0) senha = this.filaSE.shift();
    else if (this.filaSG.length > 0) senha = this.filaSG.shift();

    if (!senha) return null;

    senha.status = 'atendida';
    senha.horaAtendimento = new Date();
    senha.guiche = String(Math.floor(Math.random() * this.TOTAL_GUICHES) + 1).padStart(2, '0');

    this.senhasChamadas.unshift(senha);
    this.salvarState();

    return senha;
  }

  private gerarNumero(tipo: 'SP' | 'SG' | 'SE'): string {
    const data = new Date();

    const yy = String(data.getFullYear()).slice(2);
    const mm = String(data.getMonth() + 1).padStart(2, '0');
    const dd = String(data.getDate()).padStart(2, '0');

    this.contadores[tipo]++;
    const seq = String(this.contadores[tipo]).padStart(2, '0');

    return `${yy}${mm}${dd}-${tipo}${seq}`;
  }

  playSound(): void {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Chime suave com 3 notas harmônicas (Dó - Mi - Sol)
    const notas = [523.25, 659.25, 783.99];
    const duracao = 0.6;
    let ultimoStop = now;

    for (let i = 0; i < notas.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = notas[i];

      const inicio = now + i * 0.15;
      const fim = inicio + duracao;

      // Envelope suave: fade in rápido + fade out gradual
      gain.gain.setValueAtTime(0, inicio);
      gain.gain.linearRampToValueAtTime(0.15, inicio + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, fim);

      osc.start(inicio);
      osc.stop(fim);

      if (fim > ultimoStop) ultimoStop = fim;
    }

    setTimeout(() => ctx.close(), (ultimoStop - now) * 1000 + 100);
  }

  private salvarState(): void {
    const state: FilaState = {
      filaSP: this.filaSP,
      filaSG: this.filaSG,
      filaSE: this.filaSE,
      senhasChamadas: this.senhasChamadas,
      contadores: this.contadores
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  private carregarState(): void {
    const data = sessionStorage.getItem(STORAGE_KEY);
    if (!data) return;

    const state: FilaState = JSON.parse(data);

    this.filaSP.push(...state.filaSP);
    this.filaSG.push(...state.filaSG);
    this.filaSE.push(...state.filaSE);
    this.senhasChamadas.push(...state.senhasChamadas);
    this.contadores = state.contadores;
  }
}
