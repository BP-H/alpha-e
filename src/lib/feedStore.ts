import { create } from "zustand";
import type { ID, Post } from "../types";
import bus from "./bus";
import { demoPosts } from "./placeholders";

const injected =
  typeof window !== "undefined"
    ? ((window as any).__SN_POSTS__ as Post[] | undefined)
    : undefined;

const initialPosts = Array.isArray(injected) && injected.length
  ? injected
  : demoPosts;

interface FeedState {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  vote: (id: ID, optionIndex: number) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  posts: initialPosts,
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((s) => ({ posts: [post, ...s.posts] })),
  vote: (id, optionIndex) =>
    set((s) => ({
      posts: s.posts.map((p) => {
        if (String(p.id) !== String(id)) return p;
        const poll = p.poll;
        if (!poll || !poll.options || optionIndex < 0 || optionIndex >= poll.options.length) return p;
        const votes = poll.votes ? [...poll.votes] : Array(poll.options.length).fill(0);
        votes[optionIndex] = (votes[optionIndex] || 0) + 1;
        return { ...p, poll: { ...poll, votes } } as Post;
      }),
    })),
}));

// React to global vote events
bus.on("post:vote", ({ id, optionIndex }) => {
  try {
    useFeedStore.getState().vote(id, optionIndex);
  } catch {}
});

export function usePaginatedPosts(page: number, pageSize: number) {
  return useFeedStore((state) => {
    const p = Math.max(1, Math.floor(page));
    const size = Math.max(1, Math.floor(pageSize));
    const start = (p - 1) * size;
    if (start >= state.posts.length) return [];
    return state.posts.slice(start, start + size);
  });
}
