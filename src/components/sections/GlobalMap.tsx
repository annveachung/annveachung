"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { SiteData } from "@/lib/data";

// Standard Mercator — the familiar "wall map" / Google-Maps look. The
// projection is fit to a fixed width and the viewBox is derived from the
// projected bounds so proportions stay correct (no stretched continents).
const W = 1000;
const ANTARCTICA = "010"; // dropped for a cleaner silhouette

type CountryPath = { code: string; name: string; d: string };

type Hover = { name: string; x: number; y: number } | null;

export function GlobalMap({
  settings,
  visitedCountries,
}: {
  settings: SiteData["settings"];
  visitedCountries: SiteData["visitedCountries"];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [countries, setCountries] = useState<CountryPath[]>([]);
  const [viewBox, setViewBox] = useState(`0 0 ${W} 600`);
  const [inView, setInView] = useState(false);
  const [hover, setHover] = useState<Hover>(null);

  const visitedCodes = useMemo(
    () => new Set(visitedCountries.map((c) => c.code)),
    [visitedCountries],
  );
  // Per-country reveal index + breathing delay, computed once per data change.
  // The breathing delay MUST be stable across renders — computing Math.random()
  // inline during render re-randomizes it on every mousemove, which restarts
  // every country's animation and makes them flicker.
  const STAGGER = 0.14; // s between each visited country lighting up
  const REVEAL_BASE = 0.6; // s transition duration
  const visitedTiming = useMemo(() => {
    const m = new Map<string, { revealDelay: number; breatheDelay: number }>();
    const n = visitedCountries.length;
    visitedCountries.forEach((c, i) => {
      m.set(c.code, {
        revealDelay: i * STAGGER,
        // Breathing starts after the whole reveal finishes, plus a random
        // offset so countries never pulse in unison.
        breatheDelay: n * STAGGER + REVEAL_BASE + Math.random() * 5,
      });
    });
    return m;
  }, [visitedCountries]);

  const visitedCount = visitedCountries.length;
  const worldPct = Math.round((visitedCount / 177) * 100);

  // Build the SVG country paths once from the local topojson.
  useEffect(() => {
    let cancelled = false;
    fetch("/geo/countries-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        if (cancelled) return;
        const fc = feature(
          topo,
          topo.objects.countries,
        ) as FeatureCollection<Geometry, { name?: string }>;
        const land: FeatureCollection<Geometry, { name?: string }> = {
          type: "FeatureCollection",
          features: fc.features.filter((f) => String(f.id) !== ANTARCTICA),
        };

        // Fit Mercator to the width, then size the viewBox to the projected
        // bounds so the map fills the frame with correct proportions.
        const projection = geoMercator().fitWidth(W, land);
        const pathGen = geoPath(projection);
        const [[x0, y0], [x1, y1]] = pathGen.bounds(land);
        setViewBox(`${x0} ${y0} ${x1 - x0} ${y1 - y0}`);

        const paths: CountryPath[] = land.features
          .map((f: Feature, i) => ({
            // A few features (e.g. Kosovo, Somaliland) have no id — fall back to
            // a synthetic unique code so React keys stay unique. These are never
            // "visited" (visited codes are numeric ISO ids), so they just render
            // as unvisited.
            code: f.id != null ? String(f.id) : `na-${i}`,
            name: f.properties?.name ?? String(f.id ?? `na-${i}`),
            d: pathGen(f) ?? "",
          }))
          .filter((c) => c.d);
        setCountries(paths);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Kick off the reveal once the section scrolls into view (once only).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="nodes"
      className={`worldmap relative w-full bg-surface-variant overflow-hidden scroll-mt-32 ${
        inView ? "in-view" : ""
      }`}
      onMouseLeave={() => setHover(null)}
    >
      {/* Subtle drifting radial-gradient depth layer (<8% opacity). */}
      <div className="worldmap-bg pointer-events-none absolute inset-0" />

      {/* Heading */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-margin-desktop pt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="font-label text-[11px] tracking-[0.3em] uppercase text-secondary">
              Whereabouts
            </span>
            <h2 className="font-headline font-bold text-[48px] leading-[56px] text-primary mt-2">
              The Map So Far
            </h2>
          </div>
          <div className="text-right flex flex-col items-end pb-1">
            <span className="font-headline font-bold text-[48px] leading-[52px] text-secondary">
              {worldPct}%
            </span>
            <span className="font-label text-[11px] tracking-[0.25em] uppercase text-on-surface-variant">
              of the world
            </span>
          </div>
        </div>
        <p className="text-on-surface-variant max-w-[36rem] mt-2">A growing record of countries explored and horizons chased.</p>
      </div>

      {/* Map */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-margin-desktop pb-12 pt-6">
        <svg
          className="worldmap-svg w-full h-auto block"
          viewBox={viewBox}
          role="img"
          aria-label={`World map highlighting ${visitedCount} visited countries`}
        >
          <defs>
            {/* Visited fill — slight turquoise gradient. */}
            <radialGradient id="visitedFill" cx="50%" cy="40%" r="75%">
              <stop offset="0%" stopColor="#aeece8" />
              <stop offset="100%" stopColor="#82d8d4" />
            </radialGradient>
            <radialGradient id="visitedFillHover" cx="50%" cy="40%" r="75%">
              <stop offset="0%" stopColor="#d4f6f4" />
              <stop offset="100%" stopColor="#8fe0dc" />
            </radialGradient>
          </defs>

          {/* Unvisited first (dark base), visited on top so glow isn't clipped. */}
          {countries.map((c) => {
            const isVisited = visitedCodes.has(c.code);
            if (isVisited) return null;
            return <path key={c.code} d={c.d} className="country" />;
          })}

          {countries.map((c) => {
            if (!visitedCodes.has(c.code)) return null;
            const t = visitedTiming.get(c.code);
            return (
              <path
                key={c.code}
                d={c.d}
                className="country country--visited"
                style={{
                  transitionDelay: `${t?.revealDelay ?? 0}s`,
                  animationDelay: `${t?.breatheDelay ?? 0}s`,
                }}
                onMouseEnter={(e) =>
                  setHover({
                    name: c.name,
                    x: e.clientX,
                    y: e.clientY,
                  })
                }
                onMouseMove={(e) =>
                  setHover({ name: c.name, x: e.clientX, y: e.clientY })
                }
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </svg>
      </div>

      {/* Cursor-following tooltip */}
      {hover && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[140%] rounded-lg bg-charcoal/90 backdrop-blur-md border border-accent-turquoise/30 px-3 py-1.5 shadow-xl"
          style={{ left: hover.x, top: hover.y }}
        >
          <span className="font-label text-xs text-primary whitespace-nowrap">
            {hover.name}
          </span>
        </div>
      )}
    </section>
  );
}
