import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Interfaces para tipagem dos dados JSON
interface JogadorJson {
  id: number;
  nome: string;
  emoji: string;
  moedas: number;
  vitorias: number;
  derrotas: number;
}

interface JogoJson {
  id: number;
  nome: string;
  emoji: string;
  jogadores_min: number;
  jogadores_max: number;
  aposta_padrao: number;
}

interface PartidaJson {
  id: number;
  jogo_id: number;
  data: string;
  encerrada: boolean;
  aposta_atual: number;
}

interface PartidaJogadorJson {
  partida_id: number;
  jogador_id: number;
  ativo: boolean;
  vitorias_rodada: number;
  derrotas_rodada: number;
  moedas_ganhas: number;
  moedas_perdidas: number;
}

interface RodadaJson {
  id: number;
  partida_id: number;
  numero_rodada: number;
  vencedor_id: number;
  aposta_rodada: number;
}

interface HistoricoPartidaJson {
  id: number;
  partida_id: number;
  jogo_nome: string;
  data: string;
  vencedor_id: number;
  moedas_totais_ganhas: number;
  moedas_totais_perdidas: number;
  vitorias_totais: number;
  derrotas_totais: number;
}

// Função para ler arquivos JSON
function lerArquivoJson<T>(nomeArquivo: string): T[] {
  const caminhoArquivo = path.join(__dirname, '../migrar-p-sqlite', nomeArquivo);
  const conteudo = fs.readFileSync(caminhoArquivo, 'utf8');
  return JSON.parse(conteudo);
}

async function migrarDados() {
  console.log('🚀 Iniciando migração dos dados JSON para SQLite...\n');

  try {
    // 1. Migrar Jogadores
    console.log('📋 Migrando jogadores...');
    const jogadores = lerArquivoJson<JogadorJson>('jogadores.json');
    
    for (const jogador of jogadores) {
      await prisma.jogador.create({
        data: {
          id: jogador.id,
          nome: jogador.nome,
          emoji: jogador.emoji,
          moedas: jogador.moedas,
          vitorias: jogador.vitorias,
          derrotas: jogador.derrotas,
        },
      });
    }
    console.log(`✅ ${jogadores.length} jogadores migrados!\n`);

    // 2. Migrar Jogos
    console.log('🎮 Migrando jogos...');
    const jogos = lerArquivoJson<JogoJson>('jogos.json');
    
    for (const jogo of jogos) {
      await prisma.jogo.create({
        data: {
          id: jogo.id,
          nome: jogo.nome,
          emoji: jogo.emoji,
          jogadoresMin: jogo.jogadores_min,
          jogadoresMax: jogo.jogadores_max,
          apostaPadrao: jogo.aposta_padrao,
        },
      });
    }
    console.log(`✅ ${jogos.length} jogos migrados!\n`);

    // 3. Migrar Partidas
    console.log('🏁 Migrando partidas...');
    const partidas = lerArquivoJson<PartidaJson>('partidas.json');
    
    for (const partida of partidas) {
      await prisma.partida.create({
        data: {
          id: partida.id,
          jogoId: partida.jogo_id,
          data: new Date(partida.data),
          encerrada: partida.encerrada,
          apostaAtual: partida.aposta_atual,
        },
      });
    }
    console.log(`✅ ${partidas.length} partidas migradas!\n`);

    // 4. Migrar Partidas-Jogadores
    console.log('👥 Migrando relações partida-jogadores...');
    const partidasJogadores = lerArquivoJson<PartidaJogadorJson>('partida_jogadores.json');
    
    for (const pj of partidasJogadores) {
      await prisma.partidaJogador.create({
        data: {
          partidaId: pj.partida_id,
          jogadorId: pj.jogador_id,
          ativo: pj.ativo,
          vitoriasRodada: pj.vitorias_rodada,
          derrotasRodada: pj.derrotas_rodada,
          moedasGanhas: pj.moedas_ganhas,
          moedasPerdidas: pj.moedas_perdidas,
        },
      });
    }
    console.log(`✅ ${partidasJogadores.length} relações partida-jogador migradas!\n`);

    // 5. Migrar Rodadas
    console.log('🔄 Migrando rodadas...');
    const rodadas = lerArquivoJson<RodadaJson>('rodadas.json');
    
    for (const rodada of rodadas) {
      await prisma.rodada.create({
        data: {
          id: rodada.id,
          partidaId: rodada.partida_id,
          numeroRodada: rodada.numero_rodada,
          vencedorId: rodada.vencedor_id,
          apostaRodada: rodada.aposta_rodada,
        },
      });
    }
    console.log(`✅ ${rodadas.length} rodadas migradas!\n`);

    // 6. Migrar Histórico de Partidas
    console.log('📊 Migrando histórico de partidas...');
    const historicoPartidas = lerArquivoJson<HistoricoPartidaJson>('historico_partidas.json');
    
    for (const historico of historicoPartidas) {
      await prisma.historicoPartida.create({
        data: {
          id: historico.id,
          partidaId: historico.partida_id,
          jogoNome: historico.jogo_nome,
          data: new Date(historico.data),
          vencedorId: historico.vencedor_id,
          moedasTotaisGanhas: historico.moedas_totais_ganhas,
          moedasTotaisPerdidas: historico.moedas_totais_perdidas,
          vitoriasTotais: historico.vitorias_totais,
          derrotasTotais: historico.derrotas_totais,
        },
      });
    }
    console.log(`✅ ${historicoPartidas.length} registros de histórico migrados!\n`);

    console.log('🎉 Migração concluída com sucesso!');
    console.log('\n📊 Resumo da migração:');
    console.log(`   • ${jogadores.length} jogadores`);
    console.log(`   • ${jogos.length} jogos`);
    console.log(`   • ${partidas.length} partidas`);
    console.log(`   • ${partidasJogadores.length} relações partida-jogador`);
    console.log(`   • ${rodadas.length} rodadas`);
    console.log(`   • ${historicoPartidas.length} registros de histórico`);

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
migrarDados()
  .catch((error) => {
    console.error('💥 Falha na migração:', error);
    process.exit(1);
  });
