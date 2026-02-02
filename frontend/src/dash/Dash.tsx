import { ContentTypes } from "../landing/ContentType";
import { CTASection } from "../landing/CTASection";
import { Features } from "../landing/Features";
import { Footer } from "../landing/Footer";
import { HeroSection } from "../landing/HeroSection";
import { HowItWorks } from "../landing/HowItWorks";
import { Navbar } from "../landing/Navbar";

export default function Dash(){
    return (
        <div className="min-h-screen bg-background text-foreground dash">
      <Navbar />
      <main>
        <HeroSection />
        <ContentTypes />
        <Features />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
    )
}