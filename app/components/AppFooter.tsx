// Alternative version without Github icon
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Package, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Heart,
  Mail,
  Phone,
  MapPin,
  Clock,
  Globe
} from "lucide-react";

export default function AppFooter() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  // Don't show footer on login page
  if (pathname === '/login') {
    return null;
  }

  return (
    <footer className="border-t border-[#94B4C1]/20 bg-[#213448]/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#94B4C1] to-[#EAE0CF] flex items-center justify-center">
                <span className="text-sm font-bold text-[#213448]">PT</span>
              </div>
              <span className="text-lg font-semibold text-white">PinTrack</span>
            </div>
            <p className="text-sm text-[#94B4C1] leading-relaxed">
              Streamline merchandise sales with real-time inventory tracking and management.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="text-[#94B4C1] hover:text-[#EAE0CF] transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#94B4C1] hover:text-[#EAE0CF] transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm text-[#94B4C1] hover:text-[#EAE0CF] transition-colors flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pins/new" className="text-sm text-[#94B4C1] hover:text-[#EAE0CF] transition-colors flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  New Pin
                </Link>
              </li>
              <li>
                <Link href="/inventory" className="text-sm text-[#94B4C1] hover:text-[#EAE0CF] transition-colors flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Inventory
                </Link>
              </li>
              <li>
                <Link href="/salespeople" className="text-sm text-[#94B4C1] hover:text-[#EAE0CF] transition-colors flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-sm text-[#94B4C1] hover:text-[#EAE0CF] transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-[#94B4C1] hover:text-[#EAE0CF] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-[#94B4C1] hover:text-[#EAE0CF] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#94B4C1] mt-0.5" />
                <p className="text-sm text-[#94B4C1]">Nairobi, Kenya</p>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#94B4C1] mt-0.5" />
                <p className="text-sm text-[#94B4C1]">+254 700 000 000</p>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#94B4C1] mt-0.5" />
                <p className="text-sm text-[#94B4C1]">support@pintrack.com</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#94B4C1] mt-0.5" />
                <p className="text-sm text-[#94B4C1]">24/7 Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#94B4C1]/20 pt-6 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-[#94B4C1]">
              © {currentYear} PinTrack. All rights reserved.
            </div>
            <div className="flex items-center gap-2 text-sm text-[#94B4C1]">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-[#EAE0CF] fill-[#EAE0CF]" />
              <span>for sales teams</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}