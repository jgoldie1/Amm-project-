using UnityEngine;
using System;
using StreetVerse.Missions;
using StreetVerse.World;

namespace StreetVerse.Crisis
{
    public enum PandemicCrisisPhase
    {
        Normal,
        Watch,
        LocalEmergency,
        RemoteQuarantine,
        Recovery
    }

    public enum ChicagoVerticalLayer
    {
        RiverDeep = 1,
        PedwaySubway = 2,
        LowerService = 3,
        Street = 4,
        ElevatedSky = 5
    }

    [Serializable]
    public class PandemicLayerState
    {
        public ChicagoVerticalLayer layer = ChicagoVerticalLayer.Street;
        [Range(0f, 1f)] public float populationDensity = 1f;
        [Range(0f, 1f)] public float mobilityDemand = 1f;
        [Range(0f, 1f)] public float deliveryDemand = 0.2f;
        [Range(0f, 1f)] public float serviceAvailability = 1f;
        [Range(0f, 1f)] public float tension = 0.05f;
    }

    /// <summary>
    /// Premium crisis director layered on top of the existing Quarantine Zone.
    /// It does not replace QuarantineZoneWorldController or its mission catalog.
    /// It coordinates the five-stage OmniResilience campaign across Chicago's
    /// five-layer gameplay abstraction.
    /// </summary>
    public class PandemicCrisisDirector : MonoBehaviour
    {
        public static PandemicCrisisDirector Instance { get; private set; }

        [Header("Scenario")]
        [SerializeField] private PandemicCrisisPhase phase = PandemicCrisisPhase.Normal;
        [SerializeField] private bool historicalCovidMode = false;
        [SerializeField] private bool documentaryReferencesEnabled = true;

        [Header("Vertical City")]
        [SerializeField] private ChicagoVerticalLayer activeLayer = ChicagoVerticalLayer.Street;
        [SerializeField] private PandemicLayerState[] layers = new PandemicLayerState[5];

        public PandemicCrisisPhase Phase => phase;
        public ChicagoVerticalLayer ActiveLayer => activeLayer;
        public bool HistoricalCovidMode => historicalCovidMode;

        public event Action<PandemicCrisisPhase> OnPhaseChanged;
        public event Action<ChicagoVerticalLayer> OnLayerChanged;

        void Awake()
        {
            Instance = this;
            EnsureLayerDefaults();
            ApplyPhase(phase);
        }

        void EnsureLayerDefaults()
        {
            if (layers == null || layers.Length != 5)
                layers = new PandemicLayerState[5];

            ChicagoVerticalLayer[] ids = {
                ChicagoVerticalLayer.RiverDeep,
                ChicagoVerticalLayer.PedwaySubway,
                ChicagoVerticalLayer.LowerService,
                ChicagoVerticalLayer.Street,
                ChicagoVerticalLayer.ElevatedSky
            };

            for (int i = 0; i < ids.Length; i++)
            {
                if (layers[i] == null) layers[i] = new PandemicLayerState();
                layers[i].layer = ids[i];
            }
        }

        public void SetPhase(PandemicCrisisPhase next)
        {
            if (phase == next) return;
            phase = next;
            ApplyPhase(next);
            OnPhaseChanged?.Invoke(next);
        }

        public void SetActiveLayer(ChicagoVerticalLayer next)
        {
            if (activeLayer == next) return;
            activeLayer = next;
            OnLayerChanged?.Invoke(next);
            Debug.Log($"[StreetVerse] Pandemic active layer -> {next}");
        }

        void ApplyPhase(PandemicCrisisPhase next)
        {
            EnsureLayerDefaults();

            float streetPopulation;
            float transitDemand;
            float deliveryDemand;
            float serviceAvailability;
            float tension;

            switch (next)
            {
                case PandemicCrisisPhase.Normal:
                    streetPopulation = 1f;
                    transitDemand = 1f;
                    deliveryDemand = 0.25f;
                    serviceAvailability = 1f;
                    tension = 0.05f;
                    QuarantineZoneWorldController.Instance?.SetState(QuarantineZoneState.Green);
                    break;
                case PandemicCrisisPhase.Watch:
                    streetPopulation = 0.9f;
                    transitDemand = 0.85f;
                    deliveryDemand = 0.45f;
                    serviceAvailability = 0.9f;
                    tension = 0.3f;
                    QuarantineZoneWorldController.Instance?.SetState(QuarantineZoneState.Yellow);
                    break;
                case PandemicCrisisPhase.LocalEmergency:
                    streetPopulation = 0.55f;
                    transitDemand = 0.6f;
                    deliveryDemand = 0.78f;
                    serviceAvailability = 0.65f;
                    tension = 0.72f;
                    QuarantineZoneWorldController.Instance?.SetState(QuarantineZoneState.Red);
                    break;
                case PandemicCrisisPhase.RemoteQuarantine:
                    streetPopulation = 0.22f;
                    transitDemand = 0.28f;
                    deliveryDemand = 1f;
                    serviceAvailability = 0.48f;
                    tension = 0.92f;
                    QuarantineZoneWorldController.Instance?.SetState(QuarantineZoneState.Red);
                    break;
                default:
                    streetPopulation = 0.72f;
                    transitDemand = 0.74f;
                    deliveryDemand = 0.58f;
                    serviceAvailability = 0.84f;
                    tension = 0.36f;
                    QuarantineZoneWorldController.Instance?.SetState(QuarantineZoneState.Recovery);
                    break;
            }

            foreach (var state in layers)
            {
                state.populationDensity = streetPopulation;
                state.mobilityDemand = transitDemand;
                state.deliveryDemand = deliveryDemand;
                state.serviceAvailability = serviceAvailability;
                state.tension = tension;
            }

            // Layer-specific crisis behavior.
            foreach (var state in layers)
            {
                switch (state.layer)
                {
                    case ChicagoVerticalLayer.ElevatedSky:
                        state.mobilityDemand = transitDemand;
                        break;
                    case ChicagoVerticalLayer.Street:
                        state.populationDensity = streetPopulation;
                        break;
                    case ChicagoVerticalLayer.LowerService:
                        state.deliveryDemand = Mathf.Clamp01(deliveryDemand + 0.12f);
                        break;
                    case ChicagoVerticalLayer.PedwaySubway:
                        state.mobilityDemand = Mathf.Clamp01(transitDemand + (next == PandemicCrisisPhase.RemoteQuarantine ? -0.1f : 0.05f));
                        break;
                    case ChicagoVerticalLayer.RiverDeep:
                        state.populationDensity *= 0.6f;
                        break;
                }
            }

            Debug.Log($"[StreetVerse] OmniResilience phase={next} historicalCovid={historicalCovidMode} documentaryRefs={documentaryReferencesEnabled}");
        }

        public PandemicLayerState GetLayerState(ChicagoVerticalLayer layer)
        {
            foreach (var state in layers)
                if (state.layer == layer) return state;
            return null;
        }
    }
}
