# TRYAMM Farm Robotics Foundation

This foundation connects the existing Farmer Motion Tracker to a future farm-robot fleet without allowing AI or the browser app to bypass physical safety controls.

## What it enables

- Field scouting and crop imaging rovers
- Mechanical weeding robots
- Harvest-assist robots
- Small field transport robots
- Irrigation inspection robots
- Fleet status and mission planning in TRYAMM
- Twin Earth / StreetVerse visualization of robot missions
- Farmer Motion Tracker worker-presence input for human-separation awareness
- Future ROS 2/Nav2, GNSS/RTK, UWB, SLAM, depth-camera and lidar adapters

## Safety architecture

The app may plan and request a mission, but a robot mission is blocked unless fresh telemetry proves the E-stop is clear, heartbeat is fresh, the machine is inside an approved operating zone, obstacle protection is healthy, localization confidence is acceptable, workers are outside the configured prototype separation envelope, manual takeover is available, and the speed is within the prototype limit.

Autonomous-test and autonomous-field modes additionally require validation evidence. AI may recommend a route or task but may never disable the E-stop, obstacle protection, geofence, worker-separation gate, manual takeover, or the robot safety controller.

The numeric speed/separation limits in the software foundation are conservative TRYAMM prototype defaults, not claims of ISO certification or universal legal requirements. Physical deployment requires machine-specific hazard analysis, manufacturer documentation, local regulatory review, verification, validation and field acceptance testing.

## Standards direction

Architecture is organized around the ISO 18497:2024 family:

- Part 1: machine design principles and vocabulary
- Part 2: obstacle protection systems
- Part 3: autonomous operating zones
- Part 4: verification methods and validation principles

TRYAMM does not claim certification merely because these concepts are represented in software.
