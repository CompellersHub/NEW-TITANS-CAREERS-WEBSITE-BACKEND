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
    <footer className="bg-[#0B1F3B] text-white border-t border-white/10">
      {/* TOP FOOTER ROW - 4 Columns */}
      <div className="max-w-[1280px] mx-auto px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Column 1: Titans Careers */}
          <div className="space-y-4">
            <h3 className="text-[#FFB000] font-kanit font-bold text-lg">Titans Careers</h3>
            <p className="text-white text-sm leading-relaxed">
              Learn what sets professionals apart.
            </p>
            <p className="text-white text-sm leading-relaxed">
              Specializing in high-impact masterclasses for AML/KYC Compliance, Business Analysis/Project Management, Data Analytics, and Cybersecurity professionals.
            </p>
          </div>
          
          {/* Column 2: Contact Us */}
          <div className="space-y-4">
            <h3 className="text-[#FFB000] font-kanit font-bold text-lg">Contact Us</h3>
            <div className="space-y-3">
              <a
                href="mailto:support@titanscareers.com"
                className="flex items-center gap-3 text-white hover:text-[#FFB000] transition-colors group"
                aria-label="Email Titans Careers"
              >
                <Mail className="w-5 h-5 flex-shrink-0 text-white" />
                <span className="text-sm text-white">support@titanscareers.com</span>
              </a>
              
              <a
                href="tel:+442045720475"
                className="flex items-center gap-3 text-white hover:text-[#FFB000] transition-colors group"
                aria-label="Call Titans Careers"
              >
                <Phone className="w-5 h-5 flex-shrink-0 text-white" />
                <span className="text-sm text-white">+44 20 4572 0475</span>
              </a>
              
              <a
                href="https://wa.me/447539434403"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white hover:text-[#FFB000] transition-colors group"
                aria-label="WhatsApp Titans Careers"
              >
                <Phone className="w-5 h-5 flex-shrink-0 text-white" />
                <span className="text-sm text-white">WhatsApp: +44 7539 434403</span>
              </a>
            </div>
          </div>
          
          {/* Column 3: Our Office */}
          <div className="space-y-4">
            <h3 className="text-[#FFB000] font-kanit font-bold text-lg">Our Office</h3>
            <div className="space-y-3">
              <a
                href="https://www.google.com/maps?q=3rd+Floor,+45+Albemarle+Street,+Mayfair,+London,+W1S+4JL,+United+Kingdom"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 hover:text-[#FFB000] transition-colors"
                aria-label="View Titans Careers office on Google Maps"
              >
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-white" />
                <div className="leading-relaxed">
                  <p className="text-white text-sm">3rd Floor, 45 Albemarle Street, Mayfair, London, W1S 4JL, United Kingdom.</p>
                </div>
              </a>
              
              <div className="text-white text-sm leading-relaxed ml-8">
                <p>Mon-Fri: 9AM - 5PM</p>
                <p>Weekends by appointment</p>
              </div>
            </div>
          </div>
          
          {/* Column 4: Quick Links */}
          <nav aria-label="Footer navigation" className="space-y-4">
            <h3 className="text-[#FFB000] font-kanit font-bold text-lg">Quick Links</h3>
            <ul className="space-y-2.5">
              <li>
                <Link 
                  to="/courses" 
                  className="text-sm text-white hover:text-[#FFB000] transition-colors inline-block"
                >
                  Our Courses
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-sm text-white hover:text-[#FFB000] transition-colors inline-block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-sm text-white hover:text-[#FFB000] transition-colors inline-block"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms-conditions" 
                  className="text-sm text-white hover:text-[#FFB000] transition-colors inline-block"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* BOTTOM FOOTER ROW */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="max-w-[1280px] mx-auto px-6">
          
          {/* Legal + Social + FCA Disclosure */}
          <div className="py-6 space-y-4">
            {/* Legal Links + Social Icons */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              {/* Legal Links */}
              <nav aria-label="Legal links" className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                <Link 
                  to="/privacy-policy" 
                  className="text-sm text-white hover:text-[#FFB000] transition-colors"
                >
                  Privacy Policy
                </Link>
                <span className="text-white/60">|</span>
                <Link 
                  to="/refund-policy" 
                  className="text-sm text-white hover:text-[#FFB000] transition-colors"
                >
                  Refund Policy
                </Link>
                <span className="text-white/60">|</span>
                <Link 
                  to="/terms-conditions" 
                  className="text-sm text-white hover:text-[#FFB000] transition-colors"
                >
                  Terms & Conditions
                </Link>
              </nav>
              
              {/* Social Media Icons */}
              <div className="flex items-center justify-center md:justify-end gap-2">
                {socialMediaDisplay.map((social) => {
                  const Icon = socialIcons[social.icon as keyof typeof socialIcons];
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#FFB000]/20 hover:scale-110 transition-all text-white hover:text-[#FFB000]"
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
            </div>
            
            {/* FCA Disclosure */}
            <div className="pt-3 border-t border-white/5">
              <p className="text-[10px] leading-relaxed text-white/80 max-w-3xl">
                TITANS CAREERS LIMITED is an Introducer Appointed Representative of Social Money Limited t/a PayL8r who is authorised by the FCA under Ref Number 675283. Credit is subject to creditworthiness and affordability assessments. Missed payments may affect your credit file, future borrowing and incur fees.
              </p>
            </div>
          </div>
          
          {/* Copyright Strip */}
          <div className="py-3 border-t border-white/5 text-center">
            <p className="text-xs text-white/80">
              © 2025 Titans Careers. All rights reserved. Built with passion for career transformation.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
