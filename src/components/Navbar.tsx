import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import titansLogo from "@/assets/titans-logo.jpg";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-primary/95 backdrop-blur-xl border-b border-white/10 z-50 shadow-lg">
      <div className="container px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-md">
              <img 
                src={titansLogo} 
                alt="Titans Careers Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white leading-tight">
                Titans Careers
              </span>
              <span className="text-xs text-white/70 leading-tight">
                Practical training. Real careers.
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-white/90 hover:text-accent transition-all duration-300 font-medium text-sm">
              Home
            </Link>
            <Link to="/courses" className="text-white/90 hover:text-accent transition-all duration-300 font-medium text-sm">
              Courses
            </Link>
            <Link to="/about" className="text-white/90 hover:text-accent transition-all duration-300 font-medium text-sm">
              About Us
            </Link>
            <Link to="/resources" className="text-white/90 hover:text-accent transition-all duration-300 font-medium text-sm">
              Resources
            </Link>
            <a href="#how-it-works" className="text-white/90 hover:text-accent transition-all duration-300 font-medium text-sm">
              How It Works
            </a>
            <a href="#success-stories" className="text-white/90 hover:text-accent transition-all duration-300 font-medium text-sm">
              Success Stories
            </a>
            <a href="#faqs" className="text-white/90 hover:text-accent transition-all duration-300 font-medium text-sm">
              FAQs
            </a>
            <a href="#contact" className="text-white/90 hover:text-accent transition-all duration-300 font-medium text-sm">
              Contact
            </a>
          </div>
          
          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button 
              variant="default"
              size="default"
              asChild
            >
              <a 
                href="https://wa.me/447539434403"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Free Session
              </a>
            </Button>
            <Button 
              variant="outlineWhite"
              size="default"
            >
              Student Login
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="lg:hidden text-white hover:text-accent hover:bg-white/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-6 pb-4 space-y-4 animate-fade-in border-t border-white/10 pt-4">
            <Link to="/" className="block text-white hover:text-accent transition-colors font-medium py-2">
              Home
            </Link>
            <Link to="/courses" className="block text-white hover:text-accent transition-colors font-medium py-2">
              Courses
            </Link>
            <Link to="/about" className="block text-white hover:text-accent transition-colors font-medium py-2">
              About Us
            </Link>
            <Link to="/resources" className="block text-white hover:text-accent transition-colors font-medium py-2">
              Resources
            </Link>
            <a href="#how-it-works" className="block text-white hover:text-accent transition-colors font-medium py-2">
              How It Works
            </a>
            <a href="#success-stories" className="block text-white hover:text-accent transition-colors font-medium py-2">
              Success Stories
            </a>
            <a href="#faqs" className="block text-white hover:text-accent transition-colors font-medium py-2">
              FAQs
            </a>
            <a href="#contact" className="block text-white hover:text-accent transition-colors font-medium py-2">
              Contact
            </a>
            <div className="space-y-3 pt-4 border-t border-white/10">
              <Button 
                variant="default"
                className="w-full"
                asChild
              >
                <a 
                  href="https://wa.me/447539434403"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Free Session
                </a>
              </Button>
              <Button 
                variant="outlineWhite"
                className="w-full"
              >
                Student Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
