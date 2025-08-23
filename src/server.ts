import fastify from 'fastify';

// Criar instância do Fastify sem logs
const server = fastify({
  logger: false
});

// Rota GET /hello
server.get('/hello', async () => {
  return 'Hello World';
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
