using System;
using System.Collections.Generic;
using UnityEngine;

namespace TryAMM.GameVerse {
  public class CourtKingsBootstrap : MonoBehaviour {
    public enum Lane { Men, Women, Mixed }
    public enum Possession { Home, Away }
    public Lane lane = Lane.Mixed;
    public Possession possession = Possession.Home;
    public int homeScore = 0, awayScore = 0, quarter = 1;
    public float gameClock = 720f, shotClock = 24f;
    public string athleteResourceId = "athlete.glb";
    public AudioSource sfxSource;
    public List<AudioClip> recoveredSfx = new List<AudioClip>();

    void Update() {
      if (gameClock > 0f) gameClock = Mathf.Max(0f, gameClock - Time.deltaTime);
      if (possession == Possession.Home || possession == Possession.Away)
        shotClock = Mathf.Max(0f, shotClock - Time.deltaTime);
      if (shotClock <= 0f) ChangePossession();
      if (gameClock <= 0f) AdvancePeriod();
    }

    public void Pass() => SpendClock(2f);
    public void Drive() { SpendClock(3f); if (UnityEngine.Random.value < .18f) ChangePossession(); }
    public void Shoot2() => ResolveShot(2, .54f);
    public void Shoot3() => ResolveShot(3, .39f);
    public void Dunk() => ResolveShot(2, .72f);
    public void Steal() { SpendClock(2f); if (UnityEngine.Random.value < .28f) ChangePossession(); }
    public void Block() { SpendClock(1f); }

    void ResolveShot(int points, float chance) {
      SpendClock(3f);
      if (UnityEngine.Random.value < chance) {
        if (possession == Possession.Home) homeScore += points; else awayScore += points;
        PlaySfx("swish");
      } else PlaySfx("rim");
      ChangePossession();
    }

    void SpendClock(float seconds) { gameClock = Mathf.Max(0f, gameClock - seconds); shotClock = Mathf.Max(0f, shotClock - seconds); }
    void ChangePossession() { possession = possession == Possession.Home ? Possession.Away : Possession.Home; shotClock = 24f; }
    void AdvancePeriod() {
      if (quarter < 4) { quarter++; gameClock = 720f; shotClock = 24f; PlaySfx("buzzer"); }
      else if (quarter == 4 && homeScore == awayScore) { quarter = 5; gameClock = 300f; shotClock = 24f; }
    }
    void PlaySfx(string id) {
      if (!sfxSource) return;
      var clip = recoveredSfx.Find(c => c && c.name.ToLowerInvariant().Contains(id));
      if (clip) sfxSource.PlayOneShot(clip);
    }
  }
}
