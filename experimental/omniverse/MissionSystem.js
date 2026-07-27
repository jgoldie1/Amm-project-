export class MissionSystem {
  constructor() {
    this.activeMissions = new Map();
    this.completedMissions = [];
  }

  generateMissionForWorld(slug, coords) {
    if (!slug || !coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
      throw new TypeError('A world slug and valid coordinates are required.');
    }

    const label = String(coords.label || 'the selected marker');
    const mission = {
      id: `mission-${slug}-${Date.now()}`,
      title: 'Holographic Node Synchronization',
      description: `Travel to geographic marker at ${label} and stabilize the data stream.`,
      targetCoordinates: { lat: coords.lat, lng: coords.lng },
      reward: '500 XP & Holographic Shader Module',
      status: 'active'
    };

    this.activeMissions.set(mission.id, mission);
    return mission;
  }

  completeMission(missionId) {
    if (!this.activeMissions.has(missionId)) return null;

    const mission = this.activeMissions.get(missionId);
    const completed = { ...mission, status: 'completed' };
    this.activeMissions.delete(missionId);
    this.completedMissions.push(completed);
    return completed;
  }
}
