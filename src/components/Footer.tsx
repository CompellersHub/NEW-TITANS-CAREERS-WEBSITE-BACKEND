import { Mail, MessageCircle, Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import titansLogo from "@/assets/titans-logo.jpg";
import { NewsletterSignup } from "./NewsletterSignup";
import { socialMediaLinks } from "@/config/socialMedia";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground border-t border-primary-foreground/10 py-12">
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-md">
                <img 
                  src={titansLogo} 
                  alt="Titans Careers Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-kanit font-bold">TITANS CAREERS</span>
                <span className="text-xs font-sans text-primary-foreground/70">Practical training. Real careers.</span>
              </div>
            </div>
            <p className="text-sm font-sans text-primary-foreground/80 leading-relaxed">
              Transform your career with practical tech training. Join 300+ career switchers.
            </p>
          </div>
          
          <div>
            <h3 className="font-kanit font-semibold mb-4 text-accent">Courses</h3>
            <ul className="space-y-2 text-sm font-sans text-primary-foreground/80">
              <li><Link to="/courses" className="hover:text-accent transition-colors">AML/KYC Compliance</Link></li>
              <li><Link to="/courses" className="hover:text-accent transition-colors">Data Analysis</Link></li>
              <li><Link to="/courses" className="hover:text-accent transition-colors">Cybersecurity</Link></li>
              <li><Link to="/courses" className="hover:text-accent transition-colors">Business Analysis</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-kanit font-semibold mb-4 text-accent">Company</h3>
            <ul className="space-y-2 text-sm font-sans text-primary-foreground/80">
              <li><Link to="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/testimonials" className="hover:text-accent transition-colors">Success Stories</Link></li>
              <li><Link to="/blog" className="hover:text-accent transition-colors">Blog</Link></li>
              <li><Link to="/resources" className="hover:text-accent transition-colors">Free Resources</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-kanit font-semibold mb-4 text-accent">Contact</h3>
            <ul className="space-y-3 text-sm font-sans text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                <a href="mailto:info@titanscareers.com" className="hover:text-accent transition-colors">
                  info@titanscareers.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-accent" />
                <a 
                  href="https://wa.me/447539434403"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  +44 7539 434403
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-kanit font-semibold mb-4 text-accent">Stay Updated</h3>
            <p className="text-sm font-sans text-primary-foreground/80 mb-4">
              Weekly career tips & job alerts
            </p>
            <NewsletterSignup 
              variant="minimal" 
              source="footer" 
            />
            <p className="text-xs font-sans text-primary-foreground/60 mt-2">
              Free. Unsubscribe anytime.
            </p>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/10 pt-8 space-y-6">
          {/* Social Media Icons */}
          <div className="flex items-center justify-center gap-4">
            <a 
              href={socialMediaLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:text-accent hover:bg-primary-foreground/20 transition-all duration-300"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a 
              href={socialMediaLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:text-accent hover:bg-primary-foreground/20 transition-all duration-300"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href={socialMediaLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:text-accent hover:bg-primary-foreground/20 transition-all duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
            <a 
              href={socialMediaLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:text-accent hover:bg-primary-foreground/20 transition-all duration-300"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
            <a 
              href={socialMediaLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:text-accent hover:bg-primary-foreground/20 transition-all duration-300"
              aria-label="YouTube"
            >
              <Youtube size={20} />
            </a>
            <a 
              href={socialMediaLinks.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:text-accent hover:bg-primary-foreground/20 transition-all duration-300"
              aria-label="TikTok"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-sans text-primary-foreground/70">
            <Link to="/privacy-policy" className="hover:text-accent transition-colors duration-300">Privacy Policy</Link>
            <span className="hidden sm:inline">·</span>
            <Link to="/refund-policy" className="hover:text-accent transition-colors duration-300">Refund Policy</Link>
            <span className="hidden sm:inline">·</span>
            <Link to="/terms-conditions" className="hover:text-accent transition-colors duration-300">Terms and Conditions</Link>
          </div>

          {/* Company Information */}
          <div className="flex flex-col items-center gap-2 text-xs font-sans text-primary-foreground/60 text-center">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span>Company Number: 16369966</span>
              <span className="hidden sm:inline">·</span>
              <span>UKRLP Number: 10098472</span>
              <span className="hidden sm:inline">·</span>
              <span>ICO Registered</span>
            </div>
            <p className="max-w-2xl">
              Pay later options are subject to eligibility and approval. Terms and conditions apply.
            </p>
            <p className="text-xs">
              Partnering with Payl8r
            </p>
          </div>

          {/* Copyright */}
          <p className="text-sm font-sans text-primary-foreground/70 text-center">
            © 2025 TITANS CAREERS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
