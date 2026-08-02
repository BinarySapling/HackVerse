import React from 'react';

/**
 * Soft page intro used across console surfaces — no boxed panel.
 */
const PageHeader = ({
  eyebrow,
  title,
  highlight,
  description,
  actions,
  meta,
  className = '',
}) => {
  return (
    <section className={`relative pt-2 pb-10 sm:pb-12 ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[min(1000px,140%)] h-[320px] opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 28% 18%, rgba(124,58,237,0.2), transparent 70%), radial-gradient(ellipse 40% 35% at 78% 8%, rgba(210,187,255,0.07), transparent 65%)',
        }}
      />

      <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
        <div className="max-w-2xl min-w-0">
          {eyebrow && (
            <p className="text-[11px] tracking-[0.32em] uppercase text-primary-soft/80 mb-4 font-medium">
              {eyebrow}
            </p>
          )}
          <h1 className="text-[2rem] sm:text-4xl lg:text-[2.75rem] font-display font-semibold leading-[1.1] tracking-tight text-secondary">
            {title}
            {highlight ? (
              <>
                {' '}
                <span className="bg-gradient-to-r from-primary-soft via-[#c4a8ff] to-primary bg-clip-text text-transparent">
                  {highlight}
                </span>
              </>
            ) : null}
          </h1>
          {description && (
            <p className="mt-4 text-[15px] text-muted leading-relaxed max-w-lg">{description}</p>
          )}
          {actions && <div className="mt-7 flex flex-wrap items-center gap-4">{actions}</div>}
        </div>
        {meta && <div className="shrink-0">{meta}</div>}
      </div>
    </section>
  );
};

export const SoftDivider = ({ className = '' }) => (
  <div
    aria-hidden
    className={`h-px w-full bg-gradient-to-r from-transparent via-primary/25 to-transparent ${className}`}
  />
);

export const SoftDividerMuted = ({ className = '' }) => (
  <div
    aria-hidden
    className={`h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent ${className}`}
  />
);

export default PageHeader;
