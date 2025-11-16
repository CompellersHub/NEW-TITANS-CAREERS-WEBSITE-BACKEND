import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { NewsletterSignup } from "./NewsletterSignup";
import payl8rLogo from "@/assets/payl8r-logo.png";
import { socialMediaDisplay } from "@/config/socialMedia";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground border-t border-primary-foreground/10">
      {/* Main Footer Content */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16">
        {/* Top 3-Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 mb-16">
          
          {/* Column 1: Brand & Contact */}
          <div className="space-y-6">
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
            
            <p className="text-base text-primary-foreground/80 leading-relaxed font-sans font-normal max-w-sm">
              Transform your career with practical tech training designed for real-world success. 
              Join 300+ professionals who've successfully switched careers.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-4 pt-2">
              <a 
                href="mailto:info@titanscareers.co.uk" 
                className="flex items-center gap-3 text-primary-foreground/80 hover:text-accent transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-foreground/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-sm font-sans font-normal">info@titanscareers.co.uk</span>
              </a>
              
              <a 
                href="tel:+442039661548" 
                className="flex items-center gap-3 text-primary-foreground/80 hover:text-accent transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-foreground/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-sm font-sans font-normal">+44 20 3966 1548</span>
              </a>
              
              <div className="flex items-start gap-3 text-primary-foreground/80">
                <div className="w-10 h-10 rounded-lg bg-primary-foreground/5 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-sm font-sans font-normal leading-relaxed">
                  <p>3rd Floor, 45 Albemarle Street</p>
                  <p>Mayfair, London, W1S 4JL</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Column 2: Navigation Links */}
          <div className="grid grid-cols-2 gap-8 lg:gap-12">
            {/* Our Courses */}
            <div className="space-y-5">
              <h3 className="text-accent font-kanit font-bold text-lg tracking-tight">
                Our Courses
              </h3>
              <ul className="space-y-3">
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
                    to="/courses/cybersecurity" 
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-sans font-normal inline-block"
                  >
                    Cybersecurity
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
                    to="/courses/digital-marketing" 
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-sans font-normal inline-block"
                  >
                    Digital Marketing
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Company */}
            <div className="space-y-5">
              <h3 className="text-accent font-kanit font-bold text-lg tracking-tight">
                Company
              </h3>
              <ul className="space-y-3">
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
                    to="/testimonials" 
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
                    Blog & News
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/resources" 
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-sans font-normal inline-block"
                  >
                    Free Resources
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
          </div>
          
          {/* Column 3: Newsletter & Social */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-accent font-kanit font-bold text-lg tracking-tight">
                Stay Connected
              </h3>
              <p className="text-sm text-primary-foreground/80 leading-relaxed font-sans font-normal">
                Get weekly career tips, course updates, and exclusive job opportunities delivered to your inbox.
              </p>
            </div>
            
            <NewsletterSignup />
            
            <p className="text-xs text-primary-foreground/60 leading-relaxed font-sans font-normal">
              Free forever. Unsubscribe anytime. No spam, ever.
            </p>
            
            {/* Social Media */}
            <div className="pt-4">
              <h4 className="text-sm font-semibold text-primary-foreground mb-4 font-sans">
                Follow Our Journey
              </h4>
              <div className="flex flex-wrap gap-3">
                {socialMediaDisplay.map((social) => {
                  const IconComponent = social.name === "Facebook" ? Facebook :
                    social.name === "Instagram" ? Instagram :
                    social.name === "LinkedIn" ? Linkedin :
                    social.name === "Twitter" ? Twitter :
                    social.name === "YouTube" ? Youtube : null;
                  
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 rounded-lg bg-primary-foreground/5 hover:bg-accent/10 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg group"
                      aria-label={social.name}
                    >
                      {social.name === "TikTok" ? (
                        <svg className="w-5 h-5 text-primary-foreground/70 group-hover:text-accent transition-colors" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      ) : IconComponent && (
                        <IconComponent className="w-5 h-5 text-primary-foreground/70 group-hover:text-accent transition-colors" />
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Flexible Payment Options Section */}
        <div className="bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-8 mb-10 border border-primary-foreground/10 shadow-lg">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
              <span className="text-sm font-semibold text-accent font-sans tracking-wide">
                FLEXIBLE PAYMENT OPTIONS AVAILABLE
              </span>
            </div>
            
            <div className="flex justify-center">
              <img 
                src={payl8rLogo} 
                alt="Payl8r" 
                className="h-12 object-contain opacity-90"
              />
            </div>
            
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 max-w-3xl mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent text-sm font-bold">!</span>
                </div>
                <p className="text-xs leading-relaxed text-primary-foreground/70 font-sans font-normal text-left">
                  <span className="font-semibold text-accent">Important Credit Information:</span> TITANS CAREERS LIMITED is an Introducer Appointed Representative of Social Money Limited t/a Payl8r who is authorised by the FCA under Ref. Number 675283. Credit is subject to creditworthiness and affordability assessments. Missed payments may affect your credit file, future borrowing and incur fees. Representative APR 65.5%
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Legal Links */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 mb-8 pb-8 border-b border-primary-foreground/10">
          <Link 
            to="/privacy-policy" 
            className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-sans font-normal"
          >
            Privacy Policy
          </Link>
          <span className="text-primary-foreground/40">•</span>
          <Link 
            to="/refund-policy" 
            className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-sans font-normal"
          >
            Refund Policy
          </Link>
          <span className="text-primary-foreground/40">•</span>
          <Link 
            to="/terms-conditions" 
            className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-sans font-normal"
          >
            Terms & Conditions
          </Link>
        </div>
        
        {/* Registration Numbers */}
        <div className="text-center space-y-4 mb-6">
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs text-primary-foreground/60 font-sans font-normal">
            <span>Company No. 16017935</span>
            <span className="text-primary-foreground/40">•</span>
            <span>FCA No. 675283</span>
            <span className="text-primary-foreground/40">•</span>
            <span>UKRLP No. 10104588</span>
            <span className="text-primary-foreground/40">•</span>
            <span>ICO Reg. ZB954438</span>
          </div>
        </div>
      </div>
      
      {/* Bottom Copyright Bar */}
      <div className="border-t border-primary-foreground/10 bg-primary-foreground/5">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 py-6">
          <p className="text-center text-sm text-primary-foreground/70 font-sans font-normal">
            © 2025 <span className="text-accent font-semibold">TITANS CAREERS</span>. All rights reserved. 
            <span className="hidden sm:inline"> Built with passion for career transformation.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
