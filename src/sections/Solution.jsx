import { useEffect, useRef, useState } from 'react';
import Reveal from '../components/Reveal.jsx';
import { solutionPlans } from '../data/siteContent.js';
import { assetPath } from '../utils/assetPath.js';

const AUTO_PLAY_MS = 5000;
const MANUAL_PAUSE_MS = 10000;

function PlanCard({ plan, logicalIndex, isActive, onSelect }) {
  const cardClass = isActive ? 'is-active' : 'is-side';

  return (
    <article
      className={`solution-plan-card ${cardClass}`}
      aria-current={isActive ? 'true' : undefined}
      onClick={() => {
        if (!isActive) onSelect(logicalIndex);
      }}
    >
      <div className="plan-copy">
        <span className="plan-label">{plan.tag}</span>
        <h3>{plan.title}</h3>
        <p>{plan.shortDesc}</p>
      </div>
      <figure className="plan-visual">
        <img className="plan-scene-image" src={assetPath(plan.sceneImage)} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <div className="plan-visual-wash" />
        <div className="plan-browser-window">
          <div className="plan-window-bar" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <img src={assetPath(plan.image)} alt={plan.title} loading="lazy" decoding="async" />
        </div>
        {plan.supportImage ? (
          <div className={`plan-support-window ${plan.id === 'flow' ? 'is-phone' : ''}`} aria-hidden="true">
            <img src={assetPath(plan.supportImage)} alt="" loading="lazy" decoding="async" />
          </div>
        ) : null}
      </figure>
    </article>
  );
}

export default function Solution() {
  const [trackIndex, setTrackIndex] = useState(1);
  const [slideStep, setSlideStep] = useState(0);
  const [snapWithoutTransition, setSnapWithoutTransition] = useState(false);
  const trackRef = useRef(null);
  const tabHoveredRef = useRef(false);
  const manualPauseUntilRef = useRef(0);
  const active = (trackIndex - 1 + solutionPlans.length) % solutionPlans.length;
  const carouselItems = [
    solutionPlans[solutionPlans.length - 1],
    ...solutionPlans,
    solutionPlans[0],
  ];

  useEffect(() => {
    const updateSlideStep = () => {
      if (!trackRef.current) return;

      const firstCard = trackRef.current.querySelector('.solution-plan-card');
      if (!firstCard) return;

      const trackStyle = window.getComputedStyle(trackRef.current);
      const gap = Number.parseFloat(trackStyle.columnGap || trackStyle.gap || '0') || 0;
      setSlideStep(firstCard.getBoundingClientRect().width + gap);
    };

    updateSlideStep();
    window.addEventListener('resize', updateSlideStep);
    return () => window.removeEventListener('resize', updateSlideStep);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      if (tabHoveredRef.current || now < manualPauseUntilRef.current) return;

      setTrackIndex((current) => current + 1);
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(timer);
  }, []);

  const handleSelect = (index) => {
    manualPauseUntilRef.current = Date.now() + MANUAL_PAUSE_MS;

    if (active === solutionPlans.length - 1 && index === 0) {
      setTrackIndex(solutionPlans.length + 1);
      return;
    }

    if (active === 0 && index === solutionPlans.length - 1) {
      setTrackIndex(0);
      return;
    }

    setTrackIndex(index + 1);
  };

  const handleTabHover = (isHovered) => {
    tabHoveredRef.current = isHovered;
  };

  const handleTrackTransitionEnd = (event) => {
    if (event.target !== trackRef.current || event.propertyName !== 'transform') return;

    if (trackIndex === 0) {
      setSnapWithoutTransition(true);
      setTrackIndex(solutionPlans.length);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setSnapWithoutTransition(false));
      });
    }

    if (trackIndex === solutionPlans.length + 1) {
      setSnapWithoutTransition(true);
      setTrackIndex(1);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setSnapWithoutTransition(false));
      });
    }
  };

  return (
    <section className="solution-section" id="solution">
      <div className="site-shell">
        <Reveal className="section-head centered">
          <h2>从数字采集到文化再生</h2>
        </Reveal>
      </div>

      <Reveal className="solution-stage">
        <div className="solution-carousel" aria-live="polite">
          <div
            ref={trackRef}
            className={`solution-track ${snapWithoutTransition ? 'is-snapping' : ''}`}
            style={{ transform: `translate3d(${-trackIndex * slideStep}px, 0, 0)` }}
            onTransitionEnd={handleTrackTransitionEnd}
          >
            {carouselItems.map((plan, index) => {
              const logicalIndex = index === 0
                ? solutionPlans.length - 1
                : index === carouselItems.length - 1
                  ? 0
                  : index - 1;

              return (
                <PlanCard
                  key={`${plan.id}-${index}`}
                  plan={plan}
                  logicalIndex={logicalIndex}
                  isActive={index === trackIndex}
                  onSelect={handleSelect}
                />
              );
            })}
          </div>
        </div>
        <div
          className="solution-tabs"
          role="tablist"
          aria-label="落地方案切换"
          style={{ '--active-index': active }}
          onMouseEnter={() => handleTabHover(true)}
          onMouseLeave={() => handleTabHover(false)}
        >
          <span className="solution-tab-indicator" aria-hidden="true" />
          {solutionPlans.map((plan, index) => (
            <button
              key={plan.id}
              className={index === active ? 'is-active' : ''}
              type="button"
              role="tab"
              aria-selected={index === active}
              onClick={() => handleSelect(index)}
            >
              {plan.tag}
            </button>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
