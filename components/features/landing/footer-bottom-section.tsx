export function FooterBottomSection() {
  return (
    <section className="bg-black">
      {/* Watermark strip — fixed height clips the bottom of the letters */}
      <div
        className="relative overflow-hidden"
        style={{ height: "clamp(6rem, 19vw, 16rem)" }}
        aria-hidden
      >
        <p
          className="select-none bg-gradient-to-b from-[#FA8112]/60 to-white/90 bg-clip-text text-center text-[clamp(7rem,24vw,20rem)] font-bold leading-none tracking-tighter text-transparent"
          style={{ fontFamily: "var(--font-primary)" }}
        >
          Cliniva
        </p>
      </div>
    </section>
  );
}
