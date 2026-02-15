/**
 * Shared types for comments and replies.
 * Single source of truth — do NOT duplicate in component files.
 */

export interface CommentUser {
  id: string;
  displayName: string;
  image: string | null;
  isSeller?: boolean;
}

export interface Reply {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
  likeCount: number;
  isLiked: boolean;
  replies: Reply[];
  replyCount: number;
}

export interface CommentResource {
  id: string;
  title: string;
  previewUrl: string | null;
}

export interface SellerComment extends Omit<Comment, "isLiked"> {
  resource: CommentResource;
  hasSellerReply: boolean;
}
