import { HERO_MEDIA } from "@/lib/site";
import { HeroBeam } from "./HeroBeam";

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
        <HeroBeam />
      )}

      {/* Readability: darker on the left where the text sits, fade into the page at the bottom. */}
      {media && <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/30" />}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
      <div className="hero-grain absolute inset-0 opacity-[0.07] mix-blend-overlay" />
    </div>
  );
}
