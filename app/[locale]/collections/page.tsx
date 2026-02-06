"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import TopBar from "@/components/ui/TopBar";
import Footer from "@/components/ui/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  Plus,
  FolderOpen,
  FileText,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  GripVertical,
  X,
} from "lucide-react";

interface CollectionItem {
  id: string;
  position: number;
  resource: {
    id: string;
    title: string;
    preview_url: string | null;
    price: number;
    subjects: string[];
  };
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  position: number;
  created_at: string;
  itemCount: number;
  items: CollectionItem[];
}

export default function CollectionsPage() {
  const { status } = useSession();
  const router = useRouter();
  const tCommon = useTranslations("common");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", is_public: true });
  const [formLoading, setFormLoading] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch collections
  const fetchCollections = useCallback(async () => {
    try {
      const response = await fetch("/api/collections");
      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCollections();
    }
  }, [status, fetchCollections]);

  // Create collection
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setFormLoading(true);
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCollections();
        setShowCreateModal(false);
        setFormData({ name: "", description: "", is_public: true });
      }
    } catch (error) {
      console.error("Error creating collection:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Update collection
  const handleUpdateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection || !formData.name.trim()) return;

    setFormLoading(true);
    try {
      const response = await fetch(`/api/collections/${editingCollection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCollections();
        setEditingCollection(null);
        setFormData({ name: "", description: "", is_public: true });
      }
    } catch (error) {
      console.error("Error updating collection:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete collection
  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm("Sind Sie sicher, dass Sie diese Sammlung löschen möchten?")) return;

    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCollections();
        if (selectedCollection?.id === collectionId) {
          setSelectedCollection(null);
        }
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

  // Remove item from collection
  const handleRemoveItem = async (collectionId: string, itemId: string) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}/items?itemId=${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCollections();
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Handle drag and drop for reordering
  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetItemId: string) => {
    if (!draggedItem || !selectedCollection || draggedItem === targetItemId) {
      setDraggedItem(null);
      return;
    }

    const items = [...selectedCollection.items];
    const draggedIndex = items.findIndex((i) => i.id === draggedItem);
    const targetIndex = items.findIndex((i) => i.id === targetItemId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    // Reorder items
    const [removed] = items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, removed);

    // Update positions
    const reorderedItems = items.map((item, index) => ({
      id: item.id,
      position: index,
    }));

    // Optimistic update
    setSelectedCollection({
      ...selectedCollection,
      items: items.map((item, index) => ({ ...item, position: index })),
    });

    try {
      await fetch(`/api/collections/${selectedCollection.id}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reorderedItems }),
      });
      await fetchCollections();
    } catch (error) {
      console.error("Error reordering items:", error);
    }

    setDraggedItem(null);
  };

  // Start editing
  const startEditing = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || "",
      is_public: collection.is_public,
    });
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="bg-bg flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Breadcrumb items={[{ label: tCommon("breadcrumb.collections") }]} />
            <h1 className="text-text text-2xl font-bold">Meine Sammlungen</h1>
            <p className="text-text-muted mt-1">Organisieren Sie Ihre Materialien in Sammlungen</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary-hover flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            Neue Sammlung
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Collections List */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="border-border border-b p-4">
                <h2 className="text-text font-semibold">Sammlungen ({collections.length})</h2>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                </div>
              ) : collections.length === 0 ? (
                <div className="p-8 text-center">
                  <FolderOpen className="text-text-faint mx-auto mb-4 h-12 w-12" />
                  <p className="text-text-muted">Noch keine Sammlungen</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-primary mt-4 text-sm font-medium hover:underline"
                  >
                    Erste Sammlung erstellen
                  </button>
                </div>
              ) : (
                <div className="divide-border divide-y">
                  {collections.map((collection) => (
                    <div
                      key={collection.id}
                      onClick={() => setSelectedCollection(collection)}
                      className={`hover:bg-surface-elevated cursor-pointer p-4 transition-colors ${
                        selectedCollection?.id === collection.id ? "bg-surface-elevated" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-text truncate font-medium">{collection.name}</h3>
                            {collection.is_public ? (
                              <Eye className="text-success h-4 w-4" />
                            ) : (
                              <EyeOff className="text-text-muted h-4 w-4" />
                            )}
                          </div>
                          <p className="text-text-muted mt-1 text-sm">
                            {collection.itemCount} Materialien
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(collection);
                            }}
                            className="text-text-muted hover:bg-surface hover:text-text rounded p-1.5 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCollection(collection.id);
                            }}
                            className="text-text-muted hover:bg-error/10 hover:text-error rounded p-1.5 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Collection Details */}
          <div className="lg:col-span-2">
            {selectedCollection ? (
              <div className="card">
                <div className="border-border border-b p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-text text-lg font-semibold">{selectedCollection.name}</h2>
                      {selectedCollection.description && (
                        <p className="text-text-muted mt-1 text-sm">
                          {selectedCollection.description}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/profile/${selectedCollection.id}`}
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      Öffentlich ansehen
                    </Link>
                  </div>
                </div>

                {selectedCollection.items.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileText className="text-text-faint mx-auto mb-4 h-12 w-12" />
                    <p className="text-text">Noch keine Materialien in dieser Sammlung</p>
                    <p className="text-text-muted mt-2 text-sm">
                      Ziehen Sie Materialien per Drag & Drop hierher oder fügen Sie sie über die
                      Materialien-Seite hinzu.
                    </p>
                    <Link
                      href="/account"
                      className="text-primary mt-4 inline-block text-sm font-medium hover:underline"
                    >
                      Zu meinen Uploads →
                    </Link>
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="text-text-muted mb-4 text-sm">
                      Ziehen Sie Materialien, um die Reihenfolge zu ändern
                    </p>
                    <div className="space-y-2">
                      {selectedCollection.items
                        .sort((a, b) => a.position - b.position)
                        .map((item) => (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={() => handleDragStart(item.id)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(item.id)}
                            className={`border-border bg-bg flex items-center gap-4 rounded-lg border p-3 transition-all ${
                              draggedItem === item.id ? "opacity-50" : "hover:border-primary"
                            }`}
                          >
                            <div className="text-text-muted cursor-grab">
                              <GripVertical className="h-5 w-5" />
                            </div>

                            <div className="bg-surface h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                              {item.resource.preview_url ? (
                                <Image
                                  src={item.resource.preview_url}
                                  alt={item.resource.title}
                                  width={48}
                                  height={48}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <FileText className="text-text-faint h-6 w-6" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/materialien/${item.resource.id}`}
                                className="text-text hover:text-primary font-medium"
                              >
                                {item.resource.title}
                              </Link>
                              <div className="mt-1 flex items-center gap-2">
                                {item.resource.subjects[0] && (
                                  <span className="pill pill-primary text-xs">
                                    {item.resource.subjects[0]}
                                  </span>
                                )}
                                <span className="text-text-muted text-sm">
                                  {item.resource.price === 0
                                    ? "Gratis"
                                    : `CHF ${(item.resource.price / 100).toFixed(2)}`}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveItem(selectedCollection.id, item.id)}
                              className="text-text-muted hover:bg-error/10 hover:text-error rounded p-2 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card flex items-center justify-center p-12">
                <div className="text-center">
                  <FolderOpen className="text-text-faint mx-auto mb-4 h-16 w-16" />
                  <p className="text-text">Wählen Sie eine Sammlung aus</p>
                  <p className="text-text-muted mt-2 text-sm">
                    oder erstellen Sie eine neue Sammlung
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Modal */}
      {(showCreateModal || editingCollection) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface w-full max-w-md rounded-xl p-6">
            <h2 className="text-text mb-4 text-lg font-semibold">
              {editingCollection ? "Sammlung bearbeiten" : "Neue Sammlung"}
            </h2>

            <form onSubmit={editingCollection ? handleUpdateCollection : handleCreateCollection}>
              <div className="space-y-4">
                <div>
                  <label className="text-text mb-1 block text-sm font-medium">
                    Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="z.B. Mathematik Zyklus 2"
                    className="border-border bg-bg text-text focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-text mb-1 block text-sm font-medium">Beschreibung</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optionale Beschreibung..."
                    rows={3}
                    className="border-border bg-bg text-text focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:outline-none"
                  />
                </div>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="text-primary h-4 w-4 rounded"
                  />
                  <span className="text-text text-sm">Öffentlich sichtbar auf meinem Profil</span>
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCollection(null);
                    setFormData({ name: "", description: "", is_public: true });
                  }}
                  className="border-border text-text hover:bg-surface-elevated rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={formLoading || !formData.name.trim()}
                  className="bg-primary hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
                >
                  {formLoading ? "Speichern..." : editingCollection ? "Speichern" : "Erstellen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
