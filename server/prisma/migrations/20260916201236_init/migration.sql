-- CreateEnum
CREATE TYPE "Rank" AS ENUM ('E', 'D', 'C', 'B', 'A', 'S', 'SPLUS');

-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMUM', 'INCOMUM', 'RARO', 'ULTRA_RARO', 'LENDARIO', 'DEUS');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('ARMA', 'ARMADURA', 'ROUPA', 'ACESSORIO', 'ITEM', 'POCAO', 'ITEM_MAGICO');

-- CreateEnum
CREATE TYPE "EquipmentSlot" AS ENUM ('CABECA', 'CORPO', 'MAOS', 'PERNAS', 'PES', 'ARMA', 'ACESSORIO1', 'ACESSORIO2');

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('ESGUIO', 'ATLETICO', 'ROBUSTO');

-- CreateEnum
CREATE TYPE "HairStyle" AS ENUM ('RASPADO', 'CURTO', 'LONGO', 'PRESO');

-- CreateEnum
CREATE TYPE "MissionType" AS ENUM ('DIARIA', 'BONUS', 'ESPECIAL');

-- CreateEnum
CREATE TYPE "BossEncounterType" AS ENUM ('COMUM', 'ERRANTE', 'SECRETO');

-- CreateEnum
CREATE TYPE "BattleStatus" AS ENUM ('EM_ANDAMENTO', 'VITORIA', 'DERROTA');

-- CreateEnum
CREATE TYPE "PerformanceTier" AS ENUM ('RUIM', 'NORMAL', 'EXCELENTE', 'EXCEPCIONAL');

