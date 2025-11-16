import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { NewsletterSignup } from "./NewsletterSignup";
import { socialMediaDisplay } from "@/config/socialMedia";
import payl8rLogo from "@/assets/payl8r-logo.png";

export const Footer = () => {
  const socialIcons = {
    Facebook,
    Instagram,
    Linkedin,
    Twitter,
    Youtube,
  };

  return (
    <footer className="bg-tc-navy text-white py-16 border-t border-white/10">
      {/* SECTION 1: Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-4 md:py-5 lg:py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 xl:gap-12">
          
          {/* Row 1: Titans Careers Brand */}
          <div className="space-y-3">
            <h2 className="text-tc-amber font-kanit font-bold text-base leading-tight border-b-2 border-tc-amber/30 pb-2 inline-block">Titans Careers</h2>
            <p className="text-white/80 text-sm leading-tight">
              Learn what sets professionals apart.
            </p>
            <p className="text-primary-foreground/80 text-sm leading-tight">
              Specializing in high-impact masterclasses for AML/KYC Compliance, Business Analysis/Project Management, Data Analytics, and Cybersecurity professionals.
            </p>
          </div>
          
          {/* Row 2: Contact Us */}
          <div className="space-y-3">
            <h2 className="text-tc-amber font-kanit font-bold text-base leading-tight border-b-2 border-tc-amber/30 pb-2 inline-block">Contact Us</h2>
            <div className="space-y-2">
              <a
                href="mailto:support@titanscareers.com"
              className="flex items-center gap-2 text-white/80 hover:text-tc-amber transition-colors duration-300 group"
                aria-label="Email Titans Careers"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">support@titanscareers.com</span>
              </a>
              
              <a
                href="tel:+442045720475"
                className="flex items-center gap-2 text-white/80 hover:text-tc-amber transition-colors duration-300 group"
                aria-label="Call Titans Careers"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">+44 20 4572 0475</span>
              </a>
              
              <a
                href="https://wa.me/447539434403"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/80 hover:text-tc-amber transition-colors duration-300 group"
                aria-label="WhatsApp Titans Careers"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">WhatsApp: +44 7539 434403</span>
              </a>
            </div>
          </div>
          
          {/* Row 3: Our Office */}
          <div className="space-y-3">
            <h2 className="text-tc-amber font-kanit font-bold text-base leading-tight border-b-2 border-tc-amber/30 pb-2 inline-block">Our Office</h2>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-white/80">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p>3rd Floor</p>
                  <p>45 Albemarle Street</p>
                  <p>Mayfair, London</p>
                  <p>W1S 4JL</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 text-white/80 pt-1">
                <div className="w-4 h-4 mt-0.5 flex-shrink-0 flex items-center justify-center">
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                </div>
                <div className="text-sm">
                  <p>Mon-Fri: 9AM - 5PM</p>
                  <p>Weekends by appointment</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Row 4: Quick Links */}
          <nav aria-label="Footer navigation" className="space-y-3">
            <h2 className="text-tc-amber font-kanit font-bold text-base leading-tight border-b-2 border-tc-amber/30 pb-2 inline-block">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/courses" 
                  className="text-sm text-white/80 hover:text-tc-amber transition-colors duration-300 font-sans font-normal inline-block"
                >
                  Our Courses
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-sm text-white/80 hover:text-tc-amber transition-colors duration-300 font-sans font-normal inline-block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-sm text-white/80 hover:text-tc-amber transition-colors duration-300 font-sans font-normal inline-block"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms-conditions" 
                  className="text-sm text-white/80 hover:text-tc-amber transition-colors duration-300 font-sans font-normal inline-block"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* SECTION 2: Bottom Bar (Legal + Copyright + Social) */}
      <div className="border-t border-primary-foreground/10 bg-primary-foreground/5">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-2 md:py-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            {/* Left: Legal Links */}
            <nav aria-label="Legal links" className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1">
              <Link 
                to="/privacy-policy" 
                className="text-sm text-primary-foreground/70 hover:text-accent transition-colors font-sans font-normal"
              >
                Privacy Policy
              </Link>
              <span className="text-primary-foreground/40">•</span>
              <Link 
                to="/refund-policy" 
                className="text-sm text-primary-foreground/70 hover:text-accent transition-colors font-sans font-normal"
              >
                Refund Policy
              </Link>
            </nav>
            
            {/* Center: Social Media Icons */}
            <div className="flex items-center justify-center gap-2">
              {socialMediaDisplay.map((social) => {
                const Icon = socialIcons[social.icon as keyof typeof socialIcons];
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-primary-foreground/5 flex items-center justify-center hover:bg-accent/10 hover:scale-110 transition-all text-primary-foreground/80 hover:text-accent"
                    aria-label={`Follow Titans Careers on ${social.name}`}
                  >
                    {social.name === "TikTok" ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                    ) : Icon && <Icon className="w-4 h-4" />}
                  </a>
                );
              })}
            </div>
            
            {/* Right: Copyright + Registration */}
            <div className="flex flex-col gap-1 text-center md:text-right">
              <p className="text-xs text-primary-foreground/60 leading-tight">
                TITANS CAREERS LIMITED is an Introducer Appointed Representative of Social Money Limited t/a PayL8r who is authorised by the FCA under Ref Number 675283. Credit is subject to credit worthiness and affordability assessments. Missed payments may affect your credit file, could incur fees, and you may lose your item.
              </p>
            </div>
          </div>
          
          {/* Bottom row: Company info */}
          <div className="flex flex-wrap justify-center items-center gap-3 mt-2 pt-2 border-t border-primary-foreground/5">
            <p className="text-xs text-primary-foreground/70">
              © 2025 Titans Careers. All rights reserved
            </p>
            <div className="flex items-center gap-3">
              <img src={payl8rLogo} alt="PayL8r Finance Partner" className="h-8 opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
