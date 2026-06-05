import { useState } from 'react';
import ReconstructionShowcase from './ReconstructionShowcase.jsx';
import { assetPath } from '../utils/assetPath.js';
import '../styles/tail-partners-contact.css';

const PNG_PARTNERS = new Set([4, 9, 14, 17, 23, 33, 36, 39, 44, 46]);
const PARTNER_ROWS = [
  Array.from({ length: 17 }, (_, index) => index + 1),
  Array.from({ length: 17 }, (_, index) => index + 18),
  Array.from({ length: 17 }, (_, index) => index + 35),
];
const CONTACT_STATUS = '咨询通道接入中，请优先通过电话或邮箱联系我们。';

function getPartnerLogo(index) {
  const stem = String(index).padStart(3, '0');
  return assetPath(`/assets/partners-transparent/partner-${stem}.${PNG_PARTNERS.has(index) ? 'png' : 'webp'}?v=logo-ink-20260605`);
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
