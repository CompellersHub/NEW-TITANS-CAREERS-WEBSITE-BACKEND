import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Shield, Mail, TestTube, FileText, Users, ChevronDown, BookOpen, Trophy, Library, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogoWithEffects } from "@/components/LogoWithEffects";
import { NotificationBell } from "@/components/notifications/NotificationBell";
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
    <nav className="fixed top-0 w-full backdrop-blur-lg bg-primary/95 border-b border-white/10 z-50 shadow-[0_4px_12px_-4px_hsl(213_69%_13%/0.15)]">
      <div className="container px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <LogoWithEffects />
            <div className="flex flex-col">
              <span className="font-kanit font-bold text-lg text-primary-foreground leading-tight group-hover:text-accent transition-colors">
                TITANS CAREERS
              </span>
              <span className="text-xs text-primary-foreground/80 leading-tight font-sans">
                Practical training. Real careers.
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation with Premium Hover Effects */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/" className="relative group px-4 py-2 rounded-lg transition-all duration-300">
              <span className="relative z-10 font-sans font-semibold text-sm text-primary-foreground group-hover:text-accent transition-colors">Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-tc-amber/0 via-tc-gold/0 to-tc-amber/0 opacity-0 group-hover:opacity-100 group-hover:from-tc-amber/20 group-hover:via-tc-gold/30 group-hover:to-tc-amber/20 rounded-lg transition-all duration-500" />
              <div className="absolute inset-0 blur-xl bg-tc-amber/0 group-hover:bg-tc-amber/40 transition-all duration-500 -z-10 rounded-lg" />
            </Link>
            <Link to="/courses" className="relative group px-4 py-2 rounded-lg transition-all duration-300">
              <span className="relative z-10 font-sans font-semibold text-sm text-primary-foreground group-hover:text-accent transition-colors">Courses</span>
              <div className="absolute inset-0 bg-gradient-to-r from-tc-amber/0 via-tc-gold/0 to-tc-amber/0 opacity-0 group-hover:opacity-100 group-hover:from-tc-amber/20 group-hover:via-tc-gold/30 group-hover:to-tc-amber/20 rounded-lg transition-all duration-500" />
              <div className="absolute inset-0 blur-xl bg-tc-amber/0 group-hover:bg-tc-amber/40 transition-all duration-500 -z-10 rounded-lg" />
            </Link>
            <Link to="/events" className="relative group px-4 py-2 rounded-lg transition-all duration-300">
              <span className="relative z-10 font-sans font-semibold text-sm text-primary-foreground group-hover:text-accent transition-colors">Events</span>
              <div className="absolute inset-0 bg-gradient-to-r from-tc-amber/0 via-tc-gold/0 to-tc-amber/0 opacity-0 group-hover:opacity-100 group-hover:from-tc-amber/20 group-hover:via-tc-gold/30 group-hover:to-tc-amber/20 rounded-lg transition-all duration-500" />
              <div className="absolute inset-0 blur-xl bg-tc-amber/0 group-hover:bg-tc-amber/40 transition-all duration-500 -z-10 rounded-lg" />
            </Link>
            <Link to="/about" className="relative group px-4 py-2 rounded-lg transition-all duration-300">
              <span className="relative z-10 font-sans font-semibold text-sm text-primary-foreground group-hover:text-accent transition-colors">About Us</span>
              <div className="absolute inset-0 bg-gradient-to-r from-tc-amber/0 via-tc-gold/0 to-tc-amber/0 opacity-0 group-hover:opacity-100 group-hover:from-tc-amber/20 group-hover:via-tc-gold/30 group-hover:to-tc-amber/20 rounded-lg transition-all duration-500" />
              <div className="absolute inset-0 blur-xl bg-tc-amber/0 group-hover:bg-tc-amber/40 transition-all duration-500 -z-10 rounded-lg" />
            </Link>
            
            {/* Resources Dropdown with Premium Glassmorphism */}
            <DropdownMenu>
              <DropdownMenuTrigger className="relative group flex items-center gap-1 px-4 py-2 rounded-lg transition-all duration-300 font-sans font-semibold text-sm outline-none">
                <span className="relative z-10 text-primary-foreground group-hover:text-accent transition-colors">Resources</span>
                <ChevronDown className="w-4 h-4 text-primary-foreground group-hover:text-accent transition-all duration-300 group-data-[state=open]:rotate-180" />
                <div className="absolute inset-0 bg-gradient-to-r from-tc-amber/0 via-tc-gold/0 to-tc-amber/0 opacity-0 group-hover:opacity-100 group-hover:from-tc-amber/20 group-hover:via-tc-gold/30 group-hover:to-tc-amber/20 rounded-lg transition-all duration-500" />
                <div className="absolute inset-0 blur-xl bg-tc-amber/0 group-hover:bg-tc-amber/40 transition-all duration-500 -z-10 rounded-lg" />
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="center" 
                className="w-64 bg-card/95 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.2)] animate-fade-in rounded-xl z-50"
                sideOffset={12}
              >
                  <DropdownMenuItem asChild className="hover:bg-accent/10 transition-colors duration-200">
                  <Link 
                    to="/resources" 
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all rounded-lg hover:bg-accent/10 focus:bg-accent/10"
                  >
                    <Library className="w-5 h-5 text-accent" />
                    <div className="flex flex-col">
                      <span className="font-sans font-semibold text-card-foreground">Resources Hub</span>
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
                      <span className="font-sans font-semibold text-card-foreground">Blog</span>
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
                      <span className="font-sans font-semibold text-card-foreground">Success Stories</span>
                      <span className="text-xs text-muted-foreground font-sans">Real results</span>
                    </div>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link to="/#how-it-works" className="nav-link-underline text-primary-foreground hover:text-accent transition-colors duration-300 font-sans font-semibold text-sm">
              How It Works
            </Link>
            <Link to="/#faqs" className="nav-link-underline text-primary-foreground hover:text-accent transition-colors duration-300 font-sans font-semibold text-sm">
              FAQs
            </Link>
            <Link to="/contact" className="nav-link-underline text-primary-foreground hover:text-accent transition-colors duration-300 font-sans font-semibold text-sm">
              Contact
            </Link>
          </div>
          
          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <NotificationBell />
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-accent hover:bg-primary-foreground/10 font-sans font-semibold">
                    <User className="w-4 h-4 mr-2" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card backdrop-blur-xl border-border shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.15)] rounded-xl z-50">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer flex items-center px-4 py-2.5 rounded-lg hover:bg-accent/10 focus:bg-accent/10 transition-all">
                      <User className="w-4 h-4 mr-2 text-accent" />
                      <span className="font-sans font-medium text-card-foreground">My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer flex items-center px-4 py-2.5 rounded-lg hover:bg-accent/10 focus:bg-accent/10 transition-all">
                          <Shield className="w-4 h-4 mr-2 text-accent" />
                          <span className="font-sans font-medium text-card-foreground">Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/campaigns" className="cursor-pointer flex items-center px-4 py-2.5 rounded-lg hover:bg-accent/10 focus:bg-accent/10 transition-all">
                          <Mail className="w-4 h-4 mr-2 text-accent" />
                          <span className="font-sans font-medium text-card-foreground">Campaigns</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/ab-tests" className="cursor-pointer flex items-center px-4 py-2.5 rounded-lg hover:bg-accent/10 focus:bg-accent/10 transition-all">
                          <TestTube className="w-4 h-4 mr-2 text-accent" />
                          <span className="font-sans font-medium text-card-foreground">A/B Tests</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/templates" className="cursor-pointer flex items-center px-4 py-2.5 rounded-lg hover:bg-accent/10 focus:bg-accent/10 transition-all">
                          <FileText className="w-4 h-4 mr-2 text-accent" />
                          <span className="font-sans font-medium text-card-foreground">Templates</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/segments" className="cursor-pointer flex items-center px-4 py-2.5 rounded-lg hover:bg-accent/10 focus:bg-accent/10 transition-all">
                          <Users className="w-4 h-4 mr-2 text-accent" />
                          <span className="font-sans font-medium text-card-foreground">Segments</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/campaign-approval" className="cursor-pointer flex items-center px-4 py-2.5 rounded-lg hover:bg-accent/10 focus:bg-accent/10 transition-all">
                          <CheckCircle className="w-4 h-4 mr-2 text-accent" />
                          <span className="font-sans font-medium text-card-foreground">Approval Queue</span>
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
              </>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-accent hover:bg-primary-foreground/10 font-sans font-semibold">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
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
            <Link to="/events" className="block text-primary-foreground hover:text-accent transition-colors font-sans font-semibold text-base py-2">
              Events
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
            
            <Link to="/#how-it-works" className="block text-primary-foreground hover:text-accent transition-colors font-sans font-semibold text-base py-2">
              How It Works
            </Link>
            <Link to="/#faqs" className="block text-primary-foreground hover:text-accent transition-colors font-sans font-semibold text-base py-2">
              FAQs
            </Link>
            <Link to="/contact" className="block text-primary-foreground hover:text-accent transition-colors font-sans font-semibold text-base py-2">
              Contact
            </Link>
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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
