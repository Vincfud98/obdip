import { MountainIcon } from "lucide-react";

import { AnimatedHero } from "@/components/ui/animated-hero-section-1";
import { Button } from "@/components/ui/button";

export default function AnimatedHeroDemo() {
  const navLinks = [
    { label: "Solutions", href: "#" },
    { label: "Working", href: "#" },
    { label: "Discover", href: "#" }
  ];

  const handleCtaClick = () => {
    alert("Primary CTA clicked!");
  };

  const handleSecondaryCtaClick = () => {
    alert("Secondary CTA clicked!");
  };

  return (
    <AnimatedHero
      backgroundImageUrl="https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=2940"
      logo={
        <>
          <MountainIcon className="h-6 w-6 text-primary-foreground" />
          <span className="font-semibold text-primary-foreground">TwentyFirst</span>
        </>
      }
      navLinks={navLinks}
      topRightAction={
        <Button className="border border-white/20 bg-white/10 text-primary-foreground backdrop-blur-sm hover:bg-white/20">
          Get Consultation
        </Button>
      }
      title="Take Charge of your Generation Now"
      description="Lead with purpose, build boldly, and shape the future-your generation's moment is now. Own it. Drive it."
      ctaButton={{
        text: "Learn More",
        onClick: handleCtaClick
      }}
      secondaryCta={{
        text: "Contact Us",
        onClick: handleSecondaryCtaClick
      }}
    />
  );
}
