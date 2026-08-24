using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AI;

namespace Tryamm.StreetVerse
{
    public enum CelebritySkillType { SpeedBoost, Shield, Heal, DoubleRewards, ReputationBoost }

    [Serializable]
    public sealed class CelebrityDefinition
    {
        public string id;
        public string displayName;
        public string description;
        public GameObject prefab;
        public Transform spawnPoint;
        public int requiredReputation;
        public int interactionReward;
        public CelebritySkillType skillType;
        public float skillDuration = 15f;
        public float skillCooldown = 90f;
        public string[] dialogue;
    }

    public sealed class StreetVerseCelebritySystem : MonoBehaviour
    {
        public static StreetVerseCelebritySystem Instance { get; private set; }
        [SerializeField] private List<CelebrityDefinition> celebrities = new();
        [SerializeField] private StreetVerseGameState gameState;
        [SerializeField] private int reputation;
        private float nextSpawnTime;
        private GameObject activeCelebrity;

        public int Reputation => reputation;
        private void Awake() => Instance = this;

        public bool TrySpawn(string id)
        {
            if (activeCelebrity != null || Time.time < nextSpawnTime) return false;
            var c = celebrities.Find(x => x.id == id);
            if (c == null || c.prefab == null || c.spawnPoint == null || reputation < c.requiredReputation) return false;
            activeCelebrity = Instantiate(c.prefab, c.spawnPoint.position, c.spawnPoint.rotation);
            var npc = activeCelebrity.GetComponent<StreetVerseCelebrityNpc>() ?? activeCelebrity.AddComponent<StreetVerseCelebrityNpc>();
            npc.Initialize(c, this);
            nextSpawnTime = Time.time + 300f;
            return true;
        }

        public void CompleteInteraction(CelebrityDefinition c)
        {
            reputation += 10;
            gameState?.AddMoney(c.interactionReward);
        }

        public void Despawn(GameObject npc)
        {
            if (activeCelebrity == npc) activeCelebrity = null;
            if (npc != null) Destroy(npc);
        }
    }

    [RequireComponent(typeof(NavMeshAgent))]
    public sealed class StreetVerseCelebrityNpc : MonoBehaviour
    {
        private CelebrityDefinition data;
        private StreetVerseCelebritySystem owner;
        private NavMeshAgent agent;
        private float nextMove;

        public void Initialize(CelebrityDefinition definition, StreetVerseCelebritySystem system)
        { data = definition; owner = system; agent = GetComponent<NavMeshAgent>(); }

        private void Update()
        {
            if (data == null || agent == null || Time.time < nextMove) return;
            Vector3 p = transform.position + UnityEngine.Random.insideUnitSphere * 12f;
            if (NavMesh.SamplePosition(p, out var hit, 12f, NavMesh.AllAreas)) agent.SetDestination(hit.position);
            nextMove = Time.time + UnityEngine.Random.Range(5f, 12f);
        }

        public void Interact()
        {
            if (data == null) return;
            owner?.CompleteInteraction(data);
        }
    }
}
