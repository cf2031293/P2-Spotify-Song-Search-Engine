import { useState } from "react";
import { ChevronRight } from "lucide-react";

export default function Menu({ onNavigate = () => {} }) {
  const [hovered, setHovered] = useState(null);

  const items = [
    { key: "search", label: "Song Search" },
    { key: "about", label: "About" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#7D7ABC] flex items-center justify-center px-6 py-24">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        .font-display { font-family: 'Roboto', sans-serif; font-weight: 700; }
        .font-body { font-family: 'Roboto', sans-serif; font-weight: 400; }
        .font-mono { font-family: 'Roboto', sans-serif; font-weight: 500; }
      `}</style>

      <div className="flex flex-col items-center gap-14 w-full max-w-sm">

        <div className="flex flex-col items-center gap-2">
          <h1 className="font-display text-white text-[40px] leading-none">
            Menu
          </h1>
        </div>

        <nav className="flex flex-col items-stretch gap-1 w-full">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              onMouseEnter={() => setHovered(item.key)}
              onMouseLeave={() => setHovered(null)}
              className="group flex items-center gap-4 font-display font-medium text-white text-2xl py-4 border-b border-white hover:border-[#FF6A3D] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm"
            >
              <ChevronRight
                size={22}
                className={
                  hovered === item.key
                    ? "text-[#FF6A3D] transition-colors"
                    : "text-[#5B5F72] transition-colors"
                }
              />
              <span className="group-hover:text-[#FF6A3D] transition-colors">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
