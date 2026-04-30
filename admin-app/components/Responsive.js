"use client";

/**
 * Responsive layout helpers — use these instead of inline grid styles
 * so mobile breakpoints work via CSS classes.
 */

/** 2-col on mobile, auto-fill on desktop — for stat cards */
export function StatsGrid({ children, className = '', style = {} }) {
  return (
    <div className={`resp-stats-grid ${className}`} style={style}>
      {children}
    </div>
  );
}

/** Stacks to 1-col on tablet — for main content + sidebar */
export function MainGrid({ children, className = '', style = {} }) {
  return (
    <div className={`resp-main-grid ${className}`} style={style}>
      {children}
    </div>
  );
}

/** Stacks to 1-col on tablet — for chart + activity */
export function ChartGrid({ children, className = '', style = {} }) {
  return (
    <div className={`resp-chart-grid ${className}`} style={style}>
      {children}
    </div>
  );
}

/** 1-col on mobile — for wide cards (offers, campaigns, etc.) */
export function CardsGrid({ children, className = '', style = {} }) {
  return (
    <div className={`resp-cards-grid ${className}`} style={style}>
      {children}
    </div>
  );
}

/** 2-col on mobile — for quick stat mini cards */
export function QuickGrid({ children, className = '', style = {} }) {
  return (
    <div className={`resp-quick-grid ${className}`} style={style}>
      {children}
    </div>
  );
}

/** Horizontal scroll wrapper for tables */
export function TableWrap({ children, className = '', style = {} }) {
  return (
    <div className={`resp-table-wrap ${className}`} style={style}>
      {children}
    </div>
  );
}

/** Page header row — flex, wraps on mobile */
export function PageHeader({ children, className = '', style = {} }) {
  return (
    <div className={`resp-page-header ${className}`} style={style}>
      {children}
    </div>
  );
}
