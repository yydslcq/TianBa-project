import { useState } from 'react';
import ReconstructionShowcase from './ReconstructionShowcase.jsx';
import '../styles/tail-partners-contact.css';

const PARTNER_LOGOS = [
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618504722751488.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618506294657024.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618507851702272.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618509391011840.png",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618510355701760.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618511022596096.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618512179265536.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618512679346176.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618514138005504.png",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618514138005505.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618515632136192.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618516042219520.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618517287927808.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618517892866048.png",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618518906929152.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618520073904128.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618520522694656.png",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618521717112832.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618522699538432.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618523228020736.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618524275638272.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618524968656896.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618525194190848.png",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618525798170624.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618526495383552.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618526889648128.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618527245205504.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618528084066304.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618528340877312.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618528756113408.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618529535295488.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618529870839808.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618530374156288.png",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618530902638592.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618531838926848.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618531837968384.png",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618532375797760.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618533335334912.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618533940273152.png",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618534249693184.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618535244701696.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618535377960960.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618536075173888.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618536830148608.png",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618536854355968.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618537530597376.png",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618538364305408.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618538365263872.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618539376091136.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618540282060801.webp",
  "https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618540282060800.webp"
];
const PARTNER_ROWS = [
  Array.from({ length: 17 }, (_, index) => index + 1),
  Array.from({ length: 17 }, (_, index) => index + 18),
  Array.from({ length: 17 }, (_, index) => index + 35),
];
const CONTACT_STATUS = '咨询通道接入中，请优先通过电话或邮箱联系我们。';

function getPartnerLogo(index) {
  return PARTNER_LOGOS[index - 1] || '';
}

function PartnerSequence({ indexes, duplicate = false }) {
  return (
    <div className="tail-partners-logo-sequence" aria-hidden={duplicate || undefined}>
      {indexes.map((index) => {
        const stem = String(index).padStart(3, '0');

        return (
          <div className="tail-partners-mark" key={index}>
            <img
              src={getPartnerLogo(index)}
              alt={duplicate ? '' : `合作伙伴标识 ${stem}`}
              loading="lazy"
              decoding="async"
            />
          </div>
        );
      })}
    </div>
  );
}

function PartnerRow({ indexes, rowIndex }) {
  return (
    <div className="tail-partners-row" style={{ '--partner-row-index': rowIndex }}>
      <div className="tail-partners-track">
        <PartnerSequence indexes={indexes} />
        <PartnerSequence indexes={indexes} duplicate />
      </div>
    </div>
  );
}

export default function TailPartnersContact() {
  const [requirement, setRequirement] = useState('');
  const [status, setStatus] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setStatus(CONTACT_STATUS);
  }

  return (
    <div className="tail-redesign">
      <section className="tail-partners" id="partners" aria-labelledby="tail-partners-title">
        <header className="tail-partners-shell tail-partners-intro">
          <h2 className="tail-partners-title" id="tail-partners-title">
            与文博伙伴，共建数字文化新场景
          </h2>
        </header>

        <div className="tail-partners-viewport" aria-label="文博合作伙伴标识墙">
          {PARTNER_ROWS.map((indexes, index) => (
            <PartnerRow indexes={indexes} rowIndex={index} key={indexes[0]} />
          ))}
        </div>
      </section>

      <ReconstructionShowcase variant="contact">
        <section className="tail-contact-shell tail-contact-layout recon-contact-layout" id="contact" aria-labelledby="tail-contact-title">
          <section className="tail-contact-panel" aria-labelledby="tail-contact-title">
            <h2 className="tail-contact-title" id="tail-contact-title">
              联系我们
            </h2>
            <form className="tail-contact-form" onSubmit={handleSubmit}>
              <div className="tail-contact-field">
                <label htmlFor="tail-contact-name">姓名</label>
                <input id="tail-contact-name" name="name" type="text" autoComplete="name" required />
              </div>

              <div className="tail-contact-field">
                <label htmlFor="tail-contact-phone">电话</label>
                <input
                  id="tail-contact-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="tail-contact-field">
                <label htmlFor="tail-contact-requirement">需求简述</label>
                <textarea
                  id="tail-contact-requirement"
                  name="requirement"
                  value={requirement}
                  maxLength={200}
                  required
                  onChange={(event) => setRequirement(event.target.value)}
                />
                <div className="tail-contact-textarea-meta" aria-hidden="true">
                  <span>{requirement.length}</span>/200
                </div>
              </div>

              <div className="tail-contact-actions">
                <button className="tail-contact-submit" type="submit">
                  提交
                </button>
                <p className="tail-contact-status" role="status" aria-live="polite">
                  {status}
                </p>
              </div>
            </form>
          </section>
        </section>
      </ReconstructionShowcase>
    </div>
  );
}
