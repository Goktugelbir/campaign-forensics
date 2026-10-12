import { HERO_MEDIA } from "@/lib/site";

/**
 * Full-bleed background behind the landing hero. Uses HERO_MEDIA (video or photo) when set,
 * otherwise an animated amber light beam echoing the logo. Overlays keep the headline readable
 * and fade the bottom edge into the page.
 */
export function HeroBackground() {
  const media = HERO_MEDIA;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {media?.video ? (
        <>
          <video
            className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
            src={media.video}
            poster={media.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          {media.poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.poster} alt="" className="absolute inset-0 hidden h-full w-full object-cover motion-reduce:block" />
          )}
        </>
      ) : media?.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <Beam />
      )}

      {/* Readability: darker on the left where the text sits, fade into the page at the bottom. */}
      {media && <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/30" />}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
      <div className="hero-grain absolute inset-0 opacity-[0.07] mix-blend-overlay" />
    </div>
  );
}

/**
 * The logo's motif: a four-point star with a soft amber beam fanning out to the right, sweeping slowly.
 * Hidden on small screens, where the text spans the full width and the star would sit on it.
 */
function Beam() {
  return (
    <div className="absolute inset-0 hidden md:block">
      <div className="hero-beam absolute inset-0" />
      <div className="absolute left-[70%] top-[62%] h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/[0.08] blur-[110px]" />
      <svg viewBox="0 0 24 24" className="hero-spark absolute left-[70%] top-[62%] h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-amber">
        <path fill="currentColor" d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0Z" />
      </svg>
    </div>
  );
}
