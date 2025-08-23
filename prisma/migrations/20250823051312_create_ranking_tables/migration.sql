/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "users";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "jogadores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "moedas" INTEGER NOT NULL,
    "vitorias" INTEGER NOT NULL,
    "derrotas" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "jogos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "jogadores_min" INTEGER NOT NULL,
    "jogadores_max" INTEGER NOT NULL,
    "aposta_padrao" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "partidas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jogo_id" INTEGER NOT NULL,
    "data" DATETIME NOT NULL,
    "encerrada" BOOLEAN NOT NULL,
    "aposta_atual" INTEGER NOT NULL,
    CONSTRAINT "partidas_jogo_id_fkey" FOREIGN KEY ("jogo_id") REFERENCES "jogos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "partida_jogadores" (
    "partida_id" INTEGER NOT NULL,
    "jogador_id" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL,
    "vitorias_rodada" INTEGER NOT NULL,
    "derrotas_rodada" INTEGER NOT NULL,
    "moedas_ganhas" INTEGER NOT NULL,
    "moedas_perdidas" INTEGER NOT NULL,

    PRIMARY KEY ("partida_id", "jogador_id"),
    CONSTRAINT "partida_jogadores_partida_id_fkey" FOREIGN KEY ("partida_id") REFERENCES "partidas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "partida_jogadores_jogador_id_fkey" FOREIGN KEY ("jogador_id") REFERENCES "jogadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rodadas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "partida_id" INTEGER NOT NULL,
    "numero_rodada" INTEGER NOT NULL,
    "vencedor_id" INTEGER NOT NULL,
    "aposta_rodada" INTEGER NOT NULL,
    CONSTRAINT "rodadas_partida_id_fkey" FOREIGN KEY ("partida_id") REFERENCES "partidas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "rodadas_vencedor_id_fkey" FOREIGN KEY ("vencedor_id") REFERENCES "jogadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "historico_partidas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "partida_id" INTEGER NOT NULL,
    "jogo_nome" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "vencedor_id" INTEGER NOT NULL,
    "moedas_totais_ganhas" INTEGER NOT NULL,
    "moedas_totais_perdidas" INTEGER NOT NULL,
    "vitorias_totais" INTEGER NOT NULL,
    "derrotas_totais" INTEGER NOT NULL,
    CONSTRAINT "historico_partidas_partida_id_fkey" FOREIGN KEY ("partida_id") REFERENCES "partidas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "historico_partidas_vencedor_id_fkey" FOREIGN KEY ("vencedor_id") REFERENCES "jogadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "historico_partidas_partida_id_key" ON "historico_partidas"("partida_id");
