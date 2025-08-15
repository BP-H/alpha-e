import React from "react";
import { useNavigate } from "react-router-dom";
import WorldScreen from "../components/WorldScreen";

export default function World() {
  const navigate = useNavigate();
  return <WorldScreen onBack={() => navigate("/feed")} />;
}
