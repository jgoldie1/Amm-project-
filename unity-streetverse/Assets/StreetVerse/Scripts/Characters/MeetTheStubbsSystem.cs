using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AI;

namespace Tryamm.StreetVerse.Characters
{
    public enum StubbsCrewRole
    {
        Guide,
        CyberGuardian,
        Creator,
        Merchant,
        Builder,
        Mobility,
        FaithScholar,
        WorldScout
    }

    [Serializable]
    public sealed class StubbsCrewDefinition
    {
        public string id;
        public string displayName;
        public StubbsCrewRole role;
        [TextArea] public string description;
        public GameObject prefab;
        public Transform spawnPoint;
        public string[] dialogue;
        public string[] capabilities;
        public int reputationRequired;
        public int missionReward;
    }

    public interface IStubbsCrewAuthority
    {
        bool CanSpawn(string characterId, int reputation);
        void RecordInteraction(string characterId, string interactionId);
        void GrantVerifiedReward(string characterId, int amount);
    }

    public sealed class MeetTheStubbsSystem : MonoBehaviour
    {
        public static MeetTheStubbsSystem Instance { get; private set; }

        [SerializeField] private List<StubbsCrewDefinition> crew = new List<StubbsCrewDefinition>();
        [SerializeField] private int playerReputation;

        private readonly Dictionary<string, GameObject> active = new Dictionary<string, GameObject>();
        private IStubbsCrewAuthority authority;

        public event Action<StubbsCrewDefinition> CrewMemberSpawned;
        public event Action<StubbsCrewDefinition> CrewMemberMet;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            authority = GetComponent<IStubbsCrewAuthority>();
        }

        public IReadOnlyList<StubbsCrewDefinition> Crew => crew;

        public bool Spawn(string id)
        {
            var def = crew.Find(c => c.id == id);
            if (def == null || def.prefab == null || def.spawnPoint == null) return false;
            if (active.ContainsKey(id)) return true;
            if (playerReputation < def.reputationRequired) return false;
            if (authority != null && !authority.CanSpawn(id, playerReputation)) return false;

            var obj = Instantiate(def.prefab, def.spawnPoint.position, def.spawnPoint.rotation);
            var agent = obj.GetComponent<StubbsCrewAgent>();
            if (agent == null) agent = obj.AddComponent<StubbsCrewAgent>();
            agent.Initialize(def, this);
            active[id] = obj;
            CrewMemberSpawned?.Invoke(def);
            return true;
        }

        internal void RecordMeet(StubbsCrewDefinition def)
        {
            authority?.RecordInteraction(def.id, "meet");
            CrewMemberMet?.Invoke(def);
        }

        public void CompleteCrewMission(string characterId)
        {
            var def = crew.Find(c => c.id == characterId);
            if (def == null) return;
            authority?.GrantVerifiedReward(def.id, def.missionReward);
            authority?.RecordInteraction(def.id, "mission_complete");
        }
    }

    [RequireComponent(typeof(NavMeshAgent))]
    public sealed class StubbsCrewAgent : MonoBehaviour
    {
        private StubbsCrewDefinition definition;
        private MeetTheStubbsSystem system;
        private NavMeshAgent agent;
        private Transform player;
        private float nextWander;
        private bool met;

        public StubbsCrewDefinition Definition => definition;

        public void Initialize(StubbsCrewDefinition def, MeetTheStubbsSystem owner)
        {
            definition = def;
            system = owner;
        }

        private void Start()
        {
            agent = GetComponent<NavMeshAgent>();
            var playerObj = GameObject.FindGameObjectWithTag("Player");
            player = playerObj != null ? playerObj.transform : null;
            nextWander = Time.time + UnityEngine.Random.Range(3f, 7f);
        }

        private void Update()
        {
            if (definition == null || agent == null || !agent.isOnNavMesh) return;

            if (player != null && Vector3.Distance(transform.position, player.position) <= 4f && !met)
            {
                met = true;
                system?.RecordMeet(definition);
            }

            if (Time.time >= nextWander && (!agent.hasPath || agent.remainingDistance < 1.25f))
            {
                Vector3 candidate = transform.position + UnityEngine.Random.insideUnitSphere * 8f;
                candidate.y = transform.position.y;
                if (NavMesh.SamplePosition(candidate, out var hit, 8f, NavMesh.AllAreas))
                    agent.SetDestination(hit.position);
                nextWander = Time.time + UnityEngine.Random.Range(4f, 10f);
            }
        }

        public string GetDialogue()
        {
            if (definition == null || definition.dialogue == null || definition.dialogue.Length == 0)
                return string.Empty;
            return definition.dialogue[UnityEngine.Random.Range(0, definition.dialogue.Length)];
        }
    }
}
