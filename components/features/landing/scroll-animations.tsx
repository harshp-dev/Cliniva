"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollAnimations() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const revealElements = gsap.utils.toArray<HTMLElement>(".reveal-text");
    const revealTriggers: ScrollTrigger[] = [];

    revealElements.forEach((elem) => {
      const tween = gsap.fromTo(
        elem,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
      );

      const trigger = ScrollTrigger.create({
        trigger: elem,
        start: "top 85%",
        onEnter: () => tween.play(),
        onEnterBack: () => tween.play(),
      });

      revealTriggers.push(trigger);
    });

    const staggerContainer = document.querySelector(".stagger-container");
    const staggerItems = gsap.utils.toArray<HTMLElement>(".stagger-item");
    const staggerTween =
      staggerContainer && staggerItems.length
        ? gsap.fromTo(
            staggerItems,
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.1,
              duration: 0.5,
              ease: "power2.out",
              paused: true,
            }
          )
        : null;

    const staggerTrigger = staggerContainer
      ? ScrollTrigger.create({
          trigger: staggerContainer,
          start: "top 80%",
          onEnter: () => staggerTween?.play(),
          onEnterBack: () => staggerTween?.play(),
        })
      : null;

    return () => {
      revealTriggers.forEach((trigger) => trigger.kill());
      staggerTrigger?.kill();
      ScrollTrigger.refresh();
    };
  }, []);

  return null;
}
