import { Navbar } from "@/components/Navbar";
import { FlashcardsApp } from "@/components/FlashcardsApp";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* pt-14 offsets the fixed navbar height */}
      <div className="flex-1 pt-14">
        <FlashcardsApp />
      </div>
      <Footer />
    </div>
  );
}
