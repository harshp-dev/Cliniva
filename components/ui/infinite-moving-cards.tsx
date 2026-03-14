"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type InfiniteMovingCardsDirection = "left" | "right" | "up" | "down";

export type InfiniteMovingCardsItem = {
  quote: string;
  name: string;
  title: string;
};

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
  renderItem,
}: {
  items: InfiniteMovingCardsItem[];
  direction?: InfiniteMovingCardsDirection;
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
  renderItem?: (item: InfiniteMovingCardsItem) => React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const isVertical = direction === "up" || direction === "down";

  useEffect(() => {
    const container = containerRef.current;
    const scroller = scrollerRef.current;

    if (!container || !scroller) {
      return;
    }

    if (scroller.dataset.cloned !== "true") {
      Array.from(scroller.children).forEach((item) => {
        scroller.appendChild(item.cloneNode(true));
      });
      scroller.dataset.cloned = "true";
    }

    container.style.setProperty(
      "--animation-direction",
      direction === "left" || direction === "up" ? "forwards" : "reverse"
    );

    container.style.setProperty(
      "--animation-duration",
      speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s"
    );
  }, [direction, speed]);

  const defaultCard = (item: InfiniteMovingCardsItem) => (
    <li
      className="relative w-[300px] max-w-full shrink-0 rounded-2xl border border-b-0 border-zinc-200 bg-[linear-gradient(180deg,#fafafa,#f5f5f5)] px-6 py-5 sm:w-[350px] sm:px-8 sm:py-6 md:w-[450px] dark:border-zinc-700 dark:bg-[linear-gradient(180deg,#27272a,#18181b)]"
      key={item.name}
    >
      <blockquote>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-0.5 -left-0.5 -z-1 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)] select-none"
        />
        <span className="relative z-20 text-sm leading-[1.6] font-normal text-neutral-800 dark:text-gray-100">
          {item.quote}
        </span>
        <div className="relative z-20 mt-6 flex flex-row items-center">
          <span className="flex flex-col gap-1">
            <span className="text-sm leading-[1.6] font-normal text-neutral-500 dark:text-gray-400">
              {item.name}
            </span>
            <span className="text-sm leading-[1.6] font-normal text-neutral-500 dark:text-gray-400">
              {item.title}
            </span>
          </span>
        </div>
      </blockquote>
    </li>
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 overflow-hidden",
        isVertical
          ? "h-[320px] max-w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] sm:h-[400px] lg:h-[480px]"
          : "max-w-7xl [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex shrink-0 gap-4 py-4",
          isVertical
            ? "h-max min-h-full flex-col flex-nowrap"
            : "w-max min-w-full flex-nowrap",
          isVertical ? "animate-scroll-up" : "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item) =>
          renderItem ? (
            <li key={item.name} className={cn("shrink-0", isVertical && "w-full")}>
              {renderItem(item)}
            </li>
          ) : (
            defaultCard(item)
          )
        )}
      </ul>
    </div>
  );
};

