'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home as HomeIcon, Menu as MenuIcon, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import clsx from 'clsx';
import './Navbar.css';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleToggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const handleCloseMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <>
      <div className="navbar-mobile-header">
        <Link
          href="/dashboard"
          className="navbar-mobile-home-link"
          onClick={handleCloseMobileMenu}
        >
          <HomeIcon size={24} />
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleMobileMenu}
          className="navbar-mobile-menu-button"
        >
          {mobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div
          className="navbar-overlay"
          onClick={handleCloseMobileMenu}
        />
      )}

      <nav className={clsx('navbar', { open: mobileMenuOpen })}>
        <Link
          href="/dashboard"
          className="navbar-header"
        >
          <HomeIcon size={32} />
        </Link>

        <ul className="navbar-list">
          <li className="navbar-list-item">
            <Link
              href="/dashboard"
              className={clsx('navbar-link', {
                active: pathname === '/dashboard',
              })}
              onClick={handleCloseMobileMenu}
            >
              Dashboard
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
