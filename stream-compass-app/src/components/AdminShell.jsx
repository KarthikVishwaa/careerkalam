import {
  LayoutDashboard,
  Megaphone,
  FileText,
  Users,
  Search,
  Star,
  Image as ImageIcon,
  Phone,
  Compass,
  LogOut
} from 'lucide-react';

// Visually mirrors the real admin panel's sidebar (reverse-engineered from the
// live AdminApp bundle: same nav items/order, same #6D28D9 active highlight and
// #2E1065 heading colour) so landing here from the "Stream Selection" sidebar
// link doesn't feel like leaving the admin panel — it's a different app under
// the hood (see HANDOFF.md's isolated-folder plan), but every other item is a
// plain link straight back to the real admin pages.
const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/admin/campaigns', label: 'Campaigns', Icon: Megaphone },
  { href: '/admin/site-content', label: 'Site Content', Icon: FileText },
  { href: '/admin/registrations', label: 'Registrations', Icon: Users },
  { href: '/admin/support', label: 'Support Lookup', Icon: Search },
  { href: '/admin/testimonials', label: 'Testimonials', Icon: Star },
  { href: '/admin/social-proof', label: 'Social Proof', Icon: ImageIcon },
  { href: '/admin/free-call-requests', label: 'Free Call Requests', Icon: Phone },
  { href: '/stream-selection/#/admin', label: 'Stream Selection', Icon: Compass, active: true }
];

export default function AdminShell({ email, onLogout, children }) {
  return (
    <div className="sc-admin-shell">
      <aside className="sc-admin-sidebar">
        <a href="/admin" className="sc-admin-brand">
          CAREER<span className="sc-admin-brand-accent">KALAM</span>360
          <small>Admin Console</small>
        </a>

        <nav className="sc-admin-nav" aria-label="Admin">
          {NAV_ITEMS.map(({ href, label, Icon, active }) => (
            <a key={href} href={href} className={`sc-admin-nav-link${active ? ' is-active' : ''}`}>
              <Icon size={17} strokeWidth={2.2} />
              {label}
            </a>
          ))}
        </nav>

        {email && (
          <div className="sc-admin-user">
            <div className="sc-admin-user-row">
              <div className="sc-admin-avatar">{email.charAt(0).toUpperCase()}</div>
              <div className="sc-admin-email">{email}</div>
            </div>
            <button type="button" className="sc-btn sc-btn-secondary sc-admin-logout" onClick={onLogout}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
        )}
      </aside>

      <main className="sc-admin-main">{children}</main>
    </div>
  );
}
