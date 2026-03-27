'use client';

import { UserButton } from '@clerk/nextjs';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <span className="header-title">Devable</span>
      </div>
      <div className="header-controls">
        <UserButton />
      </div>
    </header>
  );
}
