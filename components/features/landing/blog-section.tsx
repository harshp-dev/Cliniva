"use client";

import Image from "next/image";
import { useRef } from "react";
const BLOG_POSTS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80",
    category: "Virtual Care",
    title: "The Ultimate Guide to Launching a Telehealth Practice in 2025",
    date: "Mar 12, 2025",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80",
    category: "Compliance",
    title: "HIPAA Compliance Best Practices for Digital Health Startups",
    date: "Mar 8, 2025",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&q=80",
    category: "Development",
    title: "API-First EHR: A Developer's Guide to Healthcare Integration",
    date: "Mar 5, 2025",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=400&q=80",
    category: "Operations",
    title: "Scaling Virtual Care Operations Without Losing Quality",
    date: "Feb 28, 2025",
  },
];

export function BlogSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section id="blog" className="bg-[#FAF3E1] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="reveal-text flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 inline-block rounded-full bg-[#FA8112]/20 px-4 py-1.5 text-sm font-medium text-[#FA8112]">
              News
            </span>
            <h2 className="text-2xl font-bold text-[#222222] sm:text-3xl lg:text-4xl">
              Discover the latest blogs
            </h2>
          </div>
          <div className="hidden gap-2 min-[400px]:flex">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="flex size-12 items-center justify-center rounded-full bg-[#222222] text-white transition-colors hover:bg-[#222222]/90 focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#FA8112] focus-visible:ring-offset-2"
              aria-label="Previous blogs"
            >
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="flex size-12 items-center justify-center rounded-full bg-[#222222] text-white transition-colors hover:bg-[#222222]/90 focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#FA8112] focus-visible:ring-offset-2"
              aria-label="Next blogs"
            >
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="reveal-text scroll-touch mt-8 flex gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-thin"
          style={{ scrollbarWidth: "thin" }}
        >
          {BLOG_POSTS.map((post) => (
            <article
              key={post.id}
              className="min-w-[280px] max-w-[320px] flex-1 shrink-0 overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg sm:min-w-[300px]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={post.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="320px"
                  unoptimized
                />
              </div>
              <div className="p-5">
                <span className="inline-block rounded-full bg-[#FA8112]/20 px-3 py-1 text-xs font-medium text-[#FA8112]">
                  {post.category}
                </span>
                <h3 className="mt-3 font-semibold text-[#222222] line-clamp-2">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-[#222222]/70">{post.date}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
