using System.IO;
using UnityEngine;

namespace Tryamm.StreetVerse
{
    public sealed class StreetVerseSaveSystem : MonoBehaviour
    {
        [SerializeField] private Transform player;
        [SerializeField] private string fileName = "streetverse-save.json";
        private string SavePath => Path.Combine(Application.persistentDataPath, fileName);

        public bool Save(float gameHour)
        {
            if (StreetVerseGameState.Instance == null || player == null) return false;
            var snapshot = StreetVerseGameState.Instance.CreateSnapshot(player.position, gameHour);
            File.WriteAllText(SavePath, JsonUtility.ToJson(snapshot, true));
            return true;
        }

        public bool Load(out float gameHour)
        {
            gameHour = 12f;
            if (!File.Exists(SavePath) || StreetVerseGameState.Instance == null || player == null) return false;
            var json = File.ReadAllText(SavePath);
            var snapshot = JsonUtility.FromJson<StreetVerseSaveSnapshot>(json);
            if (snapshot == null) return false;
            StreetVerseGameState.Instance.RestoreSnapshot(snapshot);
            player.position = snapshot.playerPosition;
            gameHour = snapshot.gameHour;
            return true;
        }

        public bool DeleteSave()
        {
            if (!File.Exists(SavePath)) return false;
            File.Delete(SavePath);
            return true;
        }
    }
}
