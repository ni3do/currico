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
import { Users, FileText, Calendar } from "lucide-react";

interface FollowedSeller {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  subjects: string[];
  resourceCount: number;
  followedAt: string;
}

export default function FollowingPage() {
  const { status } = useSession();
  const router = useRouter();
  const tCommon = useTranslations("common");
  const [followedSellers, setFollowedSellers] = useState<FollowedSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch followed sellers
  const fetchFollowing = useCallback(async () => {
    try {
      const response = await fetch("/api/user/following");
      if (response.ok) {
        const data = await response.json();
        setFollowedSellers(data.sellers || []);
      }
    } catch (error) {
      console.error("Error fetching following:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchFollowing();
    }
  }, [status, fetchFollowing]);

  // Unfollow a seller
  const handleUnfollow = async (sellerId: string) => {
    setUnfollowingId(sellerId);
    try {
      const response = await fetch(`/api/users/${sellerId}/follow`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFollowedSellers((prev) => prev.filter((s) => s.id !== sellerId));
      }
    } catch (error) {
      console.error("Error unfollowing:", error);
    } finally {
      setUnfollowingId(null);
    }
  };

  // Get subject pill class
  const getSubjectPillClass = (subject: string): string => {
    const subjectMap: Record<string, string> = {
      Deutsch: "pill-deutsch",
      Mathematik: "pill-mathe",
      NMG: "pill-nmg",
      BG: "pill-gestalten",
      Musik: "pill-musik",
      Sport: "pill-sport",
      Englisch: "pill-fremdsprachen",
      Franzosisch: "pill-fremdsprachen",
    };
    return subjectMap[subject] || "pill-primary";
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
        <div className="mb-6">
          <Breadcrumb items={[{ label: tCommon("breadcrumb.following") }]} />
          <h1 className="text-text text-2xl font-bold">Folge ich</h1>
          <p className="text-text-muted mt-1">Lehrpersonen und Verkäufer, denen Sie folgen</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - Followed Sellers */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="text-text mb-6 text-xl font-semibold">
                Gefolgte Profile ({followedSellers.length})
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                </div>
              ) : followedSellers.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="text-text-faint mx-auto mb-4 h-16 w-16" />
                  <p className="text-text mb-2">Sie folgen noch niemandem</p>
                  <p className="text-text-muted mb-4 text-sm">
                    Entdecken Sie interessante Lehrpersonen und folgen Sie ihnen, um ihre neuesten
                    Materialien zu sehen.
                  </p>
                  <Link
                    href="/resources"
                    className="bg-primary hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-6 py-2.5 font-medium text-white transition-colors"
                  >
                    Profile entdecken
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {followedSellers.map((seller) => (
                    <div
                      key={seller.id}
                      className="border-border bg-bg hover:border-primary/50 rounded-xl border p-6 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <Link href={`/profile/${seller.id}`} className="flex-shrink-0">
                          {seller.image ? (
                            <Image
                              src={seller.image}
                              alt={seller.name}
                              width={64}
                              height={64}
                              className="border-border rounded-full border-2 object-cover"
                            />
                          ) : (
                            <div className="from-primary to-success flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-xl font-bold text-white">
                              {seller.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </Link>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link
                                href={`/profile/${seller.id}`}
                                className="text-text hover:text-primary text-lg font-semibold"
                              >
                                {seller.name}
                              </Link>
                              {seller.bio && (
                                <p className="text-text-muted mt-1 line-clamp-2 text-sm">
                                  {seller.bio}
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => handleUnfollow(seller.id)}
                              disabled={unfollowingId === seller.id}
                              className="border-border text-text hover:border-error hover:text-error flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              {unfollowingId === seller.id ? (
                                <>
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                  Entfolgen...
                                </>
                              ) : (
                                <>
                                  <Users className="h-4 w-4" />
                                  Entfolgen
                                </>
                              )}
                            </button>
                          </div>

                          {/* Subjects */}
                          {seller.subjects.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {seller.subjects.slice(0, 4).map((subject) => (
                                <span
                                  key={subject}
                                  className={`pill text-xs ${getSubjectPillClass(subject)}`}
                                >
                                  {subject}
                                </span>
                              ))}
                              {seller.subjects.length > 4 && (
                                <span className="text-text-muted text-xs">
                                  +{seller.subjects.length - 4} mehr
                                </span>
                              )}
                            </div>
                          )}

                          {/* Stats */}
                          <div className="text-text-muted mt-3 flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {seller.resourceCount} Ressourcen
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Gefolgt seit{" "}
                              {new Date(seller.followedAt).toLocaleDateString("de-CH", {
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Stats */}
            <div className="card p-6">
              <h3 className="text-text mb-4 font-semibold">Statistiken</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-primary text-2xl font-bold">{followedSellers.length}</div>
                  <div className="text-text-muted text-sm">Gefolgte Profile</div>
                </div>
                <div>
                  <div className="text-success text-2xl font-bold">
                    {followedSellers.reduce((acc, s) => acc + s.resourceCount, 0)}
                  </div>
                  <div className="text-text-muted text-sm">Verfügbare Ressourcen</div>
                </div>
              </div>
            </div>

            {/* Discover More */}
            <div className="card mt-6 p-6">
              <h3 className="text-text mb-4 font-semibold">Mehr entdecken</h3>
              <p className="text-text-muted mb-4 text-sm">
                Finden Sie weitere interessante Lehrpersonen und deren Materialien.
              </p>
              <Link
                href="/resources"
                className="text-primary hover:text-primary-hover block text-center text-sm font-medium transition-colors"
              >
                Ressourcen durchsuchen →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
