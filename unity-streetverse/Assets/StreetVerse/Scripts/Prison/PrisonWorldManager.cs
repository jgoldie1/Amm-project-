using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Tryamm.StreetVerse.Prison
{
    public enum PrisonState { Normal, Lockdown, Riot, Escape, Investigation }

    public sealed class PrisonWorldManager : MonoBehaviour
    {
        public static PrisonWorldManager Instance { get; private set; }

        [Header("Population")]
        [SerializeField] private int prisonPopulation = 200;
        [SerializeField] private int guardCount = 50;
        [Range(0f,1f)] [SerializeField] private float securityLevel = .7f;
        [SerializeField] private float eventCheckSeconds = 60f;

        [Header("Event chances per check")]
        [Range(0f,1f)] [SerializeField] private float riotChance = .02f;
        [Range(0f,1f)] [SerializeField] private float escapeChance = .01f;
        [Range(0f,1f)] [SerializeField] private float investigationChance = .03f;

        [Header("Locations")]
        public Transform cellBlockA;
        public Transform cellBlockB;
        public Transform cafeteria;
        public Transform yard;
        public Transform infirmary;
        public Transform solitary;
        public Transform escapePoint;
        public Transform prisonExit;

        [Header("Prefabs")]
        [SerializeField] private PrisonerAgent prisonerPrefab;
        [SerializeField] private PrisonGuardAgent guardPrefab;

        public PrisonState CurrentState { get; private set; } = PrisonState.Normal;
        public bool PlayerIsInPrison { get; private set; }
        public int EscapeAttempts { get; private set; }
        public float SecurityLevel => securityLevel;

        public event Action<PrisonState> StateChanged;
        public event Action<string> Notification;

        private readonly List<PrisonGuardAgent> activeGuards = new();

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
        }

        private void OnEnable() => StartCoroutine(EventLoop());

        private IEnumerator EventLoop()
        {
            while (enabled)
            {
                yield return new WaitForSeconds(Mathf.Max(5f, eventCheckSeconds));
                TriggerRandomEvent();
            }
        }

        private void TriggerRandomEvent()
        {
            if (CurrentState != PrisonState.Normal) return;
            float roll = UnityEngine.Random.value;
            if (roll < riotChance && securityLevel < .8f) StartRiot();
            else if (roll < riotChance + escapeChance && securityLevel < .6f) StartEscapeAttempt();
            else if (roll < riotChance + escapeChance + investigationChance) StartInvestigation();
        }

        public void EnterPrison(Transform player)
        {
            PlayerIsInPrison = true;
            CurrentState = PrisonState.Normal;
            if (player != null && cellBlockA != null) player.position = cellBlockA.position;
            SpawnGuards();
            Notify("Entered prison. Follow the schedule, missions, or approved escape-game objectives.");
            RaiseState();
        }

        public void LeavePrison(Transform player)
        {
            PlayerIsInPrison = false;
            CurrentState = PrisonState.Normal;
            if (player != null && prisonExit != null) player.position = prisonExit.position;
            Notify("Prison sequence complete.");
            RaiseState();
        }

        public void StartRiot()
        {
            CurrentState = PrisonState.Riot;
            securityLevel = Mathf.Clamp01(securityLevel - .1f);
            SpawnRioters(10);
            Notify("Prison riot event active.");
            RaiseState();
        }

        public void EndRiot() { CurrentState = PrisonState.Normal; Notify("Riot event ended."); RaiseState(); }
        public void StartEscapeAttempt() { CurrentState = PrisonState.Escape; EscapeAttempts++; Notify("Escape event active."); RaiseState(); }
        public void StopEscape() { CurrentState = PrisonState.Normal; Notify("Escape event ended."); RaiseState(); }
        public void StartInvestigation() { CurrentState = PrisonState.Investigation; Notify("Investigation event active."); RaiseState(); }
        public void StartLockdown() { CurrentState = PrisonState.Lockdown; Notify("Prison lockdown active."); RaiseState(); }
        public void EndLockdown() { CurrentState = PrisonState.Normal; Notify("Lockdown ended."); RaiseState(); }
        public void AddSecurity(float amount) => securityLevel = Mathf.Clamp01(securityLevel + amount);
        public void ReduceSecurity(float amount) => securityLevel = Mathf.Clamp01(securityLevel - amount);

        private void SpawnGuards()
        {
            foreach (var guard in activeGuards) if (guard != null) Destroy(guard.gameObject);
            activeGuards.Clear();
            if (guardPrefab == null || yard == null) return;
            int count = Mathf.Clamp(guardCount, 0, 50);
            for (int i = 0; i < count; i++)
            {
                Vector3 p = yard.position + UnityEngine.Random.insideUnitSphere * 25f; p.y = yard.position.y;
                var guard = Instantiate(guardPrefab, p, Quaternion.identity);
                guard.Bind(this);
                activeGuards.Add(guard);
            }
        }

        private void SpawnRioters(int count)
        {
            if (prisonerPrefab == null || cellBlockA == null) return;
            for (int i = 0; i < count; i++)
            {
                Vector3 p = cellBlockA.position + UnityEngine.Random.insideUnitSphere * 10f; p.y = cellBlockA.position.y;
                var prisoner = Instantiate(prisonerPrefab, p, Quaternion.identity);
                prisoner.SetState(PrisonerState.Rioting);
            }
        }

        private void Notify(string message) => Notification?.Invoke(message);
        private void RaiseState() => StateChanged?.Invoke(CurrentState);
    }
}
