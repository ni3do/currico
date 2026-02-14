"use client";

import { motion } from "framer-motion";
import { ProfileCard } from "@/components/ui/ProfileCard";
import { getSubjectPillClass } from "@/lib/constants/subject-colors";
import type { ProfileListItem } from "@/lib/types/search";

interface ProfilesGridProps {
  profiles: ProfileListItem[];
  followingIds: Set<string>;
  onFollowToggle: (id: string, currentState: boolean) => Promise<boolean>;
}

export function ProfilesGrid({ profiles, followingIds, onFollowToggle }: ProfilesGridProps) {
  return (
    <>
      {profiles.map((profile, index) => (
        <motion.div
          key={`profile-${profile.id}`}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              duration: 0.4,
              delay: index * 0.05 + 0.02,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
          className="h-full"
        >
          <ProfileCard
            id={profile.id}
            name={profile.name}
            image={profile.image}
            bio={profile.bio}
            subjects={profile.subjects}
            resourceCount={profile.resourceCount}
            followerCount={profile.followerCount}
            isVerified={profile.is_verified_seller === true}
            getSubjectPillClass={getSubjectPillClass}
            showFollowButton={true}
            isFollowing={followingIds.has(profile.id)}
            onFollowToggle={onFollowToggle}
          />
        </motion.div>
      ))}
    </>
  );
}
