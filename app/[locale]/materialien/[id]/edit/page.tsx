"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useToast } from "@/components/ui/Toast";
import { Save, Loader2, ArrowLeft, Eye } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { roundToNearestHalfFranc } from "@/lib/utils/price";

interface MaterialData {
  id: string;
  title: string;
  description: string;
  price: number;
  subjects: string[];
  cycles: string[];
  isApproved: boolean;
  status: string;
  seller: {
    id: string;
  };
}

export default function EditMaterialPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const t = useTranslations("common");
  const { toast } = useToast();

  const materialId = params.id as string;

  const [material, setMaterial] = useState<MaterialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [isPublished, setIsPublished] = useState(true);

  // Fetch material data
  useEffect(() => {
    async function fetchMaterial() {
      try {
        const response = await fetch(`/api/materials/${materialId}`);
        if (!response.ok) {
          setError("Material nicht gefunden");
          return;
        }
        const data = await response.json();
        const m = data.material;
        setMaterial(m);
        setTitle(m.title);
        setDescription(m.description);
        setPrice(m.price);
      } catch {
        setError("Fehler beim Laden des Materials");
      } finally {
        setLoading(false);
      }
    }

    if (materialId) {
      fetchMaterial();
    }
  }, [materialId]);

  // Check ownership
  const isOwner = session?.user?.id && material?.seller?.id === session.user.id;

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        title,
        description,
        is_published: isPublished,
      };

      // Only include price if material is not yet approved
      if (!material?.isApproved) {
        body.price = price;
      }

      const response = await fetch(`/api/materials/${materialId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Fehler beim Speichern");
        return;
      }

      toast("Material erfolgreich aktualisiert", "success");
      router.push(`/materialien/${materialId}`);
    } catch {
      setError("Netzwerkfehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  if (error && !material) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-text mb-2 text-2xl font-bold">{error}</h1>
            <Link href="/konto/uploads" className="btn-primary mt-4 inline-block px-6 py-3">
              Zurück zu Uploads
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="bg-bg flex min-h-screen flex-col">
        <TopBar />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-text mb-2 text-2xl font-bold">Keine Berechtigung</h1>
            <p className="text-text-muted">Sie können nur Ihre eigenen Materialien bearbeiten.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Breadcrumb
          items={[
            { label: "Materialien", href: "/materialien" },
            { label: material?.title || "", href: `/materialien/${materialId}` },
            { label: "Bearbeiten" },
          ]}
        />

        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-text text-2xl font-bold sm:text-3xl">Material bearbeiten</h1>
          <Link
            href={`/materialien/${materialId}`}
            className="text-text-muted hover:text-text flex items-center gap-2 text-sm transition-colors"
          >
            <Eye className="h-4 w-4" />
            Vorschau
          </Link>
        </div>

        {/* Status info */}
        {material?.status && material.status !== "VERIFIED" && (
          <div className="bg-warning/10 border-warning/30 text-warning mb-6 rounded-lg border p-4 text-sm">
            {material.status === "PENDING"
              ? "Dieses Material wird noch überprüft."
              : "Dieses Material wurde abgelehnt."}
          </div>
        )}

        <div className="card space-y-6 p-6 sm:p-8">
          {/* Title */}
          <div>
            <label className="text-text mb-2 block text-sm font-medium">
              Titel <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={64}
              className="input w-full"
              placeholder="Titel des Materials"
            />
            <p className="text-text-muted mt-1 text-xs">{title.length}/64 Zeichen</p>
          </div>

          {/* Description */}
          <div>
            <label className="text-text mb-2 block text-sm font-medium">
              Beschreibung <span className="text-error">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={5000}
              rows={6}
              className="input w-full resize-y"
              placeholder="Beschreibung des Materials"
            />
            <p className="text-text-muted mt-1 text-xs">{description.length}/5000 Zeichen</p>
          </div>

          {/* Price (only editable if not approved) */}
          <div>
            <label className="text-text mb-2 block text-sm font-medium">
              Preis (CHF)
              {material?.isApproved && (
                <span className="text-text-muted ml-2 text-xs font-normal">
                  (Preis kann nach Genehmigung nicht geändert werden)
                </span>
              )}
            </label>
            <input
              type="number"
              value={price / 100}
              onChange={(e) => setPrice(Math.round(parseFloat(e.target.value || "0") * 100))}
              onBlur={() => {
                const valCHF = price / 100;
                if (valCHF > 0) {
                  const rounded = roundToNearestHalfFranc(valCHF);
                  setPrice(Math.round(rounded * 100));
                }
              }}
              disabled={material?.isApproved}
              min={0}
              max={1000}
              step={0.5}
              className="input w-full disabled:opacity-50"
            />
            <p className="text-text-muted mt-1 text-xs">
              {price === 0 ? "Gratis" : `CHF ${(price / 100).toFixed(2)}`}
            </p>
          </div>

          {/* Publish toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="accent-primary h-4 w-4"
            />
            <label htmlFor="published" className="text-text text-sm">
              Material veröffentlicht
            </label>
          </div>

          {/* Subjects & Cycles (read-only display) */}
          {material && (
            <div className="border-border space-y-3 border-t pt-4">
              <p className="text-text-muted text-xs">
                Fächer und Zyklen können derzeit nicht geändert werden.
              </p>
              <div className="flex flex-wrap gap-2">
                {material.subjects.map((s) => (
                  <span key={s} className="pill pill-primary">
                    {s}
                  </span>
                ))}
                {material.cycles.map((c) => (
                  <span key={c} className="pill pill-secondary">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && <div className="bg-error/10 text-error rounded-lg p-4 text-sm">{error}</div>}

          {/* Actions */}
          <div className="border-border flex items-center justify-between border-t pt-6">
            <Link
              href="/konto/uploads"
              className="text-text-muted hover:text-text flex items-center gap-2 text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </Link>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim() || !description.trim()}
              className="btn-primary flex items-center gap-2 px-6 py-3 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Speichern
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
