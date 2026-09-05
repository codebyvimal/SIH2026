/**
 * Shared NavBar component used by every page in the app.
 *
 * Design tokens:
 *   - Background: Deep Navy  #1E293B
 *   - Accent / Saffron: #E65100
 *
 * The emblem is a locally-bundled inline-SVG — zero external network requests.
 */

import Link from "next/link";
import React from "react";

// ── Inline SVG Emblem ─────────────────────────────────────────────────────────
// Stylised Ashoka-Chakra wheel: concentric circles + 24 spokes.
export const IndiaEmblemSVG = ({
  className = "h-full w-full",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="India Emblem"
  >
    <circle cx="40" cy="40" r="36" stroke="#E65100" strokeWidth="3.5" />
    <circle cx="40" cy="40" r="28" stroke="#E65100" strokeWidth="1.2" />
    <circle cx="40" cy="40" r="20" stroke="#E65100" strokeWidth="1" />
    <circle cx="40" cy="40" r="6" fill="#E65100" />
    {Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * Math.PI) / 12;
      return (
        <line
          key={i}
          x1={40 + 6 * Math.cos(angle)}
          y1={40 + 6 * Math.sin(angle)}
          x2={40 + 28 * Math.cos(angle)}
          y2={40 + 28 * Math.sin(angle)}
          stroke="#E65100"
          strokeWidth="1.2"
        />
      );
    })}
  </svg>
);

// ── Inline SVG Avatar placeholder ────────────────────────────────────────────
export const AvatarSVG = ({
  isAdmin = false,
  className = "h-full w-full",
}: {
  isAdmin?: boolean;
  className?: string;
}) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label={isAdmin ? "Admin avatar" : "User avatar"}
  >
    <rect width="40" height="40" rx="20" fill={isAdmin ? "#78350f" : "#1e3a5f"} />
    <circle cx="20" cy="15" r="7" fill={isAdmin ? "#fbbf24" : "#60a5fa"} />
    <path
      d="M6 38c0-7.732 6.268-14 14-14s14 6.268 14 14"
      fill={isAdmin ? "#fbbf24" : "#60a5fa"}
    />
  </svg>
);

// ── Types ─────────────────────────────────────────────────────────────────────

export type NavVariant = "employee" | "admin" | "minimal";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  /** Marks this item as the current active page */
  active?: boolean;
  /** If true, renders as a plain <span> (truly disabled) not a link */
  disabled?: boolean;
}

export interface NavBarProps {
  variant?: NavVariant;
  /** Show live/offline badge next to the title (employee dashboards) */
  isLive?: boolean;
  /** Centre slot navigation items */
  navItems?: NavItem[];
  /** Right-side "switch view" link href */
  switchHref?: string;
  switchLabel?: string;
}

// ── Live / Offline badge ──────────────────────────────────────────────────────
const LiveBadge = ({ isLive }: { isLive: boolean }) =>
  isLive ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      Live
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      Offline — cached
    </span>
  );

// ── Main component ────────────────────────────────────────────────────────────

export default function NavBar({
  variant = "employee",
  isLive,
  navItems = [],
  switchHref,
  switchLabel,
}: NavBarProps) {
  const subtitle =
    variant === "admin"
      ? "Government of India — Admin View"
      : "Government of India — MoSPI";

  return (
    <nav
      className="flex items-center justify-between bg-deep-navy px-6 py-3 text-white sticky top-0 z-40 border-b border-white/10 shadow-sm"
      aria-label="Site navigation"
    >
      {/* ── Brand ── */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-deep-navy p-1 ring-1 ring-saffron/40 group-hover:ring-saffron transition">
          <IndiaEmblemSVG />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-wide">
              National Learning Portal
            </h1>
            {isLive !== undefined && <LiveBadge isLive={isLive} />}
          </div>
          <p className="text-[10px] text-slate-400">{subtitle}</p>
        </div>
      </Link>

      {/* ── Centre nav items ── */}
      {navItems.length > 0 && (
        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) =>
            item.active ? (
              <span
                key={item.label}
                className="flex items-center gap-2 border-b-2 border-saffron pb-1 text-sm font-semibold text-white cursor-default select-none"
              >
                {item.icon}
                {item.label}
              </span>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-2 pb-1 text-sm text-slate-400 hover:text-white border-b-2 border-transparent hover:border-saffron/50 transition-colors"
              >
                {item.icon}
                {item.label}
              </Link>
            ),
          )}
        </div>
      )}

      {/* ── Right slot ── */}
      {variant !== "minimal" && (
      <div className="flex items-center gap-3">
        {switchHref && switchLabel && (
          <Link
            href={switchHref}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-saffron/80 transition flex items-center gap-1 border border-white/20"
          >
            {switchLabel}
          </Link>
        )}

        {variant === "admin" && (
          <span className="rounded-full bg-saffron px-3 py-1 text-xs font-bold text-white hidden sm:inline">
            ADMIN
          </span>
        )}

        {/* Avatar — inline SVG, no external URL */}
        <div
          className={`h-8 w-8 shrink-0 overflow-hidden rounded-full border-2 ${
            variant === "admin" ? "border-amber-400" : "border-slate-400"
          }`}
        >
          <AvatarSVG isAdmin={variant === "admin"} />
        </div>
      </div>
      )}
    </nav>
  );
}
