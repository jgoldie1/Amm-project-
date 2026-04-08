# OmniverseHub Scene Setup

## Create Scene
Name:
- OmniverseHub

## Add GameObjects
- Main Camera
- Directional Light
- Plane -> rename to Ground
- Capsule -> rename to Player
- Cube -> FamilyPortal
- Cube -> BusinessPortal
- Cube -> EventPortal
- Cube -> ZonePortal
- Cube -> UniversityPortal

## Player Setup
Add to Player:
- PlayerController.cs
- Rigidbody

Set Player tag:
- Player

Freeze Rigidbody rotation:
- X
- Z

## Camera Setup
Add to Main Camera:
- CameraFollow.cs

Drag Player object into:
- target field

## Portal Setup
Add to each portal cube:
- Box Collider
- Check Is Trigger
- PortalTrigger.cs

Set destinationName values:
- FamilyPortal -> FamilyWorld
- BusinessPortal -> BusinessDistrict
- EventPortal -> EventArena
- ZonePortal -> ZoneControlWorld
- UniversityPortal -> UniversityWorld

## Backend Test
Create empty GameObject:
- BackendHealthCheck

Attach:
- BackendHealthCheck.cs

Set baseUrl:
- http://192.168.1.115:8080

## First test goals
1. Scene opens
2. Player moves
3. Camera follows
4. Backend check logs success
5. Portal trigger logs destination
