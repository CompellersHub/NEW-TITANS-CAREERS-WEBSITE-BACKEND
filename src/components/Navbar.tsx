import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-xl border-b border-border/50 z-50 shadow-sm">
      <div className="container px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow transition-all duration-300 group-hover:shadow-glow-lg group-hover:scale-105">
              <span className="text-2xl font-bold text-primary-foreground">T</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Titan Careers
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-foreground/80 hover:text-primary transition-all duration-300 font-semibold text-sm tracking-wide relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
              Features
            </a>
            <a href="#testimonials" className="text-foreground/80 hover:text-primary transition-all duration-300 font-semibold text-sm tracking-wide relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
              Testimonials
            </a>
            <a href="#contact" className="text-foreground/80 hover:text-primary transition-all duration-300 font-semibold text-sm tracking-wide relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
              Contact
            </a>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="font-semibold">Sign In</Button>
            <Button onClick={scrollToContact} className="bg-gradient-primary shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-105 font-bold">
              Get Started
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 animate-fade-in">
            <a href="#features" className="block text-foreground hover:text-primary transition-colors font-medium">
              Features
            </a>
            <a href="#testimonials" className="block text-foreground hover:text-primary transition-colors font-medium">
              Testimonials
            </a>
            <a href="#contact" className="block text-foreground hover:text-primary transition-colors font-medium">
              Contact
            </a>
            <Button className="w-full" onClick={scrollToContact}>Get Started</Button>
          </div>
        )}
      </div>
    </nav>
  );
};
