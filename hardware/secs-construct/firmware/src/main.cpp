#include <Arduino.h>

// SECS Construct Chamber low-voltage prototype controller.
// Designed for development boards such as ESP32-S3 using only manufacturer-rated
// low-voltage haptic driver modules. Do not use this firmware to drive exposed
// high-voltage, ultrasonic phased-array, laser, plasma, or high-force hardware.

static constexpr uint8_t ESTOP_PIN = 4;
static constexpr uint8_t STATUS_LED_PIN = LED_BUILTIN;
static constexpr uint8_t HAPTIC_PINS[] = {5, 6, 7, 8};
static constexpr size_t HAPTIC_COUNT = sizeof(HAPTIC_PINS) / sizeof(HAPTIC_PINS[0]);
static constexpr uint8_t MAX_PWM = 90; // conservative firmware-side ceiling
static constexpr uint32_t COMMAND_TIMEOUT_MS = 750;

uint32_t lastValidCommandAt = 0;
bool outputsEnabled = false;

bool estopClear() {
  // Wire the E-stop sense so LOW represents a safe/closed state.
  // Verify this polarity on the actual board before connecting actuators.
  return digitalRead(ESTOP_PIN) == LOW;
}

void disableAllOutputs() {
  outputsEnabled = false;
  for (size_t i = 0; i < HAPTIC_COUNT; ++i) {
    analogWrite(HAPTIC_PINS[i], 0);
  }
}

void applyHaptics(uint8_t requestedPwm) {
  if (!estopClear()) {
    disableAllOutputs();
    return;
  }

  const uint8_t clamped = requestedPwm > MAX_PWM ? MAX_PWM : requestedPwm;
  outputsEnabled = clamped > 0;
  for (size_t i = 0; i < HAPTIC_COUNT; ++i) {
    analogWrite(HAPTIC_PINS[i], clamped);
  }
  lastValidCommandAt = millis();
}

void processLine(String line) {
  line.trim();
  if (line == "PING") {
    Serial.println("SECS:READY");
    return;
  }
  if (line == "STOP") {
    disableAllOutputs();
    Serial.println("SECS:STOPPED");
    return;
  }
  if (line.startsWith("HAPTIC:")) {
    const int value = line.substring(7).toInt();
    if (value < 0 || value > 255 || !estopClear()) {
      disableAllOutputs();
      Serial.println("SECS:DENIED");
      return;
    }
    applyHaptics(static_cast<uint8_t>(value));
    Serial.print("SECS:HAPTIC:");
    Serial.println(value > MAX_PWM ? MAX_PWM : value);
    return;
  }
  Serial.println("SECS:INVALID");
}

void setup() {
  pinMode(ESTOP_PIN, INPUT_PULLUP);
  pinMode(STATUS_LED_PIN, OUTPUT);
  for (size_t i = 0; i < HAPTIC_COUNT; ++i) {
    pinMode(HAPTIC_PINS[i], OUTPUT);
  }
  disableAllOutputs();
  Serial.begin(115200);
  Serial.println("SECS:BOOT");
}

void loop() {
  digitalWrite(STATUS_LED_PIN, estopClear() ? HIGH : LOW);

  if (!estopClear()) {
    disableAllOutputs();
  }

  if (outputsEnabled && millis() - lastValidCommandAt > COMMAND_TIMEOUT_MS) {
    disableAllOutputs();
    Serial.println("SECS:TIMEOUT");
  }

  if (Serial.available()) {
    processLine(Serial.readStringUntil('\n'));
  }
}
