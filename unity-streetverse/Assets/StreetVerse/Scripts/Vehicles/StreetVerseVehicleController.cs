using System;
using UnityEngine;

namespace Tryamm.StreetVerse
{
    [RequireComponent(typeof(Rigidbody))]
    public sealed class StreetVerseVehicleController : MonoBehaviour
    {
        [Header("Drive")]
        [SerializeField] private float motorTorque = 1500f;
        [SerializeField] private float brakeTorque = 3000f;
        [SerializeField] private float maxSpeedKph = 120f;
        [SerializeField] private float maxSteerAngle = 35f;
        [SerializeField] private WheelCollider[] frontWheels;
        [SerializeField] private WheelCollider[] rearWheels;
        [SerializeField] private Transform[] wheelMeshes;

        [Header("Sensory portals")]
        [Range(0f,1f)] [SerializeField] private float leftWindowOpen;
        [Range(0f,1f)] [SerializeField] private float rightWindowOpen;
        [SerializeField] private bool leftDoorOpen;
        [SerializeField] private bool rightDoorOpen;

        private Rigidbody body;
        public float SpeedKph => body == null ? 0f : body.linearVelocity.magnitude * 3.6f;
        public float ExteriorAudioBleed => Mathf.Clamp01(Mathf.Max(leftWindowOpen, rightWindowOpen, leftDoorOpen ? 1f : 0f, rightDoorOpen ? 1f : 0f));
        public event Action<float> ExteriorAudioBleedChanged;

        private void Awake() => body = GetComponent<Rigidbody>();

        private void FixedUpdate()
        {
            float throttle = Input.GetAxis("Vertical");
            float steer = Input.GetAxis("Horizontal");
            bool braking = Input.GetKey(KeyCode.Space);

            float speedFactor = Mathf.Lerp(1f, .35f, Mathf.Clamp01(SpeedKph / Mathf.Max(1f, maxSpeedKph)));
            float steerAngle = steer * maxSteerAngle * speedFactor;
            foreach (var wheel in frontWheels) if (wheel != null) wheel.steerAngle = steerAngle;

            float torque = SpeedKph < maxSpeedKph ? throttle * motorTorque : 0f;
            foreach (var wheel in rearWheels)
            {
                if (wheel == null) continue;
                wheel.motorTorque = torque;
                wheel.brakeTorque = braking ? brakeTorque : 0f;
            }
            foreach (var wheel in frontWheels) if (wheel != null) wheel.brakeTorque = braking ? brakeTorque : 0f;
            UpdateWheelMeshes();
        }

        private void UpdateWheelMeshes()
        {
            int frontCount = frontWheels?.Length ?? 0;
            for (int i = 0; i < (wheelMeshes?.Length ?? 0); i++)
            {
                var collider = i < frontCount ? frontWheels[i] : rearWheels[i - frontCount];
                if (collider == null || wheelMeshes[i] == null) continue;
                collider.GetWorldPose(out var position, out var rotation);
                wheelMeshes[i].SetPositionAndRotation(position, rotation);
            }
        }

        public void SetStats(float topSpeedKph, float torque, float handling)
        {
            maxSpeedKph = Mathf.Max(20f, topSpeedKph);
            motorTorque = Mathf.Max(100f, torque);
            maxSteerAngle = Mathf.Clamp(35f * handling, 10f, 50f);
        }

        public void SetWindowOpen(bool left, float amount)
        {
            if (left) leftWindowOpen = Mathf.Clamp01(amount); else rightWindowOpen = Mathf.Clamp01(amount);
            ExteriorAudioBleedChanged?.Invoke(ExteriorAudioBleed);
        }

        public void SetDoorOpen(bool left, bool open)
        {
            if (left) leftDoorOpen = open; else rightDoorOpen = open;
            ExteriorAudioBleedChanged?.Invoke(ExteriorAudioBleed);
        }
    }
}
