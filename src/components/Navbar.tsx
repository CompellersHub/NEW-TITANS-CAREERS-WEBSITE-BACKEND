import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Shield, Mail, TestTube, FileText, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogoWithEffects } from "@/components/LogoWithEffects";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  return (
    <nav className="fixed top-0 w-full bg-primary/95 backdrop-blur-xl border-b border-white/10 z-50 shadow-lg">
      <div className="container px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer">
            <LogoWithEffects />
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
            <Link to="/blog" className="text-white/90 hover:text-accent transition-all duration-300 font-medium text-sm">
              Blog
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
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:text-accent">
                    <User className="w-4 h-4 mr-2" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Shield className="w-4 h-4 mr-2" />
                          Subscribers
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/campaigns" className="cursor-pointer">
                          <Mail className="w-4 h-4 mr-2" />
                          Campaigns
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/ab-tests" className="cursor-pointer">
                          <TestTube className="w-4 h-4 mr-2" />
                          A/B Tests
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/templates" className="cursor-pointer">
                          <FileText className="w-4 h-4 mr-2" />
                          Templates
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/segments" className="cursor-pointer">
                          <Users className="w-4 h-4 mr-2" />
                          Segments
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-white hover:text-accent">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
            
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
            <Link to="/blog" className="block text-white hover:text-accent transition-colors font-medium py-2">
              Blog
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
              {user ? (
                <>
                  {isAdmin && (
                    <>
                      <Link to="/admin">
                        <Button variant="outline" className="w-full">
                          <Shield className="w-4 h-4 mr-2" />
                          Subscribers
                        </Button>
                      </Link>
                      <Link to="/admin/campaigns">
                        <Button variant="outline" className="w-full">
                          <Mail className="w-4 h-4 mr-2" />
                          Campaigns
                        </Button>
                      </Link>
                      <Link to="/admin/ab-tests">
                        <Button variant="outline" className="w-full">
                          <TestTube className="w-4 h-4 mr-2" />
                          A/B Tests
                        </Button>
                      </Link>
                      <Link to="/admin/templates">
                        <Button variant="outline" className="w-full">
                          <FileText className="w-4 h-4 mr-2" />
                          Templates
                        </Button>
                      </Link>
                      <Link to="/admin/segments">
                        <Button variant="outline" className="w-full">
                          <Users className="w-4 h-4 mr-2" />
                          Segments
                        </Button>
                      </Link>
                    </>
                  )}
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={signOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
              
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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
