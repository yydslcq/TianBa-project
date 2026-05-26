import { useState } from 'react';
import Reveal from '../components/Reveal.jsx';
import { solutionPlans } from '../data/siteContent.js';

function PlanCard({ plan, className }) {
  return (
    <article className={`solution-plan-card ${className || ''}`}>
      <div className="plan-copy">
        <span>{plan.tag}</span>
        <h3>{plan.title}</h3>
        <p>{plan.desc}</p>
        <div className="plan-tags">
          {plan.tags.map((tag) => <i key={tag}>{tag}</i>)}
        </div>
      </div>
      <figure>
        <img src={plan.image} alt={plan.title} />
      </figure>
    </article>
  );
}

export default function Solution() {
  const [active, setActive] = useState(0);
  const activePlan = solutionPlans[active];
  const prev = solutionPlans[(active - 1 + solutionPlans.length) % solutionPlans.length];
  const next = solutionPlans[(active + 1) % solutionPlans.length];

  return (
    <section className="solution-section" id="solution">
      <div className="site-shell">
        <Reveal className="section-head centered">
          <p className="section-kicker">Solution</p>
          <h2>文物数据从建设到运营的落地方案</h2>
          <p>按建设阶段组合服务、软件和云能力，不必一次采购全套。</p>
        </Reveal>

        <Reveal className="solution-stage">
          <div className="solution-card-stack" aria-live="polite">
            <PlanCard plan={prev} className="is-side" />
            <PlanCard plan={activePlan} className="is-active" />
            <PlanCard plan={next} className="is-side" />
          </div>
          <div className="solution-tabs" role="tablist" aria-label="落地方案切换">
            {solutionPlans.map((plan, index) => (
              <button
                key={plan.id}
                className={index === active ? 'is-active' : ''}
                type="button"
                role="tab"
                aria-selected={index === active}
                onClick={() => setActive(index)}
                onMouseEnter={() => setActive(index)}
              >
                <span>{plan.no}</span>
                {plan.tag}
              </button>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
