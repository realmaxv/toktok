
import React, { useState, useRef, useEffect } from 'react';
import { House, Search, CirclePlus, User } from 'lucide-react';
import { NavLink } from 'react-router';
import { Settings } from 'lucide-react';

type FooterProps = {
  // Hier kannst du Props definieren, falls nötig
};

const Footer: React.FC<FooterProps> = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [maxTranslate, setMaxTranslate] = useState(0);

  // Berechne maximale Auszugshöhe (halbe Fensterhöhe)
  useEffect(() => {
    const updateMax = () => setMaxTranslate(window.innerHeight / 2);
    updateMax();
    window.addEventListener('resize', updateMax);
    return () => window.removeEventListener('resize', updateMax);
  }, []);

  // Pointer-Down behandeln (Maus oder Touch)
  const onPointerDown: React.PointerEventHandler = (e) => {
    setDragging(true);
    setStartY(e.clientY);
    // Fußbereich greifen
    footerRef.current?.setPointerCapture(e.pointerId);
  };

  // Pointer-Move: Höhe anpassen
  const onPointerMove: React.PointerEventHandler = (e) => {
    if (!dragging) return;
    const delta = startY - e.clientY;
    const clamped = Math.max(0, Math.min(delta, maxTranslate));
    setTranslateY(clamped);
  };

  // Pointer-Up: Ziehen beenden
  const onPointerUp: React.PointerEventHandler = (e) => {
    setDragging(false);
    footerRef.current?.releasePointerCapture(e.pointerId);
  };


  return (

    <>
      {/* Der aufziehbare Bereich */}
      <section
        className="fixed bottom-0 w-full overflow-hidden z-40"
        style={{
          height: translateY, // Sichtbare Höhe
          transition: dragging ? 'none' : 'height 0.2s',
        }}

      >
        <div className="h-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-6 p-6">
            <Settings className="w-6 h-6 text-gray-500" />
            <h2 className="text-lg">Settings</h2>
          </div>
        </div>
      </section>
      {/* Footer, das gegriffen und verschoben werden kann */}
      <div
        ref={footerRef}
        className="w-full h-20 fixed bottom-0 flex items-center justify-between p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-t-lg shadow-g z-50 touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          transform: `translateY(${-translateY}px)`,
          transition: dragging ? 'none' : 'transform 0.2s',
          touchAction: 'none', // verhindert Scroll-Konflikte
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
