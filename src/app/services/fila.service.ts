import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Senha } from '../models/senha.model';

interface FilaApiState {
  expedienteAberto: boolean;
  filas: {
    SP: Senha[];
    SG: Senha[];
    SE: Senha[];
  };
  senhasChamadas: Senha[];
  historico: Senha[];
  contadores: Record<string, number>;
  ultimoGrupoChamado: 'SP' | 'NAO_SP' | null;
}

interface ChamarSenhaResponse {
  mensagem: string;
  senha: Senha | null;
  senhaDescartada?: Senha;
}

@Injectable({
  providedIn: 'root'
})
export class FilaService {

  private readonly API_URL = 'http://localhost:3000';

  filaSP: Senha[] = [];
  filaSG: Senha[] = [];
  filaSE: Senha[] = [];
  senhasChamadas: Senha[] = [];

  constructor(private http: HttpClient) {
    this.carregarDados();
  }

  carregarDados(): void {
    this.http.get<FilaApiState>(`${this.API_URL}/senhas`).subscribe({
      next: (state) => this.atualizarEstadoLocal(state),
      error: (erro) => console.error('Erro ao carregar dados da API:', erro)
    });
  }

  adicionarSenha(tipo: 'SP' | 'SG' | 'SE'): Observable<Senha> {
    return this.http.post<Senha>(`${this.API_URL}/senhas`, { tipo }).pipe(
      tap(() => this.carregarDados())
    );
  }

  chamarProxima(): Observable<Senha | null> {
    return this.http.post<ChamarSenhaResponse>(`${this.API_URL}/senhas/chamar-proxima`, {}).pipe(
      tap(() => this.carregarDados()),
      map((resposta) => resposta.senha)
    );
  }

  carregarPainel(): Observable<Senha[]> {
    return this.http.get<{ senhasChamadas: Senha[] }>(`${this.API_URL}/painel`).pipe(
      map((resposta) => resposta.senhasChamadas),
      tap((senhas) => {
        this.senhasChamadas = senhas;
      })
    );
  }

  private atualizarEstadoLocal(state: FilaApiState): void {
    this.filaSP = state.filas.SP ?? [];
    this.filaSG = state.filas.SG ?? [];
    this.filaSE = state.filas.SE ?? [];
    this.senhasChamadas = state.senhasChamadas ?? [];
  }

  playSound(): void {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

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

      gain.gain.setValueAtTime(0, inicio);
      gain.gain.linearRampToValueAtTime(0.15, inicio + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, fim);

      osc.start(inicio);
      osc.stop(fim);

      if (fim > ultimoStop) ultimoStop = fim;
    }

    setTimeout(() => ctx.close(), (ultimoStop - now) * 1000 + 100);
  }
}
