#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "CourtKingsGameMode.generated.h"

UENUM(BlueprintType)
enum class ELeagueLane : uint8 { Men, Women, Mixed };

UENUM(BlueprintType)
enum class EPossessionSide : uint8 { Home, Away };

UCLASS()
class AMMOMNIVERSE_API ACourtKingsGameMode : public AGameModeBase
{
    GENERATED_BODY()
public:
    ACourtKingsGameMode();
    virtual void Tick(float DeltaSeconds) override;

    UPROPERTY(EditAnywhere, BlueprintReadWrite) ELeagueLane Lane = ELeagueLane::Mixed;
    UPROPERTY(BlueprintReadOnly) EPossessionSide Possession = EPossessionSide::Home;
    UPROPERTY(BlueprintReadOnly) int32 HomeScore = 0;
    UPROPERTY(BlueprintReadOnly) int32 AwayScore = 0;
    UPROPERTY(BlueprintReadOnly) int32 Quarter = 1;
    UPROPERTY(BlueprintReadOnly) float GameClock = 720.f;
    UPROPERTY(BlueprintReadOnly) float ShotClock = 24.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString AthleteAssetId = TEXT("athlete.glb");

    UFUNCTION(BlueprintCallable) void Pass();
    UFUNCTION(BlueprintCallable) void Drive();
    UFUNCTION(BlueprintCallable) void ShootTwo();
    UFUNCTION(BlueprintCallable) void ShootThree();
    UFUNCTION(BlueprintCallable) void Dunk();
    UFUNCTION(BlueprintCallable) void Steal();
    UFUNCTION(BlueprintCallable) void Block();

private:
    void ResolveShot(int32 Points, float Chance);
    void SpendClock(float Seconds);
    void ChangePossession();
    void AdvancePeriod();
};
