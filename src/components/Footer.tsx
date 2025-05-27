import React, { useState, useRef, useEffect } from 'react';
import {
  House,
  Search,
  CirclePlus,
  User,
  Settings,
  Shuffle,
  Menu,
  X,
  Info,
  GlobeLock,
} from 'lucide-react';
import { NavLink } from 'react-router';
import Logout from './Logout';
import { ModeToggle } from './DarkMode/mode-toggle';

type NavItem = {
  to: string;
  icon: React.ReactNode;
  label: string;
  onMobile?: boolean; // if false, hide in mobile footer
};

const navItems: NavItem[] = [
  { to: '/', icon: <House />, label: 'Home', onMobile: true },
  { to: '/search', icon: <Search />, label: 'Search', onMobile: true },
  { to: '/newpost', icon: <CirclePlus />, label: 'New Post', onMobile: true },
  { to: '/shuffle', icon: <Shuffle />, label: 'Shuffle', onMobile: true },
  { to: '/profile', icon: <User />, label: 'Profile', onMobile: true },
  // Desktop-only items
  {
    to: '/profile-edit',
    icon: <User />,
    label: 'Edit Profile',
    onMobile: false,
  },
  { to: '/settings', icon: <Settings />, label: 'Settings', onMobile: false },
];

const HINT_KEY = 'footerHintShown';

const Footer: React.FC = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [dragging, setDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [maxTranslate, setMaxTranslate] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 1) Set half of viewport height as maximum translation
  useEffect(() => {
    const updateMax = () => setMaxTranslate(window.innerHeight / 2);
    updateMax();
    window.addEventListener('resize', updateMax);
    return () => window.removeEventListener('resize', updateMax);
  }, []);

  // 2) One-time hint animation
  useEffect(() => {
    if (maxTranslate <= 0) return;
    if (!localStorage.getItem(HINT_KEY)) {
      localStorage.setItem(HINT_KEY, 'true');
      setTimeout(() => {
        setTranslateY(Math.round(maxTranslate));
        setTimeout(() => setTranslateY(0), 2000);
      }, 300);
    }
  }, [maxTranslate]);

  // 3) Click outside to close panel
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sectionRef.current &&
        footerRef.current &&
        !sectionRef.current.contains(e.target as Node) &&
        !footerRef.current.contains(e.target as Node)
      ) {
        setTranslateY(0);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Touch drag handlers for mobile panel
  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.pointerType !== 'touch') return;
    setDragging(true);
    setStartY(e.clientY);
    footerRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging || e.pointerType !== 'touch') return;
    const delta = startY - e.clientY;
    const clamped = Math.max(0, Math.min(delta, maxTranslate));
    setTranslateY(Math.round(clamped));
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.pointerType !== 'touch') return;
    setDragging(false);
    footerRef.current?.releasePointerCapture(e.pointerId);
    setTranslateY((prev) => (prev > maxTranslate / 2 ? maxTranslate : 0));
  };

  // Filter items for mobile footer (exclude desktop-only)
  const mobileNav = navItems.filter((item) => item.onMobile !== false);

  return (
    <>
      {/* Hamburger button bottom-right for desktop */}
      <button
        className="hidden md:flex fixed bottom-4 right-4 z-60 p-4 bg-white/90 dark:bg-stone-900/90 rounded-full shadow-lg"
        onClick={() => setSidebarOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Sidebar drawer */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white/80 dark:bg-stone-950/90 backdrop-blur-lg shadow-lg z-50
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="flex flex-col gap-4 p-6 h-full">
          {navItems.map(({ to, icon, label }, i) => (
            <NavLink
              key={i}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg text-lg font-medium ${
                  isActive
                    ? 'bg-brand-pink/20 text-brand-pink'
                    : 'text-stone-600 dark:text-stone-400 dark:hover:text-stone-500 hover:text-stone-500'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}
          <Logout />
        </nav>
      </aside>

      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Slide-up panel for mobile settings */}
      <section
        ref={sectionRef}
        className="fixed w-full overflow-hidden z-40 md:bottom-auto md:left-0 md:top-0 md:h-full md:w-64"
        style={{
          bottom: 0,
          height: translateY + 3,
          transition: dragging ? 'none' : 'height 0.2s',
          willChange: 'height',
        }}
      >
        <div className="flex h-screen flex-col items-center bg-white/80 dark:bg-stone-900/90 backdrop-blur-lg">
          <div className="flex flex-row items-center justify-between w-full p-4 border-b border-gray-200 dark:border-stone-700">
            <div>
              <NavLink
                to="/settings"
                className="flex items-center gap-2 p-3 text-lg"
              >
                <Settings />
                <span>Settings</span>
              </NavLink>
              <NavLink
                to="/privacy"
                className="flex items-center gap-3 p-3 text-lg"
              >
                <GlobeLock />
                <span>Privacy</span>
              </NavLink>
              <NavLink
                to="/about"
                className="flex items-center gap-3 p-3 text-lg"
              >
                <Info />
                <span>About</span>
              </NavLink>
            </div>
            <div className="flex items-center gap-3 p-3 text-lg">
              <Logout />
              <ModeToggle />
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xl justify-center mt-2">
            <p className="text-center">Made with ❤️ by</p>
            <div className="flex gap-6 flex-wrap justify-center">
              <a href="https://github.com/ninjagrrrl" target="_blank">
                Jule
                <img
                  src="https://github.com/ninjagrrrl.png"
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
              </a>
              <a href="https://github.com/realmaxv" target="_blank">
                Max
                <img
                  src="https://github.com/realmaxv.png"
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
              </a>
              <a href="https://github.com/HAO-317" target="_blank">
                Hao
                <img
                  src="https://github.com/HAO-317.png"
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
              </a>
              <a href="https://github.com/elmin-hasanov" target="_blank">
                Elmin
                <img
                  src="https://github.com/elmin-hasanov.png"
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile footer navigation */}
      <div
        ref={footerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="fixed bottom-0 w-full h-18 pt-1 gap-10 flex items-center justify-around p-4 bg-white/80 dark:bg-stone-950/90 backdrop-blur-lg md:hidden"
        style={{
          transform: `translateY(${-translateY}px)`,
          transition: dragging ? 'none' : 'transform 0.2s',
          willChange: 'transform',
          touchAction: 'none',
        }}
      >
        {mobileNav.map(({ to, icon }, i) => (
          <NavLink
            key={i}
            to={to}
            className={({ isActive }) =>
              `${
                isActive
                  ? 'text-[var(--color-brand-pink)]'
                  : 'text-gray-700 dark:text-rose-100'
              }`
            }
          >
            {icon}
          </NavLink>
        ))}
      </div>
    </>
  );
};

export default Footer;
