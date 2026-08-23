using UnityEngine;
using System;
using StreetVerse.Missions;

namespace StreetVerse.World
{
    public class QuarantineZoneWorldController : MonoBehaviour
    {
        public static QuarantineZoneWorldController Instance { get; private set; }

        [Header("Zone State")]
        [SerializeField] private QuarantineZoneState state = QuarantineZoneState.Yellow;
        [Range(0f, 1f)] [SerializeField] private float serviceAvailability = 0.65f;
        [Range(0f, 1f)] [SerializeField] private float trafficDensity = 0.55f;
        [Range(0f, 1f)] [SerializeField] private float storeOpenRatio = 0.7f;
        [Range(0f, 1f)] [SerializeField] private float deliveryPriority = 0.8f;

        public QuarantineZoneState State => state;
        public float ServiceAvailability => serviceAvailability;
        public float TrafficDensity => trafficDensity;
        public float StoreOpenRatio => storeOpenRatio;
        public float DeliveryPriority => deliveryPriority;

        public event Action<QuarantineZoneState> OnStateChanged;

        void Awake()
        {
            Instance = this;
            ApplyState(state);
        }

        public void SetState(QuarantineZoneState next)
        {
            if (state == next) return;
            state = next;
            ApplyState(next);
            OnStateChanged?.Invoke(next);
        }

        void ApplyState(QuarantineZoneState next)
        {
            switch (next)
            {
                case QuarantineZoneState.Green:
                    serviceAvailability = 1f;
                    trafficDensity = 0.85f;
                    storeOpenRatio = 0.95f;
                    deliveryPriority = 0.35f;
                    break;
                case QuarantineZoneState.Yellow:
                    serviceAvailability = 0.75f;
                    trafficDensity = 0.6f;
                    storeOpenRatio = 0.75f;
                    deliveryPriority = 0.7f;
                    break;
                case QuarantineZoneState.Red:
                    serviceAvailability = 0.4f;
                    trafficDensity = 0.25f;
                    storeOpenRatio = 0.45f;
                    deliveryPriority = 1f;
                    break;
                case QuarantineZoneState.Recovery:
                    serviceAvailability = 0.85f;
                    trafficDensity = 0.7f;
                    storeOpenRatio = 0.85f;
                    deliveryPriority = 0.55f;
                    break;
            }

            BroadcastWorldState();
        }

        void BroadcastWorldState()
        {
            // Decoupled hook points for traffic, stores, NPC schedules, Holo Delivery,
            // mission availability, signage, audio, weather presentation and creator events.
            // Each production subsystem should subscribe to OnStateChanged rather than
            // being hard-coded into this controller.
            Debug.Log($"[StreetVerse] Quarantine Zone={state} services={serviceAvailability:P0} stores={storeOpenRatio:P0} traffic={trafficDensity:P0} deliveryPriority={deliveryPriority:P0}");
        }
    }
}
