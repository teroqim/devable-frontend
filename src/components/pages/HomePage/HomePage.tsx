'use client';

import { SignInButton, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button/button';
import './HomePage.css';

export default function HomePage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="home-page-container">
      <div className="home-page-content">
        <h1 className="home-page-title">Welcome to Devable</h1>
        <p className="home-page-description">
          Build apps with AI-assisted development. Full transparency, full
          control.
        </p>
        <div className="home-page-cta">
          {isSignedIn ? (
            <Button
              size="lg"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          ) : (
            <SignInButton
              mode="modal"
              forceRedirectUrl="/dashboard"
            >
              <Button size="lg">Get Started</Button>
            </SignInButton>
          )}
        </div>
      </div>
    </div>
  );
}
