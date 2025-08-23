import fastify from 'fastify';
import { PrismaClient } from '@prisma/client';

// Instanciar Prisma Client
const prisma = new PrismaClient();

// Criar instância do Fastify sem logs
const server = fastify({
  logger: false
});

// Rota GET /hello
server.get('/hello', async () => {
  return 'Hello World';
});

// ========== ROTAS DE TESTE DA MIGRAÇÃO ==========

// Rota para listar jogadores
server.get('/jogadores', async () => {
  const jogadores = await prisma.jogador.findMany({
    orderBy: { moedas: 'desc' }
  });
  return { total: jogadores.length, jogadores };
});

// Rota para listar jogos
server.get('/jogos', async () => {
  const jogos = await prisma.jogo.findMany({
    orderBy: { nome: 'asc' }
  });
  return { total: jogos.length, jogos };
});

// Rota para listar partidas com relacionamentos
server.get('/partidas', async () => {
  const partidas = await prisma.partida.findMany({
    include: {
      jogo: true,
      partidasJogador: {
        include: {
          jogador: true
        }
      }
    },
    orderBy: { data: 'desc' },
    take: 10 // Últimas 10 partidas
  });
  return { total: partidas.length, partidas };
});

// Rota para estatísticas gerais
server.get('/estatisticas', async () => {
  const [jogadores, jogos, partidas, rodadas, historico] = await Promise.all([
    prisma.jogador.count(),
    prisma.jogo.count(),
    prisma.partida.count(),
    prisma.rodada.count(),
    prisma.historicoPartida.count()
  ]);
  
  const partidasEncerradas = await prisma.partida.count({ where: { encerrada: true } });
  const partidasAndamento = await prisma.partida.count({ where: { encerrada: false } });
  
  return {
    resumo: {
      jogadores,
      jogos,
      partidas,
      rodadas,
      historico,
      partidasEncerradas,
      partidasAndamento
    }
  };
});

// Iniciar servidor
const start = async (): Promise<void> => {
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Servidor rodando na porta 3001');
  } catch (err) {
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
  }
};

start();