-- CreateEnum
CREATE TYPE "DuelStatus" AS ENUM ('PENDENTE', 'ACEITO', 'RECUSADO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "ExerciseLogSource" AS ENUM ('MISSAO', 'BOSS', 'X1', 'LIVRE');

-- CreateEnum
CREATE TYPE "ExerciseUnit" AS ENUM ('REPETICOES', 'QUILOMETROS', 'SEGUNDOS');

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "rank" "Rank" NOT NULL DEFAULT 'E',
    "hp" INTEGER NOT NULL DEFAULT 100,
    "hpMax" INTEGER NOT NULL DEFAULT 100,
    "forca" INTEGER NOT NULL DEFAULT 10,
    "resistencia" INTEGER NOT NULL DEFAULT 10,
    "agilidade" INTEGER NOT NULL DEFAULT 10,
    "vitalidade" INTEGER NOT NULL DEFAULT 10,
    "stamina" INTEGER NOT NULL DEFAULT 10,
    "streakCurrent" INTEGER NOT NULL DEFAULT 0,
    "streakLongest" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" DATE,
    "eventCurrency" INTEGER NOT NULL DEFAULT 0,
    "skinTone" TEXT NOT NULL DEFAULT '#c68a5e',
    "hairStyle" "HairStyle" NOT NULL DEFAULT 'CURTO',
    "hairColor" TEXT NOT NULL DEFAULT '#1c1a19',
    "eyeColor" TEXT NOT NULL DEFAULT '#4cc9f0',
    "bodyType" "BodyType" NOT NULL DEFAULT 'ATLETICO',
    "equippedTitleId" TEXT,
    "isAlive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diedAt" TIMESTAMP(3),

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "slot" "EquipmentSlot",
    "rarity" "Rarity" NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "passive" TEXT,
    "active" TEXT,
    "stackable" BOOLEAN NOT NULL DEFAULT false,
    "tradeable" BOOLEAN NOT NULL DEFAULT false,
    "survivesDeath" BOOLEAN NOT NULL DEFAULT false,
    "reqLevel" INTEGER,
    "reqRank" "Rank",
    "reqForca" INTEGER,
    "reqResistencia" INTEGER,
    "reqAgilidade" INTEGER,
    "reqVitalidade" INTEGER,
    "reqStamina" INTEGER,
    "bonusForca" INTEGER NOT NULL DEFAULT 0,
    "bonusResistencia" INTEGER NOT NULL DEFAULT 0,
    "bonusAgilidade" INTEGER NOT NULL DEFAULT 0,
    "bonusVitalidade" INTEGER NOT NULL DEFAULT 0,
    "bonusStamina" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterEquipment" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "slot" "EquipmentSlot" NOT NULL,
    "itemId" TEXT NOT NULL,
    "equippedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerVaultItem" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PlayerVaultItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" "ExerciseUnit" NOT NULL,
    "description" TEXT,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseVariant" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "rank" "Rank" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "ExerciseVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mission" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "type" "MissionType" NOT NULL,
    "exerciseId" TEXT,
    "targetReps" INTEGER,
    "targetKm" DOUBLE PRECISION,
    "targetSeconds" INTEGER,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "itemRewardId" TEXT,
    "currencyReward" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionAssignment" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "assignedDate" DATE NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "MissionAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseLog" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "variantRank" "Rank",
    "reps" INTEGER,
    "durationSeconds" INTEGER,
    "distanceKm" DOUBLE PRECISION,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,
    "source" "ExerciseLogSource" NOT NULL,

    CONSTRAINT "ExerciseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterStats" (
    "characterId" TEXT NOT NULL,
    "flexoes" INTEGER NOT NULL DEFAULT 0,
    "agachamentos" INTEGER NOT NULL DEFAULT 0,
    "abdominais" INTEGER NOT NULL DEFAULT 0,
    "km" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exerciciosAvancados" INTEGER NOT NULL DEFAULT 0,
    "bossesDerrotados" INTEGER NOT NULL DEFAULT 0,
    "missoesConcluidas" INTEGER NOT NULL DEFAULT 0,
    "vitoriasX1" INTEGER NOT NULL DEFAULT 0,
    "derrotasX1" INTEGER NOT NULL DEFAULT 0,
    "maiorStreak" INTEGER NOT NULL DEFAULT 0,
    "eventosConcluidos" INTEGER NOT NULL DEFAULT 0,
    "mortes" INTEGER NOT NULL DEFAULT 0,
    "ressurreicoes" INTEGER NOT NULL DEFAULT 0,
    "itensLendarios" INTEGER NOT NULL DEFAULT 0,
    "itensDeus" INTEGER NOT NULL DEFAULT 0,
    "maiorLevel" INTEGER NOT NULL DEFAULT 1,
    "maiorRank" "Rank" NOT NULL DEFAULT 'E',

    CONSTRAINT "CharacterStats_pkey" PRIMARY KEY ("characterId")
);

-- CreateTable
CREATE TABLE "Boss" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rank" "Rank" NOT NULL,
    "hp" INTEGER NOT NULL,
    "dano" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "encounterType" "BossEncounterType" NOT NULL DEFAULT 'COMUM',
    "isPromotionTrialFor" "Rank",
    "imageUrl" TEXT,

    CONSTRAINT "Boss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BossAbility" (
    "id" TEXT NOT NULL,
    "bossId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "effectKey" TEXT NOT NULL,
    "triggerChance" DOUBLE PRECISION NOT NULL DEFAULT 0.25,

    CONSTRAINT "BossAbility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LootTableEntry" (
    "id" TEXT NOT NULL,
    "rank" "Rank" NOT NULL,
    "rarity" "Rarity" NOT NULL,
    "weight" INTEGER NOT NULL,

    CONSTRAINT "LootTableEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Battle" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "bossId" TEXT NOT NULL,
    "status" "BattleStatus" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "currentTurn" INTEGER NOT NULL DEFAULT 1,
    "bossHpRemaining" INTEGER NOT NULL,
    "isPromotionTrial" BOOLEAN NOT NULL DEFAULT false,
    "itemsSealed" BOOLEAN NOT NULL DEFAULT false,
    "duplicateNextChallenge" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Battle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleTurn" (
    "id" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "turnNumber" INTEGER NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "targetReps" INTEGER NOT NULL,
    "repsCompleted" INTEGER NOT NULL,
    "timeLimitSeconds" INTEGER NOT NULL,
    "timeRemainingSeconds" INTEGER NOT NULL,
    "performanceTier" "PerformanceTier" NOT NULL,
    "playerDamageDealt" INTEGER NOT NULL,
    "bossDamageDealt" INTEGER NOT NULL,
    "bossAbilityUsed" TEXT,
    "logText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BattleTurn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "effect" TEXT NOT NULL,
    "cost" TEXT NOT NULL,
    "cooldown" TEXT NOT NULL,
    "duration" TEXT,
    "awakenedCondition" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "isSecret" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSkill" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "conditionKey" TEXT NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterAchievement" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Title" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Title_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterTitle" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "titleId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterTitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rarity" "Rarity" NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GameEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopListing" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rarity" "Rarity" NOT NULL,
    "price" INTEGER NOT NULL,
    "exclusive" BOOLEAN NOT NULL DEFAULT false,
    "oneTimePerCharacter" BOOLEAN NOT NULL DEFAULT true,
    "itemId" TEXT,
    "icon" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ShopListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopPurchase" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priceSnapshot" INTEGER NOT NULL,

    CONSTRAINT "ShopPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Duel" (
    "id" TEXT NOT NULL,
    "challengerId" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "targetSeconds" INTEGER NOT NULL DEFAULT 45,
    "status" "DuelStatus" NOT NULL DEFAULT 'PENDENTE',
    "challengerScore" INTEGER,
    "opponentScore" INTEGER,
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Duel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeathRecord" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "diedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cause" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "rank" "Rank" NOT NULL,
    "revivedAt" TIMESTAMP(3),

    CONSTRAINT "DeathRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_username_key" ON "Player"("username");

-- CreateIndex
CREATE INDEX "Character_playerId_idx" ON "Character"("playerId");

-- CreateIndex
CREATE INDEX "Character_equippedTitleId_idx" ON "Character"("equippedTitleId");

-- CreateIndex
CREATE INDEX "InventoryItem_characterId_idx" ON "InventoryItem"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_characterId_itemId_key" ON "InventoryItem"("characterId", "itemId");

-- CreateIndex
CREATE INDEX "CharacterEquipment_characterId_idx" ON "CharacterEquipment"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterEquipment_characterId_slot_key" ON "CharacterEquipment"("characterId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerVaultItem_playerId_itemId_key" ON "PlayerVaultItem"("playerId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseVariant_exerciseId_rank_key" ON "ExerciseVariant"("exerciseId", "rank");

-- CreateIndex
CREATE INDEX "MissionAssignment_characterId_assignedDate_idx" ON "MissionAssignment"("characterId", "assignedDate");

-- CreateIndex
CREATE UNIQUE INDEX "MissionAssignment_characterId_missionId_assignedDate_key" ON "MissionAssignment"("characterId", "missionId", "assignedDate");

-- CreateIndex
CREATE INDEX "ExerciseLog_characterId_idx" ON "ExerciseLog"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "Boss_isPromotionTrialFor_key" ON "Boss"("isPromotionTrialFor");

-- CreateIndex
CREATE UNIQUE INDEX "LootTableEntry_rank_rarity_key" ON "LootTableEntry"("rank", "rarity");

-- CreateIndex
CREATE INDEX "Battle_characterId_idx" ON "Battle"("characterId");

-- CreateIndex
CREATE INDEX "BattleTurn_battleId_idx" ON "BattleTurn"("battleId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSkill_characterId_skillId_key" ON "CharacterSkill"("characterId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterAchievement_characterId_achievementId_key" ON "CharacterAchievement"("characterId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterTitle_characterId_titleId_key" ON "CharacterTitle"("characterId", "titleId");

-- CreateIndex
CREATE INDEX "ShopPurchase_characterId_idx" ON "ShopPurchase"("characterId");

-- CreateIndex
CREATE INDEX "Duel_challengerId_idx" ON "Duel"("challengerId");

-- CreateIndex
CREATE INDEX "Duel_opponentId_idx" ON "Duel"("opponentId");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_equippedTitleId_fkey" FOREIGN KEY ("equippedTitleId") REFERENCES "Title"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterEquipment" ADD CONSTRAINT "CharacterEquipment_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterEquipment" ADD CONSTRAINT "CharacterEquipment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerVaultItem" ADD CONSTRAINT "PlayerVaultItem_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerVaultItem" ADD CONSTRAINT "PlayerVaultItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseVariant" ADD CONSTRAINT "ExerciseVariant_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_itemRewardId_fkey" FOREIGN KEY ("itemRewardId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionAssignment" ADD CONSTRAINT "MissionAssignment_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionAssignment" ADD CONSTRAINT "MissionAssignment_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterStats" ADD CONSTRAINT "CharacterStats_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BossAbility" ADD CONSTRAINT "BossAbility_bossId_fkey" FOREIGN KEY ("bossId") REFERENCES "Boss"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_bossId_fkey" FOREIGN KEY ("bossId") REFERENCES "Boss"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleTurn" ADD CONSTRAINT "BattleTurn_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleTurn" ADD CONSTRAINT "BattleTurn_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSkill" ADD CONSTRAINT "CharacterSkill_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSkill" ADD CONSTRAINT "CharacterSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterAchievement" ADD CONSTRAINT "CharacterAchievement_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterAchievement" ADD CONSTRAINT "CharacterAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTitle" ADD CONSTRAINT "CharacterTitle_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTitle" ADD CONSTRAINT "CharacterTitle_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopListing" ADD CONSTRAINT "ShopListing_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopPurchase" ADD CONSTRAINT "ShopPurchase_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopPurchase" ADD CONSTRAINT "ShopPurchase_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "ShopListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Duel" ADD CONSTRAINT "Duel_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Duel" ADD CONSTRAINT "Duel_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Duel" ADD CONSTRAINT "Duel_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Duel" ADD CONSTRAINT "Duel_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeathRecord" ADD CONSTRAINT "DeathRecord_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
