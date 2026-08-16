extends Node

signal score_changed(home_score, away_score)
signal possession_changed(side)

enum Lane { MEN, WOMEN, MIXED }
enum Possession { HOME, AWAY }

@export var lane: Lane = Lane.MIXED
var possession: Possession = Possession.HOME
var home_score := 0
var away_score := 0
var quarter := 1
var game_clock := 720.0
var shot_clock := 24.0
var athlete_resource_id := "athlete.glb"

func _process(delta: float) -> void:
    if game_clock > 0.0:
        game_clock = max(0.0, game_clock - delta)
    shot_clock = max(0.0, shot_clock - delta)
    if shot_clock <= 0.0:
        _change_possession()
    if game_clock <= 0.0:
        _advance_period()

func pass_ball() -> void:
    _spend_clock(2.0)

func drive() -> void:
    _spend_clock(3.0)
    if randf() < 0.18:
        _change_possession()

func shoot_two() -> void:
    _resolve_shot(2, 0.54)

func shoot_three() -> void:
    _resolve_shot(3, 0.39)

func dunk() -> void:
    _resolve_shot(2, 0.72)

func steal() -> void:
    _spend_clock(2.0)
    if randf() < 0.28:
        _change_possession()

func block() -> void:
    _spend_clock(1.0)

func _resolve_shot(points: int, chance: float) -> void:
    _spend_clock(3.0)
    if randf() < chance:
        if possession == Possession.HOME:
            home_score += points
        else:
            away_score += points
        score_changed.emit(home_score, away_score)
        _play_sfx("swish")
    else:
        _play_sfx("rim")
    _change_possession()

func _spend_clock(seconds: float) -> void:
    game_clock = max(0.0, game_clock - seconds)
    shot_clock = max(0.0, shot_clock - seconds)

func _change_possession() -> void:
    possession = Possession.AWAY if possession == Possession.HOME else Possession.HOME
    shot_clock = 24.0
    possession_changed.emit(possession)

func _advance_period() -> void:
    if quarter < 4:
        quarter += 1
        game_clock = 720.0
        shot_clock = 24.0
        _play_sfx("buzzer")
    elif quarter == 4 and home_score == away_score:
        quarter = 5
        game_clock = 300.0
        shot_clock = 24.0

func _play_sfx(id: String) -> void:
    var player := get_node_or_null("RecoveredSfx/" + id)
    if player is AudioStreamPlayer:
        player.play()
