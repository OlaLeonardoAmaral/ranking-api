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

// Rota de teste do banco de dados
server.get('/users', async () => {
  const users = await prisma.user.findMany();
  return users;
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
