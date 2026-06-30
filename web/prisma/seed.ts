import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('demo1234', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@playgroup.local' },
    update: {},
    create: {
      email: 'demo@playgroup.local',
      name: 'Demo Player',
      password,
    },
  });

  const playgroup = await prisma.playgroup.upsert({
    where: { slug: 'mesa-local' },
    update: {},
    create: {
      name: 'Mesa Local',
      slug: 'mesa-local',
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_playgroupId: { userId: user.id, playgroupId: playgroup.id },
    },
    update: { role: 'ADMIN' },
    create: {
      userId: user.id,
      playgroupId: playgroup.id,
      role: 'ADMIN',
    },
  });

  const existingLeague = await prisma.league.findFirst({
    where: { playgroupId: playgroup.id, name: 'Liga Commander' },
  });

  if (!existingLeague) {
    await prisma.league.create({
      data: {
        playgroupId: playgroup.id,
        name: 'Liga Commander',
        rules: 'Commander · 21 daño de comandante · ELO casual',
      },
    });
  }

  for (const rule of [
    { key: 'WIN', points: 5 },
    { key: 'FIRST_BLOOD', points: 1 },
    { key: 'KNOCKOUT', points: 2 },
  ]) {
    await prisma.scoreRule.upsert({
      where: { playgroupId_key: { playgroupId: playgroup.id, key: rule.key } },
      update: { points: rule.points },
      create: { playgroupId: playgroup.id, ...rule },
    });
  }

  for (const row of [
    { playerName: 'Alice', rating: 1520, games: 12 },
    { playerName: 'Bob', rating: 1480, games: 10 },
    { playerName: 'Carol', rating: 1510, games: 8 },
  ]) {
    await prisma.eloRating.upsert({
      where: {
        playgroupId_playerName: { playgroupId: playgroup.id, playerName: row.playerName },
      },
      update: {},
      create: { playgroupId: playgroup.id, ...row },
    });
  }

  console.log('Seed OK:', { user: user.email, playgroup: playgroup.slug });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
