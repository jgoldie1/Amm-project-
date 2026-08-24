using System;
using System.Collections.Generic;
using UnityEngine;

namespace Tryamm.StreetVerse
{
    public enum StreetVerseMissionType { Delivery, Heist, Race, Collection, Escort, Discovery }

    [Serializable]
    public class StreetVerseMission
    {
        public string id;
        public string title;
        public string description;
        public StreetVerseMissionType type;
        public int reward;
        public Vector3 location;
        public float completionRadius = 10f;
        public bool secret;
        public string requiredItem;
    }

    public sealed class StreetVerseMissionManager : MonoBehaviour
    {
        public static StreetVerseMissionManager Instance { get; private set; }
        [SerializeField] private Transform player;
        [SerializeField] private List<StreetVerseMission> missions = new();
        public StreetVerseMission CurrentMission { get; private set; }
        public event Action<StreetVerseMission> MissionStarted;
        public event Action<StreetVerseMission> MissionCompleted;
        public event Action MissionChanged;

        private void Awake()
        {
            Instance = this;
            if (missions.Count == 0) SeedPrototypeMissions();
        }

        private void Update()
        {
            if (CurrentMission == null || player == null) return;
            if (Vector3.Distance(player.position, CurrentMission.location) <= CurrentMission.completionRadius)
                CompleteCurrentMission();
        }

        public bool StartMission(string missionId)
        {
            var mission = missions.Find(m => m.id == missionId);
            if (mission == null) return false;
            if (StreetVerseGameState.Instance != null && StreetVerseGameState.Instance.CompletedMissions.Contains(mission.id)) return false;
            if (!string.IsNullOrEmpty(mission.requiredItem) && StreetVerseGameState.Instance != null && !StreetVerseGameState.Instance.HasItem(mission.requiredItem)) return false;
            CurrentMission = mission;
            MissionStarted?.Invoke(mission);
            MissionChanged?.Invoke();
            return true;
        }

        public void CompleteCurrentMission()
        {
            if (CurrentMission == null) return;
            var completed = CurrentMission;
            var state = StreetVerseGameState.Instance;
            if (state != null)
            {
                state.CompleteMission(completed.id);
                state.AddMoney(completed.reward);
                if (completed.secret) state.FindSecretMission(completed.id);
            }
            CurrentMission = null;
            MissionCompleted?.Invoke(completed);
            MissionChanged?.Invoke();
        }

        public void AbandonMission()
        {
            CurrentMission = null;
            MissionChanged?.Invoke();
        }

        private void SeedPrototypeMissions()
        {
            missions.Add(new StreetVerseMission { id="first_drop", title="First Drop", description="Complete the starter delivery route.", type=StreetVerseMissionType.Delivery, reward=500, location=new Vector3(15,0,15), completionRadius=6f });
            missions.Add(new StreetVerseMission { id="midnight_discovery", title="Midnight Discovery", description="Find the hidden location after dark.", type=StreetVerseMissionType.Discovery, reward=1500, location=new Vector3(20,0,30), completionRadius=8f, secret=true });
            missions.Add(new StreetVerseMission { id="getaway_driver", title="Getaway Driver", description="Reach the destination without wrecking the vehicle.", type=StreetVerseMissionType.Race, reward=2500, location=new Vector3(-40,0,50), completionRadius=5f });
        }
    }
}
