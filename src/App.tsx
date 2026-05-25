import { useState } from "react";
import Splash from "@/components/Splash";
import BottomNav, { type Tab } from "@/components/BottomNav";
import Home, { useHomeData } from "@/screens/Home";
import SearchScreen from "@/screens/Search";
import Sources from "@/screens/Sources";
import SettingsScreen from "@/screens/Settings";
import Profile from "@/screens/Profile";
import Detail from "@/components/Detail";
import Player from "@/components/Player";
import type { TmdbItem } from "@/lib/tmdb";

export default function App() {
  const [splash, setSplash] = useState(true);
  const [tab, setTab] = useState<Tab>("home");
  const [detail, setDetail] = useState<TmdbItem | null>(null);
  const [player, setPlayer] = useState<TmdbItem | null>(null);
  const data = useHomeData();

  return (
    <div className="mx-auto min-h-screen max-w-xl">
      {splash && <Splash onDone={() => setSplash(false)} />}

      <div style={{ display: tab === "home" ? "block" : "none" }}>
        <Home data={data} onOpen={setDetail} />
      </div>
      <div style={{ display: tab === "search" ? "block" : "none" }}>
        <SearchScreen onOpen={setDetail} />
      </div>
      <div style={{ display: tab === "sources" ? "block" : "none" }}>
        <Sources />
      </div>
      <div style={{ display: tab === "settings" ? "block" : "none" }}>
        <SettingsScreen />
      </div>
      <div style={{ display: tab === "profile" ? "block" : "none" }}>
        <Profile data={{ trending: data.trending, topRated: data.topRated, week: data.week }} onOpen={setDetail} />
      </div>

      {!splash && !player && <BottomNav tab={tab} onChange={setTab} />}

      {detail && !player && (
        <Detail item={detail} onClose={() => setDetail(null)} onPlay={() => setPlayer(detail)} />
      )}
      {player && <Player item={player} onClose={() => setPlayer(null)} />}
    </div>
  );
}
