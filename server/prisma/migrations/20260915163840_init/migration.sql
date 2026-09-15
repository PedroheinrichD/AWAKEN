-- CreateTable
CREATE TABLE `Player` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Player_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Character` (
    `id` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `xp` INTEGER NOT NULL DEFAULT 0,
    `rank` ENUM('E', 'D', 'C', 'B', 'A', 'S', 'SPLUS') NOT NULL DEFAULT 'E',
    `hp` INTEGER NOT NULL DEFAULT 100,
    `hpMax` INTEGER NOT NULL DEFAULT 100,
    `forca` INTEGER NOT NULL DEFAULT 10,
    `resistencia` INTEGER NOT NULL DEFAULT 10,
    `agilidade` INTEGER NOT NULL DEFAULT 10,
    `vitalidade` INTEGER NOT NULL DEFAULT 10,
    `stamina` INTEGER NOT NULL DEFAULT 10,
    `streakCurrent` INTEGER NOT NULL DEFAULT 0,
    `streakLongest` INTEGER NOT NULL DEFAULT 0,
    `lastActiveDate` DATE NULL,
    `eventCurrency` INTEGER NOT NULL DEFAULT 0,
    `skinTone` VARCHAR(191) NOT NULL DEFAULT '#c68a5e',
    `hairStyle` ENUM('RASPADO', 'CURTO', 'LONGO', 'PRESO') NOT NULL DEFAULT 'CURTO',
    `hairColor` VARCHAR(191) NOT NULL DEFAULT '#1c1a19',
    `eyeColor` VARCHAR(191) NOT NULL DEFAULT '#4cc9f0',
    `bodyType` ENUM('ESGUIO', 'ATLETICO', 'ROBUSTO') NOT NULL DEFAULT 'ATLETICO',
    `equippedTitleId` VARCHAR(191) NULL,
    `isAlive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `diedAt` DATETIME(3) NULL,

    INDEX `Character_playerId_idx`(`playerId`),
    INDEX `Character_equippedTitleId_idx`(`equippedTitleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('ARMA', 'ARMADURA', 'ROUPA', 'ACESSORIO', 'ITEM', 'POCAO', 'ITEM_MAGICO') NOT NULL,
    `slot` ENUM('CABECA', 'CORPO', 'MAOS', 'PERNAS', 'PES', 'ARMA', 'ACESSORIO1', 'ACESSORIO2') NULL,
    `rarity` ENUM('COMUM', 'INCOMUM', 'RARO', 'ULTRA_RARO', 'LENDARIO', 'DEUS') NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `passive` TEXT NULL,
    `active` TEXT NULL,
    `stackable` BOOLEAN NOT NULL DEFAULT false,
    `tradeable` BOOLEAN NOT NULL DEFAULT false,
    `survivesDeath` BOOLEAN NOT NULL DEFAULT false,
    `reqLevel` INTEGER NULL,
    `reqRank` ENUM('E', 'D', 'C', 'B', 'A', 'S', 'SPLUS') NULL,
    `reqForca` INTEGER NULL,
    `reqResistencia` INTEGER NULL,
    `reqAgilidade` INTEGER NULL,
    `reqVitalidade` INTEGER NULL,
    `reqStamina` INTEGER NULL,
    `bonusForca` INTEGER NOT NULL DEFAULT 0,
    `bonusResistencia` INTEGER NOT NULL DEFAULT 0,
    `bonusAgilidade` INTEGER NOT NULL DEFAULT 0,
    `bonusVitalidade` INTEGER NOT NULL DEFAULT 0,
    `bonusStamina` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InventoryItem` (
    `id` VARCHAR(191) NOT NULL,
    `characterId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `acquiredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `source` VARCHAR(191) NULL,

    INDEX `InventoryItem_characterId_idx`(`characterId`),
    UNIQUE INDEX `InventoryItem_characterId_itemId_key`(`characterId`, `itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CharacterEquipment` (
    `id` VARCHAR(191) NOT NULL,
    `characterId` VARCHAR(191) NOT NULL,
    `slot` ENUM('CABECA', 'CORPO', 'MAOS', 'PERNAS', 'PES', 'ARMA', 'ACESSORIO1', 'ACESSORIO2') NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `equippedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CharacterEquipment_characterId_idx`(`characterId`),
    UNIQUE INDEX `CharacterEquipment_characterId_slot_key`(`characterId`, `slot`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerVaultItem` (
    `id` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `PlayerVaultItem_playerId_itemId_key`(`playerId`, `itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Exercise` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `unit` ENUM('REPETICOES', 'QUILOMETROS', 'SEGUNDOS') NOT NULL,
    `description` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExerciseVariant` (
    `id` VARCHAR(191) NOT NULL,
    `exerciseId` VARCHAR(191) NOT NULL,
    `rank` ENUM('E', 'D', 'C', 'B', 'A', 'S', 'SPLUS') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,

    UNIQUE INDEX `ExerciseVariant_exerciseId_rank_key`(`exerciseId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mission` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `type` ENUM('DIARIA', 'BONUS', 'ESPECIAL') NOT NULL,
    `exerciseId` VARCHAR(191) NULL,
    `targetReps` INTEGER NULL,
    `targetKm` DOUBLE NULL,
    `targetSeconds` INTEGER NULL,
    `xpReward` INTEGER NOT NULL DEFAULT 0,
    `itemRewardId` VARCHAR(191) NULL,
    `currencyReward` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MissionAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `characterId` VARCHAR(191) NOT NULL,
    `missionId` VARCHAR(191) NOT NULL,
    `assignedDate` DATE NOT NULL,
    `progress` INTEGER NOT NULL DEFAULT 0,
    `target` INTEGER NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,

    INDEX `MissionAssignment_characterId_assignedDate_idx`(`characterId`, `assignedDate`),
    UNIQUE INDEX `MissionAssignment_characterId_missionId_assignedDate_key`(`characterId`, `missionId`, `assignedDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExerciseLog` (
    `id` VARCHAR(191) NOT NULL,
    `characterId` VARCHAR(191) NOT NULL,
    `exerciseId` VARCHAR(191) NOT NULL,
    `variantRank` ENUM('E', 'D', 'C', 'B', 'A', 'S', 'SPLUS') NULL,
    `reps` INTEGER NULL,
    `durationSeconds` INTEGER NULL,
    `distanceKm` DOUBLE NULL,
    `performedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `xpAwarded` INTEGER NOT NULL DEFAULT 0,
    `source` ENUM('MISSAO', 'BOSS', 'X1', 'LIVRE') NOT NULL,

    INDEX `ExerciseLog_characterId_idx`(`characterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CharacterStats` (
    `characterId` VARCHAR(191) NOT NULL,
    `flexoes` INTEGER NOT NULL DEFAULT 0,
    `agachamentos` INTEGER NOT NULL DEFAULT 0,
    `abdominais` INTEGER NOT NULL DEFAULT 0,
    `km` DOUBLE NOT NULL DEFAULT 0,
    `exerciciosAvancados` INTEGER NOT NULL DEFAULT 0,
    `bossesDerrotados` INTEGER NOT NULL DEFAULT 0,
    `missoesConcluidas` INTEGER NOT NULL DEFAULT 0,
    `vitoriasX1` INTEGER NOT NULL DEFAULT 0,
    `derrotasX1` INTEGER NOT NULL DEFAULT 0,
    `maiorStreak` INTEGER NOT NULL DEFAULT 0,
    `eventosConcluidos` INTEGER NOT NULL DEFAULT 0,
    `mortes` INTEGER NOT NULL DEFAULT 0,
    `ressurreicoes` INTEGER NOT NULL DEFAULT 0,
    `itensLendarios` INTEGER NOT NULL DEFAULT 0,
    `itensDeus` INTEGER NOT NULL DEFAULT 0,
    `maiorLevel` INTEGER NOT NULL DEFAULT 1,
    `maiorRank` ENUM('E', 'D', 'C', 'B', 'A', 'S', 'SPLUS') NOT NULL DEFAULT 'E',

    PRIMARY KEY (`characterId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Boss` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `rank` ENUM('E', 'D', 'C', 'B', 'A', 'S', 'SPLUS') NOT NULL,
    `hp` INTEGER NOT NULL,
    `dano` INTEGER NOT NULL,
    `description` TEXT NOT NULL,
    `encounterType` ENUM('COMUM', 'ERRANTE', 'SECRETO') NOT NULL DEFAULT 'COMUM',
    `isPromotionTrialFor` ENUM('E', 'D', 'C', 'B', 'A', 'S', 'SPLUS') NULL,
    `imageUrl` VARCHAR(191) NULL,

    UNIQUE INDEX `Boss_isPromotionTrialFor_key`(`isPromotionTrialFor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BossAbility` (
    `id` VARCHAR(191) NOT NULL,
    `bossId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `effectKey` VARCHAR(191) NOT NULL,
    `triggerChance` DOUBLE NOT NULL DEFAULT 0.25,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LootTableEntry` (
    `id` VARCHAR(191) NOT NULL,
    `rank` ENUM('E', 'D', 'C', 'B', 'A', 'S', 'SPLUS') NOT NULL,
    `rarity` ENUM('COMUM', 'INCOMUM', 'RARO', 'ULTRA_RARO', 'LENDARIO', 'DEUS') NOT NULL,
    `weight` INTEGER NOT NULL,

    UNIQUE INDEX `LootTableEntry_rank_rarity_key`(`rank`, `rarity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Battle` (
    `id` VARCHAR(191) NOT NULL,
    `characterId` VARCHAR(191) NOT NULL,
    `bossId` VARCHAR(191) NOT NULL,
    `status` ENUM('EM_ANDAMENTO', 'VITORIA', 'DERROTA') NOT NULL DEFAULT 'EM_ANDAMENTO',
    `currentTurn` INTEGER NOT NULL DEFAULT 1,
    `bossHpRemaining` INTEGER NOT NULL,
    `isPromotionTrial` BOOLEAN NOT NULL DEFAULT false,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endedAt` DATETIME(3) NULL,

    INDEX `Battle_characterId_idx`(`characterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BattleTurn` (
    `id` VARCHAR(191) NOT NULL,
    `battleId` VARCHAR(191) NOT NULL,
    `turnNumber` INTEGER NOT NULL,
    `exerciseId` VARCHAR(191) NOT NULL,
    `targetReps` INTEGER NOT NULL,
    `repsCompleted` INTEGER NOT NULL,
    `timeLimitSeconds` INTEGER NOT NULL,
    `timeRemainingSeconds` INTEGER NOT NULL,
    `performanceTier` ENUM('RUIM', 'NORMAL', 'EXCELENTE', 'EXCEPCIONAL') NOT NULL,
    `playerDamageDealt` INTEGER NOT NULL,
    `bossDamageDealt` INTEGER NOT NULL,
    `bossAbilityUsed` VARCHAR(191) NULL,
    `logText` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BattleTurn_battleId_idx`(`battleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Skill` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `effect` TEXT NOT NULL,
    `cost` VARCHAR(191) NOT NULL,
    `cooldown` VARCHAR(191) NOT NULL,
    `duration` VARCHAR(191) NULL,
    `awakenedCondition` TEXT NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `isSecret` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CharacterSkill` (
    `id` VARCHAR(191) NOT NULL,
    `characterId` VARCHAR(191) NOT NULL,
    `skillId` VARCHAR(191) NOT NULL,
    `discoveredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CharacterSkill_characterId_skillId_key`(`characterId`, `skillId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Achievement` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `conditionKey` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CharacterAchievement` (
    `id` VARCHAR(191) NOT NULL,
    `characterId` VARCHAR(191) NOT NULL,
    `achievementId` VARCHAR(191) NOT NULL,
    `unlockedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CharacterAchievement_characterId_achievementId_key`(`characterId`, `achievementId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Title` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CharacterTitle` (
    `id` VARCHAR(191) NOT NULL,
    `characterId` VARCHAR(191) NOT NULL,
    `titleId` VARCHAR(191) NOT NULL,
    `unlockedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CharacterTitle_characterId_titleId_key`(`characterId`, `titleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameEvent` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `rarity` ENUM('COMUM', 'INCOMUM', 'RARO', 'ULTRA_RARO', 'LENDARIO', 'DEUS') NOT NULL,
    `startsAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endsAt` DATETIME(3) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopListing` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `rarity` ENUM('COMUM', 'INCOMUM', 'RARO', 'ULTRA_RARO', 'LENDARIO', 'DEUS') NOT NULL,
    `price` INTEGER NOT NULL,
    `exclusive` BOOLEAN NOT NULL DEFAULT false,
    `oneTimePerCharacter` BOOLEAN NOT NULL DEFAULT true,
    `itemId` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopPurchase` (
    `id` VARCHAR(191) NOT NULL,
    `characterId` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NOT NULL,
    `purchasedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `priceSnapshot` INTEGER NOT NULL,

    INDEX `ShopPurchase_characterId_idx`(`characterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Duel` (
    `id` VARCHAR(191) NOT NULL,
    `challengerId` VARCHAR(191) NOT NULL,
    `opponentId` VARCHAR(191) NOT NULL,
    `exerciseId` VARCHAR(191) NOT NULL,
    `targetSeconds` INTEGER NOT NULL DEFAULT 45,
    `status` ENUM('PENDENTE', 'ACEITO', 'RECUSADO', 'CONCLUIDO') NOT NULL DEFAULT 'PENDENTE',
    `challengerScore` INTEGER NULL,
    `opponentScore` INTEGER NULL,
    `winnerId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `respondedAt` DATETIME(3) NULL,
    `resolvedAt` DATETIME(3) NULL,

    INDEX `Duel_challengerId_idx`(`challengerId`),
    INDEX `Duel_opponentId_idx`(`opponentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeathRecord` (
    `id` VARCHAR(191) NOT NULL,
    `characterId` VARCHAR(191) NOT NULL,
    `diedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cause` VARCHAR(191) NOT NULL,
    `level` INTEGER NOT NULL,
    `rank` ENUM('E', 'D', 'C', 'B', 'A', 'S', 'SPLUS') NOT NULL,
    `revivedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Character` ADD CONSTRAINT `Character_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Character` ADD CONSTRAINT `Character_equippedTitleId_fkey` FOREIGN KEY (`equippedTitleId`) REFERENCES `Title`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryItem` ADD CONSTRAINT `InventoryItem_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryItem` ADD CONSTRAINT `InventoryItem_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterEquipment` ADD CONSTRAINT `CharacterEquipment_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterEquipment` ADD CONSTRAINT `CharacterEquipment_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerVaultItem` ADD CONSTRAINT `PlayerVaultItem_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerVaultItem` ADD CONSTRAINT `PlayerVaultItem_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExerciseVariant` ADD CONSTRAINT `ExerciseVariant_exerciseId_fkey` FOREIGN KEY (`exerciseId`) REFERENCES `Exercise`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mission` ADD CONSTRAINT `Mission_exerciseId_fkey` FOREIGN KEY (`exerciseId`) REFERENCES `Exercise`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mission` ADD CONSTRAINT `Mission_itemRewardId_fkey` FOREIGN KEY (`itemRewardId`) REFERENCES `Item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MissionAssignment` ADD CONSTRAINT `MissionAssignment_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MissionAssignment` ADD CONSTRAINT `MissionAssignment_missionId_fkey` FOREIGN KEY (`missionId`) REFERENCES `Mission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExerciseLog` ADD CONSTRAINT `ExerciseLog_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExerciseLog` ADD CONSTRAINT `ExerciseLog_exerciseId_fkey` FOREIGN KEY (`exerciseId`) REFERENCES `Exercise`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterStats` ADD CONSTRAINT `CharacterStats_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BossAbility` ADD CONSTRAINT `BossAbility_bossId_fkey` FOREIGN KEY (`bossId`) REFERENCES `Boss`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Battle` ADD CONSTRAINT `Battle_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Battle` ADD CONSTRAINT `Battle_bossId_fkey` FOREIGN KEY (`bossId`) REFERENCES `Boss`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BattleTurn` ADD CONSTRAINT `BattleTurn_battleId_fkey` FOREIGN KEY (`battleId`) REFERENCES `Battle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BattleTurn` ADD CONSTRAINT `BattleTurn_exerciseId_fkey` FOREIGN KEY (`exerciseId`) REFERENCES `Exercise`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterSkill` ADD CONSTRAINT `CharacterSkill_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterSkill` ADD CONSTRAINT `CharacterSkill_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `Skill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterAchievement` ADD CONSTRAINT `CharacterAchievement_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterAchievement` ADD CONSTRAINT `CharacterAchievement_achievementId_fkey` FOREIGN KEY (`achievementId`) REFERENCES `Achievement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterTitle` ADD CONSTRAINT `CharacterTitle_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterTitle` ADD CONSTRAINT `CharacterTitle_titleId_fkey` FOREIGN KEY (`titleId`) REFERENCES `Title`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopListing` ADD CONSTRAINT `ShopListing_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopPurchase` ADD CONSTRAINT `ShopPurchase_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopPurchase` ADD CONSTRAINT `ShopPurchase_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `ShopListing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Duel` ADD CONSTRAINT `Duel_challengerId_fkey` FOREIGN KEY (`challengerId`) REFERENCES `Character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Duel` ADD CONSTRAINT `Duel_opponentId_fkey` FOREIGN KEY (`opponentId`) REFERENCES `Character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Duel` ADD CONSTRAINT `Duel_exerciseId_fkey` FOREIGN KEY (`exerciseId`) REFERENCES `Exercise`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Duel` ADD CONSTRAINT `Duel_winnerId_fkey` FOREIGN KEY (`winnerId`) REFERENCES `Character`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeathRecord` ADD CONSTRAINT `DeathRecord_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
