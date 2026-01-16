"use client";

import { useState, useEffect, useCallback } from "react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  display_name: string | null;
  role: string;
  is_seller: boolean;
  seller_verified: boolean;
  is_protected: boolean;
  created_at: string;
  resourceCount: number;
  transactionCount: number;
}

interface PaginatedResponse {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

const roleLabels: Record<string, string> = {
  BUYER: "Käufer",
  SELLER: "Verkäufer",
  SCHOOL: "Schule",
  ADMIN: "Administrator",
};

const roleBadgeColors: Record<string, string> = {
  BUYER: "bg-[var(--badge-info-bg)] text-[var(--badge-info-text)]",
  SELLER: "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]",
  SCHOOL: "bg-[var(--ctp-mauve)]/20 text-[var(--ctp-mauve)]",
  ADMIN: "bg-[var(--ctp-pink)]/20 text-[var(--ctp-pink)]",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data: PaginatedResponse = await response.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchUsers();
        setShowModal(false);
        setSelectedUser(null);
      } else {
        const error = await response.json();
        alert(error.error || "Fehler beim Aktualisieren");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifySeller = async (userId: string, verified: boolean) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller_verified: verified }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error verifying seller:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchUsers();
        setShowDeleteConfirm(false);
        setSelectedUser(null);
      } else {
        const error = await response.json();
        alert(error.error || "Fehler beim Löschen");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">Benutzerverwaltung</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Verwalten Sie alle registrierten Benutzer der Plattform.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Suche nach Name oder E-Mail..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value="">Alle Rollen</option>
          <option value="BUYER">Käufer</option>
          <option value="SELLER">Verkäufer</option>
          <option value="SCHOOL">Schule</option>
          <option value="ADMIN">Administrator</option>
        </select>
      </div>

      {/* Stats Bar */}
      <div className="mb-6 text-sm text-[var(--color-text-muted)]">
        {total} Benutzer gefunden
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-bg)]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                  Benutzer
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                  Rolle
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                  Ressourcen
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                  Registriert
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text)]">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                    Laden...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                    Keine Benutzer gefunden
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--color-bg)] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-[var(--color-text)]">
                          {user.display_name || user.name || "Unbekannt"}
                          {user.is_protected && (
                            <span className="ml-2 text-xs text-[var(--ctp-pink)]" title="Geschützt">
                              <svg className="inline h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-[var(--color-text-muted)]">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${roleBadgeColors[user.role]}`}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_seller && (
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          user.seller_verified
                            ? "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]"
                            : "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]"
                        }`}>
                          {user.seller_verified ? "Verifiziert" : "Nicht verifiziert"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">
                      {user.resourceCount}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">
                      {new Date(user.created_at).toLocaleDateString("de-CH")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.is_seller && !user.seller_verified && (
                          <button
                            onClick={() => handleVerifySeller(user.id, true)}
                            disabled={actionLoading}
                            className="rounded-lg bg-[var(--badge-success-bg)] px-3 py-1.5 text-xs font-medium text-[var(--badge-success-text)] hover:opacity-80 transition-opacity disabled:opacity-50"
                          >
                            Verifizieren
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                          className="rounded-lg bg-[var(--color-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors"
                        >
                          Bearbeiten
                        </button>
                        {!user.is_protected && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteConfirm(true);
                            }}
                            className="rounded-lg bg-[var(--badge-error-bg)] px-3 py-1.5 text-xs font-medium text-[var(--badge-error-text)] hover:opacity-80 transition-opacity"
                          >
                            Löschen
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Zurück
          </button>
          <span className="text-sm text-[var(--color-text-muted)]">
            Seite {page} von {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Weiter
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[var(--color-text)]">
                Benutzer bearbeiten
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-[var(--color-text)]">{selectedUser.display_name || selectedUser.name}</p>
              <p className="text-sm text-[var(--color-text-muted)]">{selectedUser.email}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                  Rolle ändern
                </label>
                <select
                  defaultValue={selectedUser.role}
                  onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                  disabled={selectedUser.is_protected || actionLoading}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-50"
                >
                  <option value="BUYER">Käufer</option>
                  <option value="SELLER">Verkäufer</option>
                  <option value="SCHOOL">Schule</option>
                  <option value="ADMIN">Administrator</option>
                </select>
                {selectedUser.is_protected && (
                  <p className="mt-2 text-xs text-[var(--ctp-pink)]">
                    Die Rolle dieses geschützten Benutzers kann nicht geändert werden.
                  </p>
                )}
              </div>

              {selectedUser.is_seller && (
                <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-4">
                  <div>
                    <p className="font-medium text-[var(--color-text)]">Verkäufer-Status</p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {selectedUser.seller_verified ? "Verifiziert" : "Nicht verifiziert"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleVerifySeller(selectedUser.id, !selectedUser.seller_verified)}
                    disabled={actionLoading}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50 ${
                      selectedUser.seller_verified
                        ? "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]"
                        : "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]"
                    }`}
                  >
                    {selectedUser.seller_verified ? "Entziehen" : "Verifizieren"}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
              >
                Schliessen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-[var(--badge-error-bg)] p-2">
                <svg className="h-6 w-6 text-[var(--badge-error-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text)]">
                Benutzer löschen?
              </h3>
            </div>

            <p className="mb-6 text-[var(--color-text-muted)]">
              Möchten Sie den Benutzer <strong className="text-[var(--color-text)]">{selectedUser.display_name || selectedUser.email}</strong> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                disabled={actionLoading}
                className="flex-1 rounded-lg bg-[var(--color-error)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {actionLoading ? "Löschen..." : "Ja, löschen"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedUser(null);
                }}
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
