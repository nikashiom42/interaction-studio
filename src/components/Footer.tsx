import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { contactConfig, getPhoneLink, getEmailLink } from '@/config/contact';

const footerLinks = {
  support: {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/contact' },
      { label: 'Safety Information', href: '/contact' },
      { label: 'Cancellation Policy', href: '/contact' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  explore: {
    title: 'Explore',
    links: [
      { label: 'Browse Cars', href: '/cars' },
      { label: 'Tours', href: '/tours' },
    ],
  },
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary/70 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground text-sm hover:text-foreground transition-colors link-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={getPhoneLink()}
                  className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors group"
                >
                  <Phone className="w-4 h-4 flex-shrink-0 group-hover:text-primary transition-colors" />
                  <span>{contactConfig.phone.displayLocal}</span>
                </a>
              </li>
              <li>
                <a
                  href={getEmailLink()}
                  className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors group"
                >
                  <Mail className="w-4 h-4 flex-shrink-0 group-hover:text-primary transition-colors" />
                  <span className="truncate">{contactConfig.email}</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{contactConfig.address}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">R</span>
                </div>
                <span className="text-muted-foreground text-sm">© {currentYear} Rentals Georgia. All rights reserved.</span>
              </div>
              <span className="text-muted-foreground text-sm">
                Website by{' '}
                <a
                  href="https://digitalalchemy.ge/"
                  target="_blank"
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  Digital Alchemy
                </a>
              </span>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/contact" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Terms</Link>
              <a href="/sitemap.xml" className="hover:text-foreground transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
