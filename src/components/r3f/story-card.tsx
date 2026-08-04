"use client";

interface StoryCardProps {
  title: string;
  logo?: string;
  story: string;
  onClose: () => void;
}

export function StoryCard({ title, logo, story, onClose }: StoryCardProps) {
  return (
    <>
      <style>{`
        @keyframes card-enter {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .story-card {
          animation: card-enter 200ms ease-out both;
          background: rgba(10,8,20,0.85);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          padding: 12px 16px;
          min-width: 200px;
          max-width: 260px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          position: relative;
          color: white;
          user-select: none;
          pointer-events: auto;
          font-family: inherit;
          white-space: normal;
        }
        .story-card__close {
          position: absolute;
          top: 8px;
          right: 10px;
          background: none;
          border: none;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          padding: 0;
          font-family: inherit;
        }
        .story-card__close:hover { color: rgba(255,255,255,0.9); }
        .story-card__title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 6px;
          padding-right: 24px;
          letter-spacing: 0.01em;
        }
        .story-card__logo {
          height: 24px;
          display: block;
          margin-bottom: 8px;
          object-fit: contain;
        }
        .story-card__body {
          margin: 0;
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          line-height: 1.5;
        }
        @media (max-width: 767px) {
          .story-card {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-radius: 12px 12px 0 0;
            max-width: 100%;
            min-width: unset;
            padding: 20px 16px 24px;
          }
        }
      `}</style>
      <div
        className="story-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="story-card__close"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label="Close"
        >
          ×
        </button>
        {logo ? (
          <img src={logo} alt={title} className="story-card__logo" />
        ) : (
          <p className="story-card__title">{title}</p>
        )}
        <p className="story-card__body">{story}</p>
      </div>
    </>
  );
}
