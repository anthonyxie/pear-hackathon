"use client";
import InitialPage from "@/components/page/InitialPage";
import SecondaryPage from "@/components/page/SecondaryPage";
import { useState } from "react";
export default function ChatPage() {
  const [page, setPage] = useState<string>("initial");
  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <div
        className={`absolute top-0 left-0 w-full h-full transition-transform duration-400 ease-in-out ${
          page === "secondary" ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <InitialPage setPage={setPage} />
      </div>
      <div
        className={`absolute top-0 left-0 w-full h-full transition-transform duration-400 ease-in-out ${
          page === "secondary" ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <SecondaryPage />
      </div>
      <button
        onClick={() => setPage(page === "initial" ? "secondary" : "initial")}
        className="absolute bottom-4 right-4 z-50"
      >
        Toggle Page
      </button>
    </div>
  );
}
