import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuários de exemplo
  const user1 = await prisma.user.upsert({
    where: { email: 'joao@exemplo.com' },
    update: {},
    create: {
      name: 'João Silva',
      email: 'joao@exemplo.com',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'maria@exemplo.com' },
    update: {},
    create: {
      name: 'Maria Santos',
      email: 'maria@exemplo.com',
    },
  });

  console.log('✅ Seed concluído!');
  console.log(`Criados usuarios:`, { user1, user2 });
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
