"use client";

import { Palette } from "lucide-react";
import { ThemeSettings } from "@/components/ui/ThemeToggle";

export default function SettingsAppearancePage() {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-text text-xl font-semibold">Darstellung</h2>
        <p className="text-text-muted mt-1 text-sm">
          Passen Sie das Aussehen der Anwendung an Ihre Vorlieben an
        </p>
      </div>

      {/* Theme Settings Card */}
      <div className="border-border bg-surface rounded-xl border">
        <div className="border-border border-b p-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Palette className="text-primary h-5 w-5" />
            </div>
            <div>
              <h3 className="text-text font-semibold">Farbschema</h3>
              <p className="text-text-muted text-sm">
                Wählen Sie zwischen Hell, Dunkel oder System
              </p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <ThemeSettings />
        </div>
      </div>
    </div>
  );
}
