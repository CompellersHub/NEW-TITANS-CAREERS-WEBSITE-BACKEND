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
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-lg border-b border-border z-50">
      <div className="container px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">T</span>
            </div>
            <span className="text-xl font-bold">Titan Careers</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground hover:text-primary transition-colors font-medium">
              Features
            </a>
            <a href="#testimonials" className="text-foreground hover:text-primary transition-colors font-medium">
              Testimonials
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors font-medium">
              Contact
            </a>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost">Sign In</Button>
            <Button onClick={scrollToContact}>Get Started</Button>
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
