import { useState, useMemo } from "react";
import { Search, ChevronDown, List, LayoutGrid, ArrowLeft, Music } from "lucide-react";

function AlbumArtPlaceholder({ size = "md", className = "" }) {
  const dims = size === "sm" ? "w-10 h-10" : "w-14 h-14";
  return (
    <div
      className={`shrink-0 ${dims} rounded-md bg-[#C5BCE7] border border-[#2A2D3E] flex items-center justify-center text-[#5B5F72] ${className}`}
      aria-hidden="true"
    >
      <Music size={size === "sm" ? 16 : 20} />
    </div>
  );
}

const TRACKS = [
  { title: "Track 1", artist: "Artist 1", tempo: 128 },
  { title: "Track 2", artist: "Artist 2", tempo: 92 },
  { title: "Track 3", artist: "Artist 3", tempo: 104 },
  { title: "Track 4", artist: "Artist 4", tempo: 132 },
  { title: "Track 5", artist: "Artist 5", tempo: 76 },
  { title: "Track 6", artist: "Artist 6", tempo: 118 },
];

const FILTERS = ["Energy", "Danceability", "Tempo", "Acousticness"];

export default function SongSearch({ onNavigate = () => {} }) {
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [view, setView] = useState("list");

  const results = useMemo(() => {
    if (!query.trim()) return TRACKS;
    const q = query.toLowerCase();
    return TRACKS.filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    );
  }, [query]);

  const toggleFilter = (f) =>
    setActiveFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );

  return (
    <div className="min-h-screen w-full bg-[#7D7ABC] flex justify-center px-6 py-16">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        .font-display { font-family: 'Roboto', sans-serif; font-weight: 700; }
        .font-body { font-family: 'Roboto', sans-serif; font-weight: 400; }
        .font-mono { font-family: 'Roboto', sans-serif; font-weight: 500; }
      `}</style>

      <div className="w-full max-w-[860px] flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[#F3EFE6] text-[32px]">
            Song Search
          </h1>
          <button
            onClick={() => onNavigate("menu")}
            className="flex items-center gap-2 font-body text-sm text-[#C5BCE7] hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A3D] rounded-sm px-2 py-1"
          >
            <ArrowLeft size={14} />
            Menu
          </button>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-3 flex-1 px-5 py-4 rounded-full border border-[#2A2D3E] bg-white focus-within:border-[#FF6A3D] transition-colors">
            <Search size={18} className="text-[#5B5F72] shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a song name"
              className="bg-transparent outline-none w-full font-body text-[#5B5F72] text-base"
            />
          </div>
          <button className="shrink-0 rounded-[10px] bg-[#FFC067] px-8 font-display text-[#10121A] text-lg hover:bg-[#ff7d55] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3EFE6]">
            Search
          </button>
        </div>

        <div className="flex items-center justify-between relative">
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className="flex items-center gap-1 font-body font-semibold text-white text-base hover:text-[#FFC067] transition-colors focus:outline-none"
          >
            Filter
            <ChevronDown
              size={16}
              className={`transition-transform ${filterOpen ? "rotate-180" : ""}`}
            />
          </button>

          <div className="flex items-center gap-1 rounded-full border border-[#2A2D3E] p-1">
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              className={`p-1.5 rounded-full transition-colors ${
                view === "list" ? "bg-[#C5BCE7] text-[#10121A]" : "text-[#5B5F72]"
              }`}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={`p-1.5 rounded-full transition-colors ${
                view === "grid" ? "bg-[#C5BCE7] text-[#10121A]" : "text-[#5B5F72]"
              }`}
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          {filterOpen && (
            <div className="absolute top-10 left-0 z-10 bg-white border border-[#2A2D3E] rounded-xl p-3 flex flex-col gap-1 min-w-[150px] shadow-xl">
              {FILTERS.map((f) => (
                <label
                  key={f}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#D0D2D0] cursor-pointer font-body text-sm text-gray"
                >
                  <input
                    type="checkbox"
                    checked={activeFilters.includes(f)}
                    onChange={() => toggleFilter(f)}
                    className="accent-[#FF6A3D]"
                  />
                  {f}
                </label>
              ))}
            </div>
          )}
        </div>

        <div
          className={
            view === "list"
              ? "flex flex-col"
              : "grid grid-cols-2 gap-4"
          }
        >
          {results.map((t, i) => (
            <div
              key={t.title}
              className={
                view === "list"
                  ? `flex items-center gap-4 py-4 ${
                      i !== results.length - 1 ? "border-b border-[#212333]" : ""
                    } hover:pl-2 transition-all`
                  : "flex items-center gap-4 p-4 rounded-xl border border-[#212333] hover:border-[#FF6A3D] transition-colors"
              }
            >
              <AlbumArtPlaceholder size="sm" />
              <div className="flex flex-col">
                <span className="font-body font-medium text-[#F3EFE6] text-base">
                  {t.title}
                </span>
                <span className="font-mono text-[#D0D2D0] text-xs">
                  {t.artist} · {t.tempo} bpm
                </span>
              </div>
            </div>
          ))}
          {results.length === 0 && (
            <p className="font-body text-[#D0D2D0] text-sm py-6">
              Nothing matches "{query}" — try a different title or artist.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
