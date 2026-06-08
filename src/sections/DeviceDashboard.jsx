import Reveal from '../components/Reveal.jsx';
import { deviceCards } from '../data/siteContent.js';
import { assetPath } from '../utils/assetPath.js';

export default function DeviceDashboard() {
  return (
    <section className="device-dashboard" aria-label="采集设备与现场证据">
      <video className="device-bg-video" src={assetPath('https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618448924966912.mp4')} autoPlay muted loop playsInline />
      <div className="site-shell device-shell">
        <Reveal className="device-heading">
          <h2>芒果数智 · 四代自研智能化采集设备</h2>
          <p>以前沿设备、标准流程与超工业级精度，构建文博数字资产采集闭环</p>
        </Reveal>

        <Reveal className="device-video-panel">
          <video id="mainVideo" src={assetPath('https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618448924966912.mp4')} autoPlay muted loop playsInline />
          <div className="device-video-caption">新一代智能采集一体机</div>
        </Reveal>

        <Reveal className="device-grid" id="devices">
          {deviceCards.map((device) => (
            <article
              key={device.id}
              className="device-card"
            >
              <div className="device-img">
                <img src={assetPath(device.image)} alt={device.title} loading="lazy" decoding="async" />
              </div>
              <div className="device-body">
                <div>
                  <h3>{device.title}</h3>
                  <p>{device.desc}</p>
                </div>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
