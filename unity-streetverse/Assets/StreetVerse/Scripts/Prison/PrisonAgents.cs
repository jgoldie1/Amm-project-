using System.Collections;
using UnityEngine;
using UnityEngine.AI;

namespace Tryamm.StreetVerse.Prison
{
    public enum PrisonerState { Idle, Walking, Fighting, Escaping, Rioting, Eating, Sleeping }

    [RequireComponent(typeof(NavMeshAgent))]
    public sealed class PrisonerAgent : MonoBehaviour
    {
        [SerializeField] private PrisonerState currentState = PrisonerState.Idle;
        [SerializeField] private float aggression = .5f;
        [SerializeField] private float health = 100f;
        [SerializeField] private Animator animator;
        private NavMeshAgent agent;
        private Coroutine behavior;

        public PrisonerState CurrentState => currentState;
        public float Health => health;

        private void Awake()
        {
            agent = GetComponent<NavMeshAgent>();
            if (animator == null) animator = GetComponent<Animator>();
        }

        private void OnEnable() => behavior = StartCoroutine(BehaviorLoop());
        private void OnDisable() { if (behavior != null) StopCoroutine(behavior); }

        public void SetState(PrisonerState state) => currentState = state;
        public void TakeDamage(float amount) { health = Mathf.Max(0f, health - Mathf.Max(0f, amount)); if (health <= 0f) gameObject.SetActive(false); }

        private IEnumerator BehaviorLoop()
        {
            while (enabled)
            {
                switch (currentState)
                {
                    case PrisonerState.Idle: yield return Idle(); break;
                    case PrisonerState.Walking: yield return Walk(); break;
                    case PrisonerState.Eating: yield return GoTo(PrisonWorldManager.Instance?.cafeteria, 5f, PrisonerState.Walking); break;
                    case PrisonerState.Escaping: yield return GoTo(PrisonWorldManager.Instance?.escapePoint, 0f, PrisonerState.Idle); break;
                    case PrisonerState.Rioting: yield return RoamFast(); break;
                    case PrisonerState.Fighting: yield return new WaitForSeconds(1f); currentState = PrisonerState.Idle; break;
                    case PrisonerState.Sleeping: yield return new WaitForSeconds(5f); currentState = PrisonerState.Idle; break;
                }
                yield return null;
            }
        }

        private IEnumerator Idle()
        {
            SetAnim(false, false);
            yield return new WaitForSeconds(Random.Range(2f, 6f));
            currentState = PrisonerState.Walking;
        }

        private IEnumerator Walk()
        {
            SetAnim(true, false);
            if (TryRandomNavPoint(transform.position, 20f, out var point)) agent.SetDestination(point);
            float until = Time.time + Random.Range(3f, 8f);
            while (Time.time < until && agent.pathPending) yield return null;
            while (Time.time < until && agent.hasPath && agent.remainingDistance > 1.2f) yield return null;
            currentState = Random.value < aggression * .05f ? PrisonerState.Fighting : PrisonerState.Idle;
        }

        private IEnumerator RoamFast()
        {
            agent.speed = 5f;
            SetAnim(true, true);
            if (TryRandomNavPoint(transform.position, 25f, out var point)) agent.SetDestination(point);
            yield return new WaitForSeconds(3f);
            agent.speed = 2f;
            if (PrisonWorldManager.Instance == null || PrisonWorldManager.Instance.CurrentState != PrisonState.Riot)
                currentState = PrisonerState.Idle;
        }

        private IEnumerator GoTo(Transform target, float dwell, PrisonerState after)
        {
            if (target == null) { currentState = after; yield break; }
            SetAnim(true, currentState == PrisonerState.Escaping);
            agent.speed = currentState == PrisonerState.Escaping ? 6f : 2f;
            agent.SetDestination(target.position);
            while (agent.pathPending) yield return null;
            while (agent.hasPath && agent.remainingDistance > 1.5f) yield return null;
            if (dwell > 0) yield return new WaitForSeconds(dwell);
            currentState = after;
        }

        private void SetAnim(bool walking, bool running)
        {
            if (animator == null) return;
            animator.SetBool("Walking", walking);
            animator.SetBool("Running", running);
        }

        private static bool TryRandomNavPoint(Vector3 origin, float radius, out Vector3 point)
        {
            Vector3 random = origin + Random.insideUnitSphere * radius;
            if (NavMesh.SamplePosition(random, out var hit, radius, NavMesh.AllAreas)) { point = hit.position; return true; }
            point = origin; return false;
        }
    }

    [RequireComponent(typeof(NavMeshAgent))]
    public sealed class PrisonGuardAgent : MonoBehaviour
    {
        [SerializeField] private float patrolRadius = 25f;
        [SerializeField] private float detectionRange = 15f;
        [SerializeField] private float chaseRange = 25f;
        [SerializeField] private float health = 100f;
        private NavMeshAgent agent;
        private PrisonWorldManager prison;
        private Transform player;
        private bool aggressive;

        private void Awake() => agent = GetComponent<NavMeshAgent>();
        private void Start() { var p = GameObject.FindGameObjectWithTag("Player"); if (p != null) player = p.transform; PickPatrol(); }

        public void Bind(PrisonWorldManager manager) => prison = manager;
        public void SetAggressive(bool value) => aggressive = value;
        public void TakeDamage(float amount) { health = Mathf.Max(0f, health - Mathf.Max(0f, amount)); if (health <= 0f) gameObject.SetActive(false); else aggressive = true; }

        private void Update()
        {
            if (player == null) return;
            float d = Vector3.Distance(transform.position, player.position);
            bool alertState = prison != null && (prison.CurrentState == PrisonState.Riot || prison.CurrentState == PrisonState.Escape || prison.CurrentState == PrisonState.Lockdown);
            if ((aggressive || alertState) && d <= chaseRange) agent.SetDestination(player.position);
            else if (!agent.pathPending && (!agent.hasPath || agent.remainingDistance < 1.5f)) PickPatrol();
        }

        private void PickPatrol()
        {
            Vector3 random = transform.position + Random.insideUnitSphere * patrolRadius;
            if (NavMesh.SamplePosition(random, out var hit, patrolRadius, NavMesh.AllAreas)) agent.SetDestination(hit.position);
        }
    }
}
