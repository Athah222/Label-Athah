
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';

export function LogoIntroAnimation() {
  const [loading, setLoading] = useState(true);
  const introRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animationPlayed = sessionStorage.getItem('logoAnimationPlayed');
    if (animationPlayed) {
      setLoading(false);
      return;
    }

    const startAnimation = () => {
      if (!logoRef.current || !introRef.current) return;

      const headerLogo = document.getElementById('header-logo');
      if (!headerLogo) {
        // If header logo isn't there (e.g. on a page without a header), just fade out.
        gsap.to(introRef.current, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            introRef.current!.style.display = 'none';
            sessionStorage.setItem('logoAnimationPlayed', 'true');
            window.dispatchEvent(new Event('logoAnimationEnd'));
            setLoading(false);
          },
        });
        return;
      }
      
      const targetRect = headerLogo.getBoundingClientRect();
      const logoRect = logoRef.current.getBoundingClientRect();

      const scaleX = targetRect.width / logoRect.width;
      const scaleY = targetRect.height / logoRect.height;
      
      const x = targetRect.left - logoRect.left;
      const y = targetRect.top - logoRect.top;

      gsap.timeline({
        onComplete: () => {
          introRef.current!.style.display = 'none';
          sessionStorage.setItem('logoAnimationPlayed', 'true');
          window.dispatchEvent(new Event('logoAnimationEnd'));
          setLoading(false);
        },
      })
      .to(logoRef.current, {
        delay: 0.5,
        duration: 1.5,
        x,
        y,
        scaleX,
        scaleY,
        ease: 'power3.inOut',
      })
      .to(introRef.current, {
        opacity: 0,
        duration: 0.5,
      }, '-=0.5');
    };
    
    // Use a small timeout to ensure the header logo is rendered and measurable
    const timeoutId = setTimeout(startAnimation, 100);

    return () => clearTimeout(timeoutId);

  }, []);

  if (!loading) {
    return null;
  }

  return (
    <div
      ref={introRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
    >
      <div ref={logoRef}>
        <Image
          src="/logo.png"
          alt="Athah Logo"
          width={400}
          height={133}
          priority
          className="object-contain"
        />
      </div>
    </div>
  );
}
