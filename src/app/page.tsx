import { Experience } from "@/components/experience";
import { Projects } from "@/components/sections/projects";
import { Certifications } from "@/components/sections/certifications";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      {/* Scroll-driven 3D narrative: fixed canvas + overlay (or static fallback). */}
      <Experience />

      {/* Everything below sits opaque above the fixed canvas. */}
      <div className="relative z-10 bg-background">
        <Projects />
        <Certifications />
        <Contact />
      </div>
    </>
  );
}
