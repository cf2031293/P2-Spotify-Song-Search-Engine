import { ArrowLeft } from "lucide-react";

export default function About({ onNavigate = () => {} }) {
  return (
    <div className="min-h-screen w-full bg-[#7D7ABC] flex justify-center px-6 py-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        .font-display { font-family: 'Roboto', sans-serif; font-weight: 700; }
        .font-body { font-family: 'Roboto', sans-serif; font-weight: 400; }
        .font-mono { font-family: 'Roboto', sans-serif; font-weight: 500; }
      `}</style>

      <div className="w-full max-w-[640px] flex flex-col gap-8">
        <h1 className="font-display text-[#F3EFE6] text-[32px] text-center">
          About
        </h1>

        <hr className="border-t border-[#212333] w-16 mx-auto" />

        <div className="font-body text-[#C7C9D6] text-lg leading-relaxed flex flex-col gap-5">
          <p>
            Many music listeners want to discover songs that match a specific
            mood, activity, or listening preference. Traditional music
            searches rely heavily on song titles and artists, making it
            difficult to find songs based on characteristics such as energy,
            dance-ability, tempo, or popularity. This project aims to create a
            music discovery engine that allows users to search for songs
            using audio features and artist information.
          </p>
          <p>
            The system will allow users to search for songs by artist and
            filter results using Spotify audio features such as popularity,
            dance-ability, energy, tempo, acoustics, and instrumentality.
            Users will be able to combine multiple filters to find songs that
            match their preferences. The application will efficiently return
            relevant songs from a dataset containing over 100,000 tracks
            while comparing the performance of two different data
            structures.
          </p>
        </div>

        <button
          onClick={() => onNavigate("menu")}
          className="self-center flex items-center gap-2 font-body text-base text-[#5B5F72] hover:text-[#FF6A3D] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A3D] rounded-sm px-3 py-2"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>
    </div>
  );
}
