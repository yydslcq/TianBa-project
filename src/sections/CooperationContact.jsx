import { useState } from 'react';
import Reveal from '../components/Reveal.jsx';
import { cooperationSteps, partnerGroups } from '../data/siteContent.js';

export default function CooperationContact() {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    window.setTimeout(() => setSubmitted(false), 1800);
  }

  return (
    <section className="cooperation-contact" id="cooperation">
      <section className="cooperation-section">
        <div className="site-shell">
          <Reveal className="section-head centered">
            <p className="section-kicker">Cooperation</p>
            <h2>不同建设阶段，都可以从合适的环节切入</h2>
            <p>不做套餐卡，而是按馆藏基础、项目阶段和运营目标逐步扩展。</p>
          </Reveal>
          <Reveal className="cooperation-grid">
            {cooperationSteps.map((step, index) => (
              <article key={step.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="partners-section">
        <div className="site-shell">
          <Reveal className="partner-head">
            <p className="section-kicker">Partners</p>
            <h2>与博物馆、研究机构和内容伙伴共同推进数字文博生态</h2>
          </Reveal>
          <Reveal className="partner-groups" id="partners">
            {partnerGroups.map((group) => (
              <section key={group.title}>
                <h3>{group.title}</h3>
                <div>
                  {group.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </section>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="site-shell contact-panel">
          <Reveal className="contact-info">
            <p className="section-kicker">Contact</p>
            <h2>从一批重点馆藏开始，建立可持续生长的文物数据能力</h2>
            <p>可先以专题展陈、重点馆藏或单条生产流程试点切入，完成采集重建、质量验收、数据治理、资产化和应用服务的闭环验证。</p>
            <div className="contact-lines">
              <span><small>联系人</small>刘春前 / 产品经理</span>
              <a href="tel:19911531345"><small>手机</small>19911531345</a>
              <a href="mailto:liuchunqian@shuziwenbo.cn"><small>邮箱</small>liuchunqian@shuziwenbo.cn</a>
            </div>
          </Reveal>

          <Reveal as="form" className="contact-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>姓名</span>
                <input name="name" autoComplete="name" required />
              </label>
              <label className="field">
                <span>电话</span>
                <input name="phone" autoComplete="tel" required />
              </label>
              <label className="field full">
                <span>邮箱</span>
                <input name="email" type="email" autoComplete="email" />
              </label>
              <label className="field full">
                <span>留言内容</span>
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength="200" required placeholder="请简单描述机构类型、文物数量、建设阶段或想了解的合作方向。" />
              </label>
            </div>
            <div className="form-meta">
              <span><b>{message.length}</b>/200</span>
              <button className="btn dark" type="submit">{submitted ? '已记录，待接入' : '提交咨询'}</button>
            </div>
          </Reveal>
        </div>
      </section>
    </section>
  );
}
