/**
 * Shared icon mappings for Fachbereiche (subject areas)
 * Used across TopBar, LP21FilterSidebar, and other components
 */
import {
  BookOpen,
  Calculator,
  Leaf,
  Globe,
  Palette,
  Scissors,
  Music,
  Activity,
  Monitor,
  Compass,
  FlaskConical,
  Briefcase,
  Map,
  Users,
  ClipboardList,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const FACHBEREICH_ICONS: Record<string, LucideIcon> = {
  // Sprachen
  D: BookOpen, // Deutsch
  FR: Globe, // Französisch
  EN: Globe, // Englisch
  FS: Globe, // Legacy - Unified Fremdsprachen
  FS1E: Globe, // Legacy - English
  FS2F: Globe, // Legacy - French

  // Mathematik
  MA: Calculator,

  // Natur, Mensch, Gesellschaft
  NMG: Leaf, // Zyklus 1-2
  NT: FlaskConical, // Natur und Technik (Zyklus 3)
  WAH: Briefcase, // Wirtschaft, Arbeit, Haushalt
  RZG: Map, // Räume, Zeiten, Gesellschaften
  ERG: Users, // Ethik, Religionen, Gemeinschaft

  // Gestalten
  BG: Palette, // Bildnerisches Gestalten
  TTG: Scissors, // Textiles und Technisches Gestalten

  // Musik & Sport
  MU: Music,
  BS: Activity,

  // Medien und Informatik
  MI: Monitor,

  // Berufliche Orientierung
  BO: Compass,

  // Projektunterricht
  PU: ClipboardList,
};

export function getFachbereichIcon(code: string): LucideIcon {
  return FACHBEREICH_ICONS[code] || BookOpen;
}
