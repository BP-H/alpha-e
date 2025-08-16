// src/components/Shell.tsx
import React from "react";
import Feed from "./feed/Feed";
import World3D from "./World3D";
import AssistantOrb from "./AssistantOrb";
import ChatDock from "./ChatDock";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import PortalOverlay from "./PortalOverlay";
import PostComposer from "./PostComposer";
import AvatarPortal from "./AvatarPortal";

export default function Shell() {
  return (
    <>
      {/* 3D world behind everything */}
      <div className="world-layer" aria-hidden>
        <World3D />
      </div>

      <Topbar />
      <Sidebar />
      <PortalOverlay />

      <main>
        <Feed style={{ paddingTop: "var(--topbar-h, 56px)" }}>
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
