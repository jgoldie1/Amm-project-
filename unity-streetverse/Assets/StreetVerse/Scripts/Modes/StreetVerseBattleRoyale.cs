using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace Tryamm.StreetVerse
{
    [Serializable]
    public sealed class BattleRoyaleParticipant
    {
        public string playerId;
        public string displayName;
        public Transform transform;
        public int kills;
        public float damageDealt;
        public float survivalSeconds;
        public bool isAlive = true;
        public Vector3 deathLocation;
    }

    public interface IBattleRoyaleAuthority
    {
        bool IsServerAuthoritative { get; }
        IReadOnlyList<BattleRoyaleParticipant> Participants { get; }
        void ApplyZoneDamage(BattleRoyaleParticipant participant, float damage);
        void GrantWinnerReward(BattleRoyaleParticipant participant, int moneyReward, string trophyId);
        void SpawnSupplyDrop(Vector3 position);
    }

    public sealed class StreetVerseBattleRoyale : MonoBehaviour
    {
        [Header("Match")]
        [SerializeField] private int maxPlayers = 100;
        [SerializeField] private float matchDurationSeconds = 1800f;
        [SerializeField] private float zoneShrinkDelaySeconds = 60f;
        [SerializeField] private int safeZoneCount = 5;
        [SerializeField] private float initialZoneRadius = 200f;
        [SerializeField] private float zoneRadiusMultiplier = .7f;
        [SerializeField] private float finalShrinkMetersPerSecond = 2f;
        [SerializeField] private float zoneDamagePerTick = 5f;
        [SerializeField] private float severeZoneDamagePerTick = 10f;
        [SerializeField] private float zoneDamageTickSeconds = 1f;

        [Header("World")]
        [SerializeField] private Transform[] spawnPoints;
        [SerializeField] private Transform[] supplyDropPoints;
        [SerializeField] private float randomDropHeight = 100f;

        [Header("Rewards")]
        [SerializeField] private int winnerMoneyReward = 100000;
        [SerializeField] private string winnerTrophyId = "br_trophy";

        private IBattleRoyaleAuthority authority;
        private float matchTime;
        private float zoneTimer;
        private float zoneDamageTimer;
        private int currentZoneIndex;
        private bool finalZoneRunning;
        private Vector3 currentCircleCenter;
        private float currentCircleRadius;
        private Coroutine supplyDropRoutine;

        public bool IsMatchActive { get; private set; }
        public int AliveCount => authority?.Participants?.Count(p => p != null && p.isAlive) ?? 0;
        public Vector3 CircleCenter => currentCircleCenter;
        public float CircleRadius => currentCircleRadius;

        public event Action MatchStarted;
        public event Action<BattleRoyaleParticipant> MatchEnded;
        public event Action<Vector3, float> ZoneChanged;

        public void BindAuthority(IBattleRoyaleAuthority matchAuthority) => authority = matchAuthority;

        public void StartMatch()
        {
            if (authority == null || !authority.IsServerAuthoritative || IsMatchActive) return;
            IsMatchActive = true;
            matchTime = zoneTimer = zoneDamageTimer = 0f;
            currentZoneIndex = 0;
            currentCircleRadius = initialZoneRadius;
            finalZoneRunning = false;
            PlaceParticipants();
            SetInitialSafeZone();
            if (supplyDropRoutine != null) StopCoroutine(supplyDropRoutine);
            supplyDropRoutine = StartCoroutine(SupplyDropCycle());
            MatchStarted?.Invoke();
        }

        private void Update()
        {
            if (!IsMatchActive || authority == null || !authority.IsServerAuthoritative) return;
            float dt = Time.deltaTime;
            matchTime += dt;
            zoneTimer += dt;
            zoneDamageTimer += dt;

            foreach (var p in authority.Participants.Where(p => p != null && p.isAlive)) p.survivalSeconds += dt;

            if (!finalZoneRunning && zoneTimer >= zoneShrinkDelaySeconds)
            {
                zoneTimer = 0f;
                ShrinkZone();
            }
            if (zoneDamageTimer >= zoneDamageTickSeconds)
            {
                zoneDamageTimer = 0f;
                ApplyZoneDamage();
            }
            if (AliveCount <= 1 || matchTime >= matchDurationSeconds) EndMatch();
        }

        private void PlaceParticipants()
        {
            if (spawnPoints == null || spawnPoints.Length == 0) return;
            int i = 0;
            foreach (var p in authority.Participants.Take(maxPlayers))
            {
                if (p?.transform == null) continue;
                var spawn = spawnPoints[i++ % spawnPoints.Length];
                p.transform.SetPositionAndRotation(spawn.position, spawn.rotation);
                p.kills = 0; p.damageDealt = 0; p.survivalSeconds = 0; p.isAlive = true; p.deathLocation = Vector3.zero;
            }
        }

        private void SetInitialSafeZone()
        {
            currentCircleCenter = Vector3.zero;
            if (supplyDropPoints != null && supplyDropPoints.Length > 0)
                currentCircleCenter = supplyDropPoints[UnityEngine.Random.Range(0, supplyDropPoints.Length)].position;
            ZoneChanged?.Invoke(currentCircleCenter, currentCircleRadius);
        }

        private void ShrinkZone()
        {
            currentZoneIndex++;
            currentCircleRadius = Mathf.Max(1f, currentCircleRadius * zoneRadiusMultiplier);
            Vector2 offset = UnityEngine.Random.insideUnitCircle * Mathf.Max(5f, currentCircleRadius * .25f);
            currentCircleCenter += new Vector3(offset.x, 0f, offset.y);
            ZoneChanged?.Invoke(currentCircleCenter, currentCircleRadius);
            if (currentZoneIndex >= safeZoneCount || currentCircleRadius <= 10f)
                StartCoroutine(FinalZone());
        }

        private IEnumerator FinalZone()
        {
            if (finalZoneRunning) yield break;
            finalZoneRunning = true;
            while (IsMatchActive && currentCircleRadius > 0f)
            {
                currentCircleRadius = Mathf.Max(0f, currentCircleRadius - finalShrinkMetersPerSecond * Time.deltaTime);
                ZoneChanged?.Invoke(currentCircleCenter, currentCircleRadius);
                yield return null;
            }
        }

        private void ApplyZoneDamage()
        {
            foreach (var p in authority.Participants)
            {
                if (p == null || !p.isAlive || p.transform == null) continue;
                float distance = Vector3.Distance(p.transform.position, currentCircleCenter);
                if (distance <= currentCircleRadius) continue;
                float damage = distance > currentCircleRadius * 1.2f ? severeZoneDamagePerTick : zoneDamagePerTick;
                authority.ApplyZoneDamage(p, damage);
            }
        }

        public void RegisterElimination(string killerId, string victimId, Vector3 victimPosition)
        {
            if (authority == null || !authority.IsServerAuthoritative || !IsMatchActive) return;
            var victim = authority.Participants.FirstOrDefault(p => p?.playerId == victimId);
            if (victim == null || !victim.isAlive) return;
            victim.isAlive = false;
            victim.deathLocation = victimPosition;
            var killer = authority.Participants.FirstOrDefault(p => p?.playerId == killerId);
            if (killer != null && killer != victim) killer.kills++;
            if (AliveCount <= 1) EndMatch();
        }

        private IEnumerator SupplyDropCycle()
        {
            while (IsMatchActive)
            {
                yield return new WaitForSeconds(UnityEngine.Random.Range(30f, 90f));
                if (!IsMatchActive) yield break;
                Vector3 pos;
                if (supplyDropPoints != null && supplyDropPoints.Length > 0)
                {
                    pos = supplyDropPoints[UnityEngine.Random.Range(0, supplyDropPoints.Length)].position;
                    pos.y += randomDropHeight;
                }
                else
                {
                    Vector2 offset = UnityEngine.Random.insideUnitCircle * currentCircleRadius;
                    pos = currentCircleCenter + new Vector3(offset.x, randomDropHeight, offset.y);
                }
                authority.SpawnSupplyDrop(pos);
            }
        }

        private void EndMatch()
        {
            if (!IsMatchActive) return;
            IsMatchActive = false;
            if (supplyDropRoutine != null) StopCoroutine(supplyDropRoutine);
            var winner = authority.Participants.Where(p => p != null && p.isAlive).OrderByDescending(p => p.kills).FirstOrDefault();
            if (winner == null)
                winner = authority.Participants.Where(p => p != null).OrderByDescending(p => p.kills).ThenByDescending(p => p.survivalSeconds).FirstOrDefault();
            if (winner != null) authority.GrantWinnerReward(winner, winnerMoneyReward, winnerTrophyId);
            MatchEnded?.Invoke(winner);
        }
    }
}
