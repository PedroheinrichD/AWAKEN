import { prisma } from "../../src/db"
import { ACHIEVEMENTS } from "./data/achievements"
import { BOSSES } from "./data/bosses"
import { EVENTS } from "./data/events"
import { EXERCISES } from "./data/exercises"
import { ITEMS } from "./data/items"
import { LOOT_TABLE } from "./data/lootTable"
import { MISSIONS } from "./data/missions"
import { SHOP_LISTINGS } from "./data/shop"
import { SKILLS } from "./data/skills"
import { TITLES } from "./data/titles"

async function seedExercises() {
  for (const exercise of EXERCISES) {
    await prisma.exercise.upsert({
      where: { id: exercise.id },
      update: { name: exercise.name, unit: exercise.unit, description: exercise.description },
      create: { id: exercise.id, name: exercise.name, unit: exercise.unit, description: exercise.description },
    })

    for (const variant of exercise.variants ?? []) {
      await prisma.exerciseVariant.upsert({
        where: { exerciseId_rank: { exerciseId: exercise.id, rank: variant.rank } },
        update: { name: variant.name, description: variant.description },
        create: { exerciseId: exercise.id, rank: variant.rank, name: variant.name, description: variant.description },
      })
    }
  }
  console.log(`Exercícios: ${EXERCISES.length}`)
}

async function seedItems() {
  for (const item of ITEMS) {
    await prisma.item.upsert({ where: { id: item.id }, update: item, create: item })
  }
  console.log(`Itens: ${ITEMS.length}`)
}

async function seedBosses() {
  for (const boss of BOSSES) {
    await prisma.boss.upsert({
      where: { id: boss.id },
      update: {
        name: boss.name,
        rank: boss.rank,
        hp: boss.hp,
        dano: boss.dano,
        description: boss.description,
        encounterType: boss.encounterType,
        isPromotionTrialFor: boss.isPromotionTrialFor,
      },
      create: {
        id: boss.id,
        name: boss.name,
        rank: boss.rank,
        hp: boss.hp,
        dano: boss.dano,
        description: boss.description,
        encounterType: boss.encounterType,
        isPromotionTrialFor: boss.isPromotionTrialFor,
      },
    })

    await prisma.bossAbility.deleteMany({ where: { bossId: boss.id } })
    await prisma.bossAbility.createMany({
      data: boss.abilities.map((ability) => ({
        bossId: boss.id,
        name: ability.name,
        description: ability.description,
        effectKey: ability.effectKey,
        triggerChance: ability.triggerChance,
      })),
    })
  }
  console.log(`Bosses: ${BOSSES.length}`)
}

async function seedMissions() {
  for (const mission of MISSIONS) {
    await prisma.mission.upsert({ where: { id: mission.id }, update: mission, create: mission })
  }
  console.log(`Missões: ${MISSIONS.length}`)
}

async function seedSkills() {
  for (const skill of SKILLS) {
    await prisma.skill.upsert({ where: { id: skill.id }, update: skill, create: { ...skill, isSecret: true } })
  }
  console.log(`Habilidades: ${SKILLS.length}`)
}

async function seedAchievements() {
  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({ where: { id: achievement.id }, update: achievement, create: achievement })
  }
  console.log(`Conquistas: ${ACHIEVEMENTS.length}`)
}

async function seedTitles() {
  for (const title of TITLES) {
    await prisma.title.upsert({ where: { id: title.id }, update: title, create: title })
  }
  console.log(`Títulos: ${TITLES.length}`)
}

async function seedEvents() {
  const now = Date.now()
  for (const event of EVENTS) {
    const startsAt = new Date(now - event.startedHoursAgo * 3_600_000)
    const endsAt = event.endsInHours !== undefined ? new Date(now + event.endsInHours * 3_600_000) : null
    await prisma.gameEvent.upsert({
      where: { id: event.id },
      update: { title: event.title, category: event.category, description: event.description, rarity: event.rarity, active: event.active, startsAt, endsAt },
      create: { id: event.id, title: event.title, category: event.category, description: event.description, rarity: event.rarity, active: event.active, startsAt, endsAt },
    })
  }
  console.log(`Eventos: ${EVENTS.length}`)
}

async function seedShop() {
  for (const listing of SHOP_LISTINGS) {
    await prisma.shopListing.upsert({ where: { id: listing.id }, update: listing, create: listing })
  }
  console.log(`Itens da loja: ${SHOP_LISTINGS.length}`)
}

async function seedLootTable() {
  for (const entry of LOOT_TABLE) {
    await prisma.lootTableEntry.upsert({
      where: { rank_rarity: { rank: entry.rank, rarity: entry.rarity } },
      update: { weight: entry.weight },
      create: entry,
    })
  }
  console.log(`Entradas de loot: ${LOOT_TABLE.length}`)
}

async function main() {
  console.log("Semeando o Sistema...")
  await seedExercises()
  await seedItems()
  await seedBosses()
  await seedMissions()
  await seedSkills()
  await seedAchievements()
  await seedTitles()
  await seedEvents()
  await seedShop()
  await seedLootTable()
  console.log("Sistema pronto.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
