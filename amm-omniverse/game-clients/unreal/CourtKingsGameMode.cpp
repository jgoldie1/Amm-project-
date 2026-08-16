#include "CourtKingsGameMode.h"
#include "Math/UnrealMathUtility.h"

ACourtKingsGameMode::ACourtKingsGameMode(){ PrimaryActorTick.bCanEverTick = true; }

void ACourtKingsGameMode::Tick(float DeltaSeconds){
    Super::Tick(DeltaSeconds);
    if(GameClock > 0.f) GameClock = FMath::Max(0.f, GameClock - DeltaSeconds);
    ShotClock = FMath::Max(0.f, ShotClock - DeltaSeconds);
    if(ShotClock <= 0.f) ChangePossession();
    if(GameClock <= 0.f) AdvancePeriod();
}

void ACourtKingsGameMode::Pass(){ SpendClock(2.f); }
void ACourtKingsGameMode::Drive(){ SpendClock(3.f); if(FMath::FRand() < .18f) ChangePossession(); }
void ACourtKingsGameMode::ShootTwo(){ ResolveShot(2,.54f); }
void ACourtKingsGameMode::ShootThree(){ ResolveShot(3,.39f); }
void ACourtKingsGameMode::Dunk(){ ResolveShot(2,.72f); }
void ACourtKingsGameMode::Steal(){ SpendClock(2.f); if(FMath::FRand() < .28f) ChangePossession(); }
void ACourtKingsGameMode::Block(){ SpendClock(1.f); }

void ACourtKingsGameMode::ResolveShot(int32 Points,float Chance){
    SpendClock(3.f);
    if(FMath::FRand() < Chance){
        if(Possession == EPossessionSide::Home) HomeScore += Points; else AwayScore += Points;
    }
    ChangePossession();
}

void ACourtKingsGameMode::SpendClock(float Seconds){
    GameClock = FMath::Max(0.f, GameClock - Seconds);
    ShotClock = FMath::Max(0.f, ShotClock - Seconds);
}

void ACourtKingsGameMode::ChangePossession(){
    Possession = Possession == EPossessionSide::Home ? EPossessionSide::Away : EPossessionSide::Home;
    ShotClock = 24.f;
}

void ACourtKingsGameMode::AdvancePeriod(){
    if(Quarter < 4){ Quarter++; GameClock = 720.f; ShotClock = 24.f; }
    else if(Quarter == 4 && HomeScore == AwayScore){ Quarter = 5; GameClock = 300.f; ShotClock = 24.f; }
}
