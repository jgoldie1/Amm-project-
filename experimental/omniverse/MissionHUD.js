export class MissionHUD {
  constructor(containerId = 'hud-layer') {
    this.container = document.getElementById(containerId) || this.createContainer(containerId);
  }

  createContainer(containerId) {
    const div = document.createElement('aside');
    div.id = containerId;
    div.setAttribute('aria-label', 'Active objectives');
    div.setAttribute('aria-live', 'polite');
    div.style.cssText = 'position:fixed;top:20px;right:20px;width:min(320px,calc(100vw - 40px));font-family:sans-serif;color:#38bdf8;z-index:9999;pointer-events:none;';
    document.body.appendChild(div);
    return div;
  }

  renderActiveMissions(missionsMap) {
    this.container.replaceChildren();

    const panel = document.createElement('section');
    panel.style.cssText = 'background:rgba(15,23,42,.9);border:1px solid #334155;border-radius:8px;padding:1rem;backdrop-filter:blur(8px);';

    const heading = document.createElement('h2');
    heading.textContent = 'Active Objectives';
    heading.style.cssText = 'margin:0 0 .5rem;font-size:.9rem;text-transform:uppercase;color:#f8fafc;border-bottom:1px solid #334155;padding-bottom:4px;';
    panel.appendChild(heading);

    if (!missionsMap || missionsMap.size === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'No active synchronization tasks.';
      empty.style.cssText = 'font-size:.8rem;color:#94a3b8;margin:0;';
      panel.appendChild(empty);
    } else {
      missionsMap.forEach((mission) => {
        const item = document.createElement('article');
        item.style.cssText = 'margin-top:.75rem;border-left:2px solid #38bdf8;padding-left:8px;';

        const title = document.createElement('strong');
        title.textContent = mission.title;
        title.style.cssText = 'display:block;font-size:.85rem;color:#34d399;';

        const description = document.createElement('p');
        description.textContent = mission.description;
        description.style.cssText = 'font-size:.75rem;color:#cbd5e1;margin:2px 0;';

        const reward = document.createElement('p');
        reward.textContent = `Reward: ${mission.reward}`;
        reward.style.cssText = 'font-size:.7rem;color:#f43f5e;margin:0;';

        item.append(title, description, reward);
        panel.appendChild(item);
      });
    }

    this.container.appendChild(panel);
  }
}
