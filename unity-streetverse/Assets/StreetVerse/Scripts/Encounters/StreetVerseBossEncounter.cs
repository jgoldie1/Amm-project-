using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AI;

namespace Tryamm.StreetVerse
{
    [Serializable]
    public sealed class BossEncounterDefinition
    {
        public string id;
        public string displayName;
        public float maxHealth = 1000f;
        public float baseDamage = 40f;
        public float moveSpeed = 4f;
        public int reward = 100000;
        public GameObject prefab;
        public Transform spawnPoint;
        public GameObject[] minionPrefabs;
        public int initialMinions = 5;
        public string[] phaseDialogue;
    }

    public sealed class StreetVerseBossEncounter : MonoBehaviour
    {
        public static StreetVerseBossEncounter Instance { get; private set; }
        [SerializeField] private List<BossEncounterDefinition> encounters = new();
        [SerializeField] private StreetVerseGameState gameState;
        private readonly List<GameObject> spawnedMinions = new();
        private BossAgent activeBoss;
        private BossEncounterDefinition activeDefinition;

        private void Awake() => Instance = this;

        public bool StartEncounter(string id)
        {
            if (activeBoss != null) return false;
            var definition = encounters.Find(x => x.id == id);
            if (definition == null || definition.prefab == null || definition.spawnPoint == null) return false;
            activeDefinition = definition;
            var go = Instantiate(definition.prefab, definition.spawnPoint.position, definition.spawnPoint.rotation);
            activeBoss = go.GetComponent<BossAgent>() ?? go.AddComponent<BossAgent>();
            activeBoss.Initialize(definition, this);
            StartCoroutine(SpawnMinions(definition.initialMinions));
            return true;
        }

        private IEnumerator SpawnMinions(int count)
        {
            if (activeDefinition?.minionPrefabs == null || activeDefinition.minionPrefabs.Length == 0) yield break;
            for (int i = 0; i < count; i++)
            {
                var prefab = activeDefinition.minionPrefabs[UnityEngine.Random.Range(0, activeDefinition.minionPrefabs.Length)];
                if (prefab != null)
                {
                    Vector3 p = activeDefinition.spawnPoint.position + UnityEngine.Random.insideUnitSphere * 8f;
                    p.y = activeDefinition.spawnPoint.position.y;
                    spawnedMinions.Add(Instantiate(prefab, p, Quaternion.identity));
                }
                yield return new WaitForSeconds(.25f);
            }
        }

        public void OnPhaseChanged(int phase)
        {
            if (activeDefinition == null) return;
            StartCoroutine(SpawnMinions(Mathf.Clamp(phase * 2, 0, 8)));
        }

        public void OnBossDefeated()
        {
            if (activeDefinition != null && gameState != null) gameState.AddMoney(activeDefinition.reward);
            foreach (var minion in spawnedMinions) if (minion != null) Destroy(minion);
            spawnedMinions.Clear();
            activeBoss = null;
            activeDefinition = null;
        }
    }

    [RequireComponent(typeof(NavMeshAgent))]
    public sealed class BossAgent : MonoBehaviour
    {
        private BossEncounterDefinition data;
        private StreetVerseBossEncounter owner;
        private NavMeshAgent agent;
        private Transform player;
        private float health;
        private int phase;
        private float nextAttack;

        public void Initialize(BossEncounterDefinition definition, StreetVerseBossEncounter encounter)
        {
            data = definition; owner = encounter; health = definition.maxHealth;
            agent = GetComponent<NavMeshAgent>(); agent.speed = definition.moveSpeed;
            var playerObject = GameObject.FindGameObjectWithTag("Player");
            player = playerObject != null ? playerObject.transform : null;
        }

        private void Update()
        {
            if (data == null || player == null) return;
            float d = Vector3.Distance(transform.position, player.position);
            if (d > 2.5f) agent.SetDestination(player.position);
            else if (Time.time >= nextAttack) nextAttack = Time.time + Mathf.Max(.25f, 1.5f - phase * .15f);
        }

        public void ApplyDamage(float amount)
        {
            if (data == null || amount <= 0) return;
            float oldRatio = health / data.maxHealth;
            health = Mathf.Max(0, health - amount);
            float newRatio = health / data.maxHealth;
            int newPhase = newRatio <= .25f ? 3 : newRatio <= .5f ? 2 : newRatio <= .75f ? 1 : 0;
            if (newPhase > phase) { phase = newPhase; owner?.OnPhaseChanged(phase); }
            if (health <= 0) { owner?.OnBossDefeated(); Destroy(gameObject); }
        }
    }
}
