/*
  Warnings:

  - You are about to drop the column `target` on the `missionassignment` table. All the data in the column will be lost.
  - Added the required column `objective` to the `Mission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `battle` ADD COLUMN `duplicateNextChallenge` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `itemsSealed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `mission` ADD COLUMN `objective` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `missionassignment` DROP COLUMN `target`;
