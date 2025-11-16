import { Mail, MessageCircle, Facebook, Instagram, Linkedin, Twitter, Youtube, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import titansLogo from "@/assets/titans-logo.jpg";
import payl8rLogo from "@/assets/payl8r-logo.png";
import { NewsletterSignup } from "./NewsletterSignup";
import { socialMediaLinks } from "@/config/socialMedia";

export const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-primary via-primary to-primary/95 text-primary-foreground overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMTItMS43ODggNC00IDRDMTM1Ny43ODggMTYgMTM2MCAxNC4yMTIgMTM2MCAxMnMxLjc4OC00IDQtNCA0IDEuNzg4IDQgNHptMCAyNGMwIDIuMjEyLTEuNzg4IDQtNCA0cy00LTEuNzg4LTQtNCANCjEuNzg4LTQgNC00IDQgMS43ODggNCA0em0wLTI0YzAgMi4yMTItMS43ODggNC00IDRDMTA1Ny43ODggMTYgMTA2MCAxNC4yMTIgMTA2MCAxMnMxLjc4OC00IDQtNCA0IDEuNzg4IDQgNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
      
      <div className="container relative px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-12">
          
          {/* Brand Section - Takes more space */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-xl ring-4 ring-white/20">
                <img 
                  src={titansLogo} 
                  alt="Titans Careers Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-kanit font-bold text-accent">TITANS CAREERS</span>
                <span className="text-sm font-sans text-primary-foreground/80">Practical training. Real careers.</span>
              </div>
            </div>
            
            <p className="text-base font-sans text-primary-foreground/90 leading-relaxed max-w-md">
              Transform your career with practical tech training designed for real-world success. Join 300+ professionals who've successfully switched careers.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a 
                href="mailto:info@titanscareers.com" 
                className="flex items-center gap-3 text-sm hover:text-accent transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="font-sans">info@titanscareers.com</span>
              </a>
              
              <a 
                href="https://wa.me/447539434403"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm hover:text-accent transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="font-sans">+44 7539 434403</span>
              </a>

              <div className="flex items-start gap-3 text-sm">
                <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="font-sans text-primary-foreground/80">
                  3rd Floor, 45 Albemarle Street<br />
                  Mayfair, London, W1S 4JL
                </span>
              </div>
            </div>
          </div>
          
          {/* Courses */}
          <div className="lg:col-span-2">
            <h3 className="font-kanit font-bold mb-6 text-accent text-lg flex items-center gap-2">
              Our Courses
              <ArrowRight className="w-4 h-4" />
            </h3>
            <ul className="space-y-3 text-sm font-sans">
              <li>
                <Link to="/courses" className="text-primary-foreground/90 hover:text-accent transition-colors hover:translate-x-1 inline-block">
                  AML/KYC Compliance
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-primary-foreground/90 hover:text-accent transition-colors hover:translate-x-1 inline-block">
                  Data Analysis
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-primary-foreground/90 hover:text-accent transition-colors hover:translate-x-1 inline-block">
                  Cybersecurity
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-primary-foreground/90 hover:text-accent transition-colors hover:translate-x-1 inline-block">
                  Business Analysis
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-primary-foreground/90 hover:text-accent transition-colors hover:translate-x-1 inline-block">
                  Digital Marketing
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div className="lg:col-span-2">
            <h3 className="font-kanit font-bold mb-6 text-accent text-lg flex items-center gap-2">
              Company
              <ArrowRight className="w-4 h-4" />
            </h3>
            <ul className="space-y-3 text-sm font-sans">
              <li>
                <Link to="/about" className="text-primary-foreground/90 hover:text-accent transition-colors hover:translate-x-1 inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="text-primary-foreground/90 hover:text-accent transition-colors hover:translate-x-1 inline-block">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-primary-foreground/90 hover:text-accent transition-colors hover:translate-x-1 inline-block">
                  Blog & News
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-primary-foreground/90 hover:text-accent transition-colors hover:translate-x-1 inline-block">
                  Free Resources
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/90 hover:text-accent transition-colors hover:translate-x-1 inline-block">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-4">
            <h3 className="font-kanit font-bold mb-4 text-accent text-lg">Stay Connected</h3>
            <p className="text-sm font-sans text-primary-foreground/90 mb-6 leading-relaxed">
              Get weekly career tips, course updates, and exclusive job opportunities delivered to your inbox.
            </p>
            <NewsletterSignup 
              variant="minimal" 
              source="footer" 
            />
            <p className="text-xs font-sans text-primary-foreground/60 mt-3">
              Free forever. Unsubscribe anytime. No spam, ever.
            </p>

            {/* Social Media */}
            <div className="mt-8">
              <p className="text-sm font-sans text-primary-foreground/80 mb-4 font-medium">Follow Our Journey</p>
              <div className="flex items-center gap-3">
                <a 
                  href={socialMediaLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:text-accent hover:bg-primary-foreground/20 hover:scale-110 transition-all duration-300 shadow-lg"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a 
                  href={socialMediaLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:text-accent hover:bg-primary-foreground/20 hover:scale-110 transition-all duration-300 shadow-lg"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href={socialMediaLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:text-accent hover:bg-primary-foreground/20 hover:scale-110 transition-all duration-300 shadow-lg"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a 
                  href={socialMediaLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:text-accent hover:bg-primary-foreground/20 hover:scale-110 transition-all duration-300 shadow-lg"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
                <a 
                  href={socialMediaLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:text-accent hover:bg-primary-foreground/20 hover:scale-110 transition-all duration-300 shadow-lg"
                  aria-label="YouTube"
                >
                  <Youtube size={20} />
                </a>
                <a 
                  href={socialMediaLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:text-accent hover:bg-primary-foreground/20 hover:scale-110 transition-all duration-300 shadow-lg"
                  aria-label="TikTok"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent mb-8"></div>

        {/* Payment Partner Section */}
        <div className="flex flex-col items-center gap-6 py-8 mb-8 bg-primary-foreground/5 rounded-2xl border border-primary-foreground/10">
          <div className="text-center space-y-3">
            <p className="text-xs font-sans text-primary-foreground/70 uppercase tracking-wider font-semibold">
              Flexible Payment Options Available
            </p>
            <a 
              href="https://www.payl8r.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              <img 
                src={payl8rLogo}
                alt="Payl8r - Flexible Payment Partner" 
                className="h-10 w-auto mx-auto"
              />
            </a>
          </div>
          
          {/* Full Payl8r Disclaimer */}
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <p className="text-xs leading-relaxed text-primary-foreground/80 text-center">
                <strong className="font-semibold">Important Credit Information:</strong> TITANS CAREERS LIMITED is an Introducer Appointed Representative of Social Money Limited t/a Payl8r who is authorised by the FCA under Ref. Number 675283. Credit is subject to creditworthiness and affordability assessments. Missed payments may affect your credit file, future borrowing and incur fees. Representative APR 65.5%
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="space-y-6">
          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-sans">
            <Link 
              to="/privacy-policy" 
              className="text-primary-foreground/80 hover:text-accent transition-colors duration-300 hover:underline"
            >
              Privacy Policy
            </Link>
            <span className="text-primary-foreground/30">•</span>
            <Link 
              to="/refund-policy" 
              className="text-primary-foreground/80 hover:text-accent transition-colors duration-300 hover:underline"
            >
              Refund Policy
            </Link>
            <span className="text-primary-foreground/30">•</span>
            <Link 
              to="/terms-conditions" 
              className="text-primary-foreground/80 hover:text-accent transition-colors duration-300 hover:underline"
            >
              Terms & Conditions
            </Link>
          </div>

          {/* Company Registration */}
          <div className="flex flex-col items-center gap-3 text-xs font-sans text-primary-foreground/70">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                Company Number: 16369966
              </span>
              <span className="hidden sm:inline text-primary-foreground/30">|</span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                UKRLP Number: 10098472
              </span>
              <span className="hidden sm:inline text-primary-foreground/30">|</span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                ICO Registered
              </span>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center pt-6 border-t border-primary-foreground/10">
            <p className="text-sm font-sans text-primary-foreground/80">
              © {new Date().getFullYear()} <span className="font-semibold text-accent">TITANS CAREERS</span>. All rights reserved.
            </p>
            <p className="text-xs text-primary-foreground/60 mt-2">
              Built with passion for career transformation.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
