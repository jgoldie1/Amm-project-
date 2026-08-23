using System;
using System.Collections.Generic;
using UnityEngine;

namespace Tryamm.StreetVerse
{
    [Serializable]
    public class StreetVerseItemStack
    {
        public string id;
        public string displayName;
        public int quantity;
        public float value;
    }

    public sealed class StreetVerseGameState : MonoBehaviour
    {
        public static StreetVerseGameState Instance { get; private set; }

        [SerializeField] private int money = 5000;
        [SerializeField] private int health = 100;
        [SerializeField] private int maxHealth = 100;
        [SerializeField] private List<StreetVerseItemStack> inventory = new();
        [SerializeField] private List<string> ownedVehicles = new();
        [SerializeField] private List<string> completedMissions = new();
        [SerializeField] private List<string> secretMissionsFound = new();

        public int Money => money;
        public int Health => health;
        public int MaxHealth => maxHealth;
        public IReadOnlyList<StreetVerseItemStack> Inventory => inventory;
        public IReadOnlyList<string> OwnedVehicles => ownedVehicles;
        public IReadOnlyList<string> CompletedMissions => completedMissions;
        public IReadOnlyList<string> SecretMissionsFound => secretMissionsFound;

        public event Action StateChanged;
        public event Action<int> MoneyChanged;
        public event Action<int, int> HealthChanged;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        public void AddMoney(int amount)
        {
            if (amount <= 0) return;
            money += amount;
            MoneyChanged?.Invoke(money);
            StateChanged?.Invoke();
        }

        public bool TrySpendMoney(int amount)
        {
            if (amount < 0 || money < amount) return false;
            money -= amount;
            MoneyChanged?.Invoke(money);
            StateChanged?.Invoke();
            return true;
        }

        public void ApplyDamage(int amount)
        {
            if (amount <= 0) return;
            health = Mathf.Clamp(health - amount, 0, maxHealth);
            HealthChanged?.Invoke(health, maxHealth);
            StateChanged?.Invoke();
        }

        public void RestoreHealth(int amount)
        {
            if (amount <= 0) return;
            health = Mathf.Clamp(health + amount, 0, maxHealth);
            HealthChanged?.Invoke(health, maxHealth);
            StateChanged?.Invoke();
        }

        public void AddItem(string id, string displayName, int quantity, float value = 0f)
        {
            if (string.IsNullOrWhiteSpace(id) || quantity <= 0) return;
            var existing = inventory.Find(item => item.id == id);
            if (existing != null) existing.quantity += quantity;
            else inventory.Add(new StreetVerseItemStack { id = id, displayName = displayName, quantity = quantity, value = value });
            StateChanged?.Invoke();
        }

        public bool HasItem(string id, int quantity = 1)
        {
            var existing = inventory.Find(item => item.id == id);
            return existing != null && existing.quantity >= quantity;
        }

        public void OwnVehicle(string vehicleId)
        {
            if (!ownedVehicles.Contains(vehicleId)) ownedVehicles.Add(vehicleId);
            StateChanged?.Invoke();
        }

        public bool OwnsVehicle(string vehicleId) => ownedVehicles.Contains(vehicleId);

        public void CompleteMission(string missionId)
        {
            if (!completedMissions.Contains(missionId)) completedMissions.Add(missionId);
            StateChanged?.Invoke();
        }

        public void FindSecretMission(string missionId)
        {
            if (!secretMissionsFound.Contains(missionId)) secretMissionsFound.Add(missionId);
            StateChanged?.Invoke();
        }

        public StreetVerseSaveSnapshot CreateSnapshot(Vector3 playerPosition, float gameHour)
        {
            return new StreetVerseSaveSnapshot
            {
                money = money,
                health = health,
                maxHealth = maxHealth,
                playerPosition = playerPosition,
                gameHour = gameHour,
                inventory = new List<StreetVerseItemStack>(inventory),
                ownedVehicles = new List<string>(ownedVehicles),
                completedMissions = new List<string>(completedMissions),
                secretMissionsFound = new List<string>(secretMissionsFound),
                savedAtUtc = DateTime.UtcNow.ToString("O")
            };
        }

        public void RestoreSnapshot(StreetVerseSaveSnapshot snapshot)
        {
            money = snapshot.money;
            health = Mathf.Clamp(snapshot.health, 0, snapshot.maxHealth);
            maxHealth = Mathf.Max(1, snapshot.maxHealth);
            inventory = snapshot.inventory ?? new List<StreetVerseItemStack>();
            ownedVehicles = snapshot.ownedVehicles ?? new List<string>();
            completedMissions = snapshot.completedMissions ?? new List<string>();
            secretMissionsFound = snapshot.secretMissionsFound ?? new List<string>();
            StateChanged?.Invoke();
            MoneyChanged?.Invoke(money);
            HealthChanged?.Invoke(health, maxHealth);
        }
    }

    [Serializable]
    public class StreetVerseSaveSnapshot
    {
        public int money;
        public int health;
        public int maxHealth;
        public Vector3 playerPosition;
        public float gameHour;
        public string savedAtUtc;
        public List<StreetVerseItemStack> inventory = new();
        public List<string> ownedVehicles = new();
        public List<string> completedMissions = new();
        public List<string> secretMissionsFound = new();
    }
}
