import React, { useState, useRef, useEffect } from 'react';
import { House, Search, CirclePlus, User, Settings } from 'lucide-react';
import { NavLink } from 'react-router';

type FooterProps = object;

const HINT_KEY = 'footerHintShown';

const Footer: React.FC<FooterProps> = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const [dragging, setDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [maxTranslate, setMaxTranslate] = useState(0);

  // 1) halbe Fensterhöhe als Max
  useEffect(() => {
    const updateMax = () => setMaxTranslate(window.innerHeight / 2);
    updateMax();
    window.addEventListener('resize', updateMax);
    return () => window.removeEventListener('resize', updateMax);
  }, []);

  // 2) einmaliges „Hop“-Hint beim ersten Laden
  useEffect(() => {
    // erst auslösen, wenn maxTranslate berechnet ist
    if (maxTranslate <= 0) return;
    // prüfen, ob wir's schon gezeigt haben
    if (!localStorage.getItem(HINT_KEY)) {
      localStorage.setItem(HINT_KEY, 'true');
      // nach kurzer Verzögerung hochziehen…
      setTimeout(() => {
        setTranslateY(Math.round(maxTranslate * 1));
        // …und gleich wieder zurück
        setTimeout(() => {
          setTranslateY(0);
        }, 2000);
      }, 300);
    }
  }, [maxTranslate]);

  // 3) Click-Outside zum Schließen
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

  const onPointerDown: React.PointerEventHandler = (e) => {
    setDragging(true);
    setStartY(e.clientY);
    footerRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove: React.PointerEventHandler = (e) => {
    if (!dragging) return;
    const delta = startY - e.clientY;
    const clamped = Math.max(0, Math.min(delta, maxTranslate));
    setTranslateY(Math.round(clamped));
  };

  const onPointerUp: React.PointerEventHandler = (e) => {
    setDragging(false);
    footerRef.current?.releasePointerCapture(e.pointerId);

    // Auto-Snap: halb oder ganz zu
    const threshold = maxTranslate / 2;
    setTranslateY((prev) => (prev > threshold ? maxTranslate : 0));
  };

  return (
    <>
      {/* Slide-Up Panel */}
      <section
        ref={sectionRef}
        className="fixed w-full overflow-hidden z-40"
        style={{
          bottom: '0px',
          height: translateY + 1, // +1 für sauberes Überlappen
          transition: dragging ? 'none' : 'height 0.2s',
          willChange: 'height',
        }}
      >
        <div className="h-full bg-white dark:bg-gray-900">
          <NavLink to="/settings" className="flex items-center gap-6 p-6">
            <Settings className="w-6 h-6 text-gray-500" />
            <h2 className="text-lg">Settings</h2>
          </NavLink>
        </div>
      </section>

      {/* Footer-Navigation */}
      <div
        ref={footerRef}
        className="fixed bottom-0 w-full h-20 flex items-center justify-between p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-t-lg shadow-g z-50 touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          transform: `translateY(${-translateY}px)`,
          transition: dragging ? 'none' : 'transform 0.2s',
          willChange: 'transform',
          touchAction: 'none',
        }}
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${
              isActive ? 'text-[var(--color-brand-pink)]' : 'text-gray-500'
            } flex flex-col items-center`
          }
        >
          <House />
          <p className="text-xs">Home</p>
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            `${
              isActive ? 'text-[var(--color-brand-pink)]' : 'text-gray-500'
            } flex flex-col items-center`
          }
        >
          <Search />
          <p className="text-xs">Search</p>
        </NavLink>

        <NavLink
          to="/newpost"
          className={({ isActive }) =>
            `${
              isActive ? 'text-[var(--color-brand-pink)]' : 'text-gray-500'
            } flex flex-col items-center`
          }
        >
          <CirclePlus />
          <p className="text-xs">New Post</p>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${
              isActive ? 'text-[var(--color-brand-pink)]' : 'text-gray-500'
            } flex flex-col items-center`
          }
        >
          <User />
          <p className="text-xs">Profile</p>
        </NavLink>
      </div>
    </>
  );
};

export default Footer;
