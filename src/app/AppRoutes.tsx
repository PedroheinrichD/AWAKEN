import { Navigate, Route, Routes } from "react-router-dom"
import { AchievementsScreen } from "@/screens/Achievements"
import { BossesScreen } from "@/screens/Bosses"
import { BossFightScreen } from "@/screens/BossFight"
import { CharacterScreen } from "@/screens/Character"
import { DuelScreen } from "@/screens/Duel"
import { EquipmentScreen } from "@/screens/Equipment"
import { EventShopScreen } from "@/screens/EventShop"
import { EventsScreen } from "@/screens/Events"
import { HomeScreen } from "@/screens/Home"
import { InventoryScreen } from "@/screens/Inventory"
import { MapScreen } from "@/screens/Map"
import { MissionsScreen } from "@/screens/Missions"
import { SettingsScreen } from "@/screens/Settings"
import { SkillsScreen } from "@/screens/Skills"
import { StatsScreen } from "@/screens/Stats"
import { TitlesScreen } from "@/screens/Titles"
import { AppShell } from "./AppShell"

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomeScreen />} />
        <Route path="personagem" element={<CharacterScreen />} />
        <Route path="equipamentos" element={<EquipmentScreen />} />
        <Route path="inventario" element={<InventoryScreen />} />
        <Route path="missoes" element={<MissionsScreen />} />
        <Route path="bosses" element={<BossesScreen />} />
        <Route path="bosses/:bossId" element={<BossFightScreen />} />
        <Route path="habilidades" element={<SkillsScreen />} />
        <Route path="eventos" element={<EventsScreen />} />
        <Route path="loja-eventos" element={<EventShopScreen />} />
        <Route path="mapa" element={<MapScreen />} />
        <Route path="x1" element={<DuelScreen />} />
        <Route path="conquistas" element={<AchievementsScreen />} />
        <Route path="titulos" element={<TitlesScreen />} />
        <Route path="estatisticas" element={<StatsScreen />} />
        <Route path="opcoes" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
