using System;
using System.Collections.Generic;
using UnityEngine;
#if ENABLE_INPUT_SYSTEM
using UnityEngine.InputSystem;
#endif

namespace Tryamm.StreetVerse.Sensory
{
    [Serializable]
    public sealed class SurfaceAudioSet
    {
        public string surfaceId = "default";
        public AudioClip[] footsteps;
    }

    public sealed class StreetVerseMultisensorySystem : MonoBehaviour
    {
        [SerializeField] private AudioSource footstepSource;
        [SerializeField] private SurfaceAudioSet[] surfaces;
        [SerializeField] private LayerMask surfaceMask = ~0;
        [SerializeField] private float walkStepInterval = .5f;
        [SerializeField] private float runStepInterval = .32f;
        [SerializeField] private bool hapticsEnabled = true;
        [SerializeField] private Camera playerCamera;
        [SerializeField] private float baseFov = 80f;
        [SerializeField] private float sprintFov = 88f;

        private readonly Dictionary<string, AudioClip[]> surfaceMap = new();
        private float stepTimer;

        private void Awake()
        {
            if (footstepSource == null) footstepSource = GetComponent<AudioSource>();
            if (playerCamera == null) playerCamera = GetComponentInChildren<Camera>();
            foreach (var set in surfaces ?? Array.Empty<SurfaceAudioSet>())
                if (set != null && !string.IsNullOrWhiteSpace(set.surfaceId)) surfaceMap[set.surfaceId] = set.footsteps;
        }

        public void TickMovement(float planarSpeed, bool grounded, bool sprinting)
        {
            if (!grounded || planarSpeed < .1f) { stepTimer = 0f; return; }
            stepTimer += Time.deltaTime;
            float interval = sprinting ? runStepInterval : walkStepInterval;
            if (stepTimer >= interval) { stepTimer = 0f; PlayFootstep(); PulseHaptics(.08f, .2f); }
            if (playerCamera != null) playerCamera.fieldOfView = Mathf.Lerp(playerCamera.fieldOfView, sprinting ? sprintFov : baseFov, Time.deltaTime * 6f);
        }

        private void PlayFootstep()
        {
            if (footstepSource == null) return;
            string id = DetectSurfaceId();
            if (!surfaceMap.TryGetValue(id, out var clips) || clips == null || clips.Length == 0)
                surfaceMap.TryGetValue("default", out clips);
            if (clips == null || clips.Length == 0) return;
            var clip = clips[UnityEngine.Random.Range(0, clips.Length)];
            if (clip != null) footstepSource.PlayOneShot(clip, .35f);
        }

        private string DetectSurfaceId()
        {
            Vector3 origin = transform.position + Vector3.up * .25f;
            if (!Physics.Raycast(origin, Vector3.down, out var hit, 1.5f, surfaceMask, QueryTriggerInteraction.Ignore)) return "default";
            var marker = hit.collider.GetComponent<SurfaceAudioMarker>();
            return marker == null || string.IsNullOrWhiteSpace(marker.surfaceId) ? "default" : marker.surfaceId;
        }

        public void PulseHaptics(float duration, float intensity)
        {
            if (!hapticsEnabled) return;
#if ENABLE_INPUT_SYSTEM
            var gamepad = Gamepad.current;
            if (gamepad != null)
            {
                float value = Mathf.Clamp01(intensity);
                gamepad.SetMotorSpeeds(value, value);
                StartCoroutine(StopGamepadHaptics(Mathf.Max(.01f, duration)));
            }
#endif
#if UNITY_ANDROID || UNITY_IOS
            if (intensity >= .5f) Handheld.Vibrate();
#endif
        }

#if ENABLE_INPUT_SYSTEM
        private System.Collections.IEnumerator StopGamepadHaptics(float delay)
        {
            yield return new WaitForSeconds(delay);
            Gamepad.current?.SetMotorSpeeds(0f, 0f);
        }
#endif
    }

    public sealed class SurfaceAudioMarker : MonoBehaviour
    {
        public string surfaceId = "default";
    }
}
