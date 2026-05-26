import { useState } from 'react';
import Reveal from '../components/Reveal.jsx';
import { deviceCards } from '../data/siteContent.js';

export default function DeviceDashboard() {
  const [active, setActive] = useState(0);

  return (
    <section className="device-dashboard" aria-label="采集设备与现场证据">
      <video className="device-bg-video" src="/home-assets/equipment-video.mp4" autoPlay muted loop playsInline />
      <div className="site-shell device-shell">
        <Reveal className="device-heading">
          <p className="section-kicker">Live Evidence</p>
          <h2>以真实设备、现场流程与工业级精度，构建文博数字资产采集闭环</h2>
        </Reveal>

        <Reveal className="device-video-panel">
          <video id="mainVideo" src="/home-assets/equipment-video.mp4" autoPlay muted loop playsInline controls />
          <div className="device-live-chip">Live Evidence</div>
        </Reveal>

        <Reveal className="device-grid" id="devices">
          {deviceCards.map((device, index) => (
            <button
              key={device.id}
              className={`device-card ${index === active ? 'active' : ''}`}
              type="button"
              onClick={() => setActive(index)}
            >
              <div className="device-img">
                <img src={device.image} alt={device.title} />
              </div>
              <div className="device-body">
                <span className="device-id">{device.id}</span>
                <div>
                  <h3>{device.title}</h3>
                  <p>{device.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
