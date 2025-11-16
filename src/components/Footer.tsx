import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { NewsletterSignup } from "./NewsletterSignup";
import { socialMediaDisplay } from "@/config/socialMedia";

export const Footer = () => {
  const socialIcons = {
    Facebook,
    Instagram,
    Linkedin,
    Twitter,
    Youtube,
  };

  return (
    <footer className="bg-primary text-primary-foreground border-t border-primary-foreground/10">
      {/* SECTION 1: Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 xl:gap-12">
          
          {/* Column 1: Brand & Contact */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-primary font-kanit font-bold text-xl">T</span>
              </div>
              <div className="flex flex-col">
                <span className="font-kanit font-bold text-xl text-primary-foreground leading-tight group-hover:text-accent transition-colors tracking-tight">
                  TITANS CAREERS
                </span>
                <span className="text-sm text-primary-foreground/70 leading-tight font-sans font-normal">
                  Practical training. Real careers.
                </span>
              </div>
            </Link>
            
            <p className="text-primary-foreground/80 text-base leading-snug">
              Empowering career changers with practical training in AML/KYC Compliance, 
              Data Analysis, Business Analysis, Cybersecurity, and more. Real skills for real careers.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-2 pt-1">
              <a
                href="mailto:info@titanscareers.com"
                className="flex items-center gap-3 text-primary-foreground/80 hover:text-accent transition-colors group"
                aria-label="Email Titans Careers"
              >
                <div className="w-8 h-8 bg-primary-foreground/5 rounded-lg flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm">info@titanscareers.com</span>
              </a>
              
              <a
                href="tel:+447539434403"
                className="flex items-center gap-3 text-primary-foreground/80 hover:text-accent transition-colors group"
                aria-label="Call Titans Careers"
              >
                <div className="w-8 h-8 bg-primary-foreground/5 rounded-lg flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm">+44 7539 434403</span>
              </a>
              
              <div
                className="flex items-center gap-3 text-primary-foreground/80"
                aria-label="Titans Careers location"
              >
                <div className="w-8 h-8 bg-primary-foreground/5 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-sm">London, United Kingdom</span>
              </div>
            </div>
          </div>
          
          {/* Column 2: Navigation */}
          <nav aria-label="Footer navigation" className="space-y-5">
            
            {/* Our Courses Section */}
            <div className="space-y-3">
              <h2 className="text-accent font-kanit font-bold text-lg leading-tight">Our Courses</h2>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/courses/aml-kyc-compliance" 
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-sans font-normal inline-block"
                  >
                    AML/KYC Compliance
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/courses/data-analysis" 
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-sans font-normal inline-block"
                  >
                    Data Analysis
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/courses/business-analysis" 
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-sans font-normal inline-block"
                  >
                    Business Analysis
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/courses/cybersecurity" 
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-sans font-normal inline-block"
                  >
                    Cybersecurity
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/courses/digital-marketing" 
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-sans font-normal inline-block"
                  >
                    Digital Marketing
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/courses/data-privacy" 
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-sans font-normal inline-block"
                  >
                    Data Privacy
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/courses/crypto-compliance" 
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-sans font-normal inline-block"
                  >
                    Crypto Compliance
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Section */}
            <div className="space-y-3">
              <h2 className="text-accent font-kanit font-bold text-lg leading-tight">Company</h2>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/about" 
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-sans font-normal inline-block"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/success-stories" 
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-sans font-normal inline-block"
                  >
                    Success Stories
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/blog" 
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-sans font-normal inline-block"
                  >
                    Career Resources
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/events" 
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-sans font-normal inline-block"
                  >
                    Events
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-sans font-normal inline-block"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
          
          {/* Column 3: Stay Connected */}
          <div className="space-y-4">
            <h2 className="text-accent font-kanit font-bold text-lg leading-tight">
              Stay Connected
            </h2>
            
            <p className="text-sm text-primary-foreground/80 leading-snug">
              Get weekly career tips, course updates, and exclusive job opportunities for career changers.
            </p>
            
            <NewsletterSignup 
              variant="minimal" 
              source="footer"
            />
            
            <p className="text-xs text-primary-foreground/60 font-sans font-normal">
              Free forever. Unsubscribe anytime. No spam, ever.
            </p>
            
            {/* Social Media Section */}
            <div className="space-y-3 pt-1">
              <h3 className="text-primary-foreground font-sans font-semibold text-sm leading-tight">
                Follow Our Journey
              </h3>
              
              <div className="flex items-center gap-3">
                {socialMediaDisplay.map((social) => {
                  const Icon = socialIcons[social.icon as keyof typeof socialIcons];
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-primary-foreground/5 flex items-center justify-center hover:bg-accent/10 hover:scale-110 transition-all text-primary-foreground/80 hover:text-accent"
                      aria-label={`Follow Titans Careers on ${social.name}`}
                    >
                      {social.name === "TikTok" ? (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      ) : Icon && <Icon className="w-5 h-5" />}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Bottom Bar (Legal + Copyright) */}
      <div className="border-t border-primary-foreground/10 bg-primary-foreground/5">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-2 md:py-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 text-center md:text-left">
            {/* Legal Links */}
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
              <span className="text-primary-foreground/40">•</span>
              <Link 
                to="/terms-conditions" 
                className="text-sm text-primary-foreground/70 hover:text-accent transition-colors font-sans font-normal"
              >
                Terms & Conditions
              </Link>
            </nav>
            
            {/* Copyright + Registration */}
            <div className="flex flex-col gap-1 text-center md:text-right">
              <p className="text-sm text-primary-foreground/70 leading-tight">
                © {new Date().getFullYear()} <span className="text-accent font-semibold font-kanit tracking-wide">TITANS CAREERS</span>. All rights reserved.
              </p>
              <p className="text-xs text-primary-foreground/60 leading-tight">
                Company No. 16017935 • FCA No. 675283 • UKRLP No. 10104588 • ICO Reg. ZB954438
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
