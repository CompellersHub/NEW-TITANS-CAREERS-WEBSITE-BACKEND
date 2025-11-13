import { Mail, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import titansLogo from "@/assets/titans-logo.jpg";

export const Footer = () => {
  return (
    <footer className="bg-primary text-white border-t border-white/10 py-12">
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
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
                <span className="text-base font-bold">Titans Careers</span>
                <span className="text-xs text-white/70">Practical training. Real careers.</span>
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Transform your career with practical tech training. Join 300+ career switchers.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-accent">Courses</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/courses" className="hover:text-accent transition-colors">AML/KYC Compliance</Link></li>
              <li><Link to="/courses" className="hover:text-accent transition-colors">Data Analysis</Link></li>
              <li><Link to="/courses" className="hover:text-accent transition-colors">Cybersecurity</Link></li>
              <li><Link to="/courses" className="hover:text-accent transition-colors">Business Analysis</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-accent">Company</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/testimonials" className="hover:text-accent transition-colors">Success Stories</Link></li>
              <li><Link to="/blog" className="hover:text-accent transition-colors">Blog</Link></li>
              <li><Link to="/resources" className="hover:text-accent transition-colors">Free Resources</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-accent">Contact</h3>
            <ul className="space-y-3 text-sm text-white/80">
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
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/70">
            © 2024 Titans Careers. All rights reserved.
          </p>
          
          <div className="text-sm text-white/70">
            <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
            <span className="mx-3">·</span>
            <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
