"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { FocusTrap } from "@/components/ui/FocusTrap";
import { useToast } from "@/components/ui/Toast";
import type { AdminUser, AdminUsersResponse } from "@/lib/types/admin";

const roleBadgeColors: Record<string, string> = {
  BUYER: "pill-primary",
  SELLER: "pill-success",
  ADMIN: "pill-error",
};

export default function AdminUsersPage() {
  const t = useTranslations("admin.users");
  const { toast } = useToast();

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      BUYER: t("buyer"),
      SELLER: t("seller"),
      ADMIN: t("administrator"),
    };
    return labels[role] || role;
  };

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
        const data: AdminUsersResponse = await response.json();
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
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
        toast(error.error || t("errorUpdating"), "error");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleVerifySeller = async (userId: string, currentlyVerified: boolean) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify-seller`, {
        method: currentlyVerified ? "DELETE" : "POST",
      });

      if (response.ok) {
        fetchUsers();
        setShowModal(false);
        setSelectedUser(null);
      } else {
        const error = await response.json();
        toast(error.error || t("errorUpdating"), "error");
      }
    } catch (error) {
      console.error("Error toggling seller verification:", error);
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
        toast(error.error || t("errorDeleting"), "error");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <svg
          className="text-text-muted absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border-border bg-surface text-text placeholder:text-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border py-2.5 pr-4 pl-12 focus:ring-2 focus:outline-none"
        />
      </div>

      {/* Role Tabs */}
      <div className="tab-container">
        {[
          { value: "", label: t("all") },
          { value: "BUYER", label: t("buyers") },
          { value: "SELLER", label: t("sellers") },
          { value: "ADMIN", label: t("admins") },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setRoleFilter(tab.value);
              setPage(1);
            }}
            className={`tab-button ${roleFilter === tab.value ? "tab-button-active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="text-text-muted text-sm">{t("usersFound", { count: total })}</div>

      {/* Users Table */}
      <div className="border-border bg-surface overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg">
              <tr>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">{t("user")}</th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">{t("role")}</th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">
                  {t("status")}
                </th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">
                  {t("materials")}
                </th>
                <th className="text-text px-6 py-4 text-left text-sm font-semibold">
                  {t("registered")}
                </th>
                <th className="text-text px-6 py-4 text-right text-sm font-semibold">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {loading ? (
                <TableSkeleton rows={5} columns={6} />
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-text-muted px-6 py-12 text-center">
                    {t("noUsersFound")}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-bg transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-text font-medium">
                          {user.display_name || user.name || t("unknown")}
                          {user.is_protected && (
                            <span className="text-error ml-2 text-xs" title="Geschützt">
                              <svg
                                className="inline h-4 w-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                        <div className="text-text-muted text-sm">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`pill ${roleBadgeColors[user.role]}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === "SELLER" && (
                        <span
                          className={`pill ${
                            user.stripe_charges_enabled ? "pill-success" : "pill-warning"
                          }`}
                        >
                          {user.stripe_charges_enabled
                            ? t("stripeActiveLabel")
                            : t("stripePendingLabel")}
                        </span>
                      )}
                    </td>
                    <td className="text-text-muted px-6 py-4">{user.resourceCount}</td>
                    <td className="text-text-muted px-6 py-4">
                      {new Date(user.created_at).toLocaleDateString("de-CH")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                          className="bg-bg text-text hover:bg-border rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                        >
                          {t("edit")}
                        </button>
                        {!user.is_protected && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteConfirm(true);
                            }}
                            className="bg-error/20 text-error rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                          >
                            {t("delete")}
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
            className="border-border bg-surface text-text hover:bg-bg rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("previous")}
          </button>
          <span className="text-text-muted text-sm">{t("pageOf", { page, totalPages })}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="border-border bg-surface text-text hover:bg-bg rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("next")}
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay">
          <FocusTrap
            onEscape={() => {
              setShowModal(false);
              setSelectedUser(null);
            }}
          >
            <div className="modal-content modal-sm mx-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-text text-xl font-semibold">{t("editUser")}</h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-text-muted hover:text-text"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-text">{selectedUser.display_name || selectedUser.name}</p>
                <p className="text-text-muted text-sm">{selectedUser.email}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-text mb-2 block text-sm font-medium">
                    {t("changeRole")}
                  </label>
                  <select
                    defaultValue={selectedUser.role}
                    onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                    disabled={selectedUser.is_protected || actionLoading}
                    className="border-border bg-surface text-text focus:border-primary w-full rounded-full border px-4 py-2.5 focus:outline-none disabled:opacity-60"
                  >
                    <option value="BUYER">{t("buyer")}</option>
                    <option value="SELLER">{t("seller")}</option>
                    <option value="ADMIN">{t("administrator")}</option>
                  </select>
                  {selectedUser.is_protected && (
                    <p className="text-error mt-2 text-xs">{t("protectedUser")}</p>
                  )}
                </div>

                {selectedUser.role === "SELLER" && (
                  <div className="space-y-3">
                    <div className="border-border rounded-lg border p-4">
                      <p className="text-text font-medium">{t("stripeStatus")}</p>
                      <p className="text-text-muted text-sm">
                        {selectedUser.stripe_charges_enabled
                          ? t("stripeActive")
                          : t("stripePending")}
                      </p>
                    </div>
                    {!selectedUser.is_protected && (
                      <div className="border-border rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-text font-medium">{t("verifiedSeller")}</p>
                            <p className="text-text-muted text-sm">
                              {selectedUser.is_verified_seller
                                ? t("verifiedSellerActive")
                                : t("verifiedSellerInactive")}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleToggleVerifySeller(
                                selectedUser.id,
                                selectedUser.is_verified_seller
                              )
                            }
                            disabled={actionLoading}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
                              selectedUser.is_verified_seller
                                ? "bg-error/20 text-error hover:opacity-80"
                                : "bg-success/20 text-success hover:bg-success/30"
                            }`}
                          >
                            {selectedUser.is_verified_seller
                              ? t("revokeVerification")
                              : t("grantVerification")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedUser(null);
                  }}
                  className="border-border bg-surface text-text hover:bg-bg w-full rounded-lg border px-4 py-2.5 text-sm font-medium"
                >
                  {t("close")}
                </button>
              </div>
            </div>
          </FocusTrap>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="modal-overlay">
          <FocusTrap
            onEscape={() => {
              setShowDeleteConfirm(false);
              setSelectedUser(null);
            }}
          >
            <div className="modal-content modal-sm mx-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-error/20 rounded-full p-2">
                  <svg
                    className="text-error h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-text text-xl font-semibold">{t("deleteUser")}</h3>
              </div>

              <p className="text-text-muted mb-6">
                {t("deleteConfirm")}{" "}
                <strong className="text-text">
                  {selectedUser.display_name || selectedUser.email}
                </strong>{" "}
                {t("deleteWarning")}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  disabled={actionLoading}
                  className="bg-error text-text-on-accent flex-1 rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
                >
                  {actionLoading ? t("deleting") : t("yesDelete")}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedUser(null);
                  }}
                  className="border-border bg-surface text-text hover:bg-bg flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          </FocusTrap>
        </div>
      )}
    </div>
  );
}
