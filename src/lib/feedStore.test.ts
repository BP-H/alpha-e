import { beforeEach, describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import bus from "./bus";
import { useFeedStore, usePaginatedPosts } from "./feedStore";

const samplePosts = [
  { id: 1, title: "one" },
  { id: 2, title: "two" },
  { id: 3, title: "three" },
];

describe("usePaginatedPosts", () => {
  beforeEach(() => {
    useFeedStore.getState().setPosts(samplePosts);
  });

  it("returns first page when page <= 0", () => {
    const { result } = renderHook(() => usePaginatedPosts(0, 2));
    expect(result.current.map((p) => p.id)).toEqual([1, 2]);
  });

  it("returns first page when pageSize <= 0", () => {
    const { result } = renderHook(() => usePaginatedPosts(1, 0));
    expect(result.current.map((p) => p.id)).toEqual([1]);
  });

  it("prepends posts via addPost", () => {
    const { result } = renderHook(() => useFeedStore());
    act(() => result.current.addPost({ id: 4, title: "four" } as any));
    expect(result.current.posts[0].id).toBe(4);
  });

  it("updates votes via post:vote event", () => {
    const post = { id: 9, title: "poll", poll: { options: ["a", "b"], votes: [0, 0] } } as any;
    useFeedStore.getState().setPosts([post]);
    bus.emit("post:vote", { id: 9, optionIndex: 1 });
    const votes = useFeedStore.getState().posts[0].poll?.votes;
    expect(votes).toEqual([0, 1]);
  });
});
