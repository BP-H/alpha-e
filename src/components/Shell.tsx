// src/components/Shell.tsx
import React from "react";
import Feed from "./feed/Feed";
import World3D from "./World3D";
import AssistantOrb from "./AssistantOrb";
import MenuOrb from "./MenuOrb";
import ChatDock from "./ChatDock";
import Sidebar from "./Sidebar";
import PortalOverlay from "./PortalOverlay";
import PostComposer from "./PostComposer";
import AvatarPortal from "./AvatarPortal";
import BackgroundVoid from "../three/BackgroundVoid";
import ThirteenthFloorWorld from "../three/ThirteenthFloorWorld";
import useLocal from "../hooks/useLocal";

export default function Shell() {
  const [worldMode] = useLocal<"orbs" | "void" | "floor">("sn.world.mode", "orbs");
  const world =
    worldMode === "floor" ? (
      <ThirteenthFloorWorld />
    ) : worldMode === "void" ? (
      <BackgroundVoid />
    ) : (
      <World3D />
    );
  return (
    <>
      {/* 3D world behind everything */}
      <div className="world-layer" aria-hidden>
        {world}
      </div>
      <MenuOrb />
      <Sidebar />
      <PortalOverlay />

      <main>
        <Feed>
          <div style={{ padding: "12px 0" }}>
            <PostComposer />
          </div>
        </Feed>
      </main>

      <ChatDock />
      <AssistantOrb />
      <AvatarPortal />
    </>
  );
}
