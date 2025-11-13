import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Shield, Mail, TestTube, FileText, Users, ChevronDown, BookOpen, Trophy, Library } from "lucide-react";
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
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  return (
    <nav className="fixed top-0 w-full bg-primary/95 backdrop-blur-xl border-b border-primary-foreground/10 z-50 shadow-lg">
      <div className="container px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <LogoWithEffects />
            <div className="flex flex-col">
              <span className="font-kanit font-bold text-lg text-primary-foreground leading-tight group-hover:text-accent transition-colors">
                Titans Careers
              </span>
              <span className="text-xs text-primary-foreground/80 leading-tight font-sans">
                Practical training. Real careers.
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/" className="nav-link-underline text-primary-foreground hover:text-accent transition-colors duration-300 font-sans font-semibold text-sm">
              Home
            </Link>
            <Link to="/courses" className="nav-link-underline text-primary-foreground hover:text-accent transition-colors duration-300 font-sans font-semibold text-sm">
              Courses
            </Link>
            <Link to="/about" className="nav-link-underline text-primary-foreground hover:text-accent transition-colors duration-300 font-sans font-semibold text-sm">
              About Us
            </Link>
            
            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-primary-foreground hover:text-accent transition-all duration-300 font-sans font-semibold text-sm outline-none group">
                Resources
                <ChevronDown className="w-4 h-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="center" 
                className="w-64 bg-card/98 backdrop-blur-xl border-border shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.15)] animate-fade-in rounded-xl"
                sideOffset={12}
              >
                <DropdownMenuItem asChild>
                  <Link 
                    to="/resources" 
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all rounded-lg hover:bg-accent/10 focus:bg-accent/10"
                  >
                    <Library className="w-5 h-5 text-accent" />
                    <div className="flex flex-col">
                      <span className="font-sans font-semibold text-primary">Resources Hub</span>
                      <span className="text-xs text-muted-foreground font-sans">Tools & guides</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link 
                    to="/blog" 
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all rounded-lg hover:bg-accent/10 focus:bg-accent/10"
                  >
                    <BookOpen className="w-5 h-5 text-accent" />
                    <div className="flex flex-col">
                      <span className="font-sans font-semibold text-primary">Blog</span>
                      <span className="text-xs text-muted-foreground font-sans">Latest insights</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <a 
                    href="#success-stories" 
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all rounded-lg hover:bg-accent/10 focus:bg-accent/10"
                  >
                    <Trophy className="w-5 h-5 text-accent" />
                    <div className="flex flex-col">
                      <span className="font-sans font-semibold text-primary">Success Stories</span>
                      <span className="text-xs text-muted-foreground font-sans">Real results</span>
                    </div>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <a href="#how-it-works" className="nav-link-underline text-primary-foreground hover:text-accent transition-colors duration-300 font-sans font-semibold text-sm">
              How It Works
            </a>
            <a href="#faqs" className="nav-link-underline text-primary-foreground hover:text-accent transition-colors duration-300 font-sans font-semibold text-sm">
              FAQs
            </a>
            <a href="#contact" className="nav-link-underline text-primary-foreground hover:text-accent transition-colors duration-300 font-sans font-semibold text-sm">
              Contact
            </a>
          </div>
          
          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-accent hover:bg-primary-foreground/10 font-sans font-semibold">
                    <User className="w-4 h-4 mr-2" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card/98 backdrop-blur-xl border-border shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.15)] rounded-xl">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer flex items-center px-4 py-2.5 rounded-lg hover:bg-accent/10 focus:bg-accent/10 transition-all">
                          <Shield className="w-4 h-4 mr-2 text-accent" />
                          <span className="font-sans font-medium text-primary">Subscribers</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/campaigns" className="cursor-pointer flex items-center px-4 py-2.5 rounded-lg hover:bg-accent/10 focus:bg-accent/10 transition-all">
                          <Mail className="w-4 h-4 mr-2 text-accent" />
                          <span className="font-sans font-medium text-primary">Campaigns</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/ab-tests" className="cursor-pointer flex items-center px-4 py-2.5 rounded-lg hover:bg-accent/10 focus:bg-accent/10 transition-all">
                          <TestTube className="w-4 h-4 mr-2 text-accent" />
                          <span className="font-sans font-medium text-primary">A/B Tests</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/templates" className="cursor-pointer flex items-center px-4 py-2.5 rounded-lg hover:bg-accent/10 focus:bg-accent/10 transition-all">
                          <FileText className="w-4 h-4 mr-2 text-accent" />
                          <span className="font-sans font-medium text-primary">Templates</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/segments" className="cursor-pointer flex items-center px-4 py-2.5 rounded-lg hover:bg-accent/10 focus:bg-accent/10 transition-all">
                          <Users className="w-4 h-4 mr-2 text-accent" />
                          <span className="font-sans font-medium text-primary">Segments</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer flex items-center px-4 py-2.5 rounded-lg hover:bg-destructive/10 focus:bg-destructive/10 transition-all">
                    <LogOut className="w-4 h-4 mr-2 text-destructive" />
                    <span className="font-sans font-medium text-destructive">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-accent hover:bg-primary-foreground/10 font-sans font-semibold">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
            
            <Button 
              variant="default"
              size="default"
              className="font-bold"
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
            className="lg:hidden text-primary-foreground hover:text-accent hover:bg-primary-foreground/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-6 pb-4 space-y-4 animate-fade-in border-t border-primary-foreground/10 pt-4">
            <Link to="/" className="block text-primary-foreground hover:text-accent transition-colors font-sans font-semibold text-base py-2">
              Home
            </Link>
            <Link to="/courses" className="block text-primary-foreground hover:text-accent transition-colors font-sans font-semibold text-base py-2">
              Courses
            </Link>
            <Link to="/about" className="block text-primary-foreground hover:text-accent transition-colors font-sans font-semibold text-base py-2">
              About Us
            </Link>
            
            {/* Mobile Resources Expandable */}
            <div className="space-y-2">
              <button
                onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                className="flex items-center justify-between w-full text-primary-foreground hover:text-accent transition-colors font-sans font-semibold text-base py-2"
              >
                <span>Resources</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isResourcesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isResourcesOpen && (
                <div className="pl-4 space-y-2 animate-fade-in border-l-2 border-accent">
                  <Link 
                    to="/resources" 
                    className="flex items-center gap-3 text-primary-foreground hover:text-accent transition-colors py-2 font-sans"
                  >
                    <Library className="w-4 h-4 text-accent" />
                    <span className="font-medium">Resources Hub</span>
                  </Link>
                  <Link 
                    to="/blog" 
                    className="flex items-center gap-3 text-primary-foreground hover:text-accent transition-colors py-2 font-sans"
                  >
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span className="font-medium">Blog</span>
                  </Link>
                  <a 
                    href="#success-stories" 
                    className="flex items-center gap-3 text-primary-foreground hover:text-accent transition-colors py-2 font-sans"
                  >
                    <Trophy className="w-4 h-4 text-accent" />
                    <span className="font-medium">Success Stories</span>
                  </a>
                </div>
              )}
            </div>
            
            <a href="#how-it-works" className="block text-primary-foreground hover:text-accent transition-colors font-sans font-semibold text-base py-2">
              How It Works
            </a>
            <a href="#faqs" className="block text-primary-foreground hover:text-accent transition-colors font-sans font-semibold text-base py-2">
              FAQs
            </a>
            <a href="#contact" className="block text-primary-foreground hover:text-accent transition-colors font-sans font-semibold text-base py-2">
              Contact
            </a>
            <div className="space-y-3 pt-4 border-t border-primary-foreground/10">
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
                className="w-full font-bold"
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
