using UnityEngine;
using System.Collections.Generic;

namespace StreetVerse.Missions
{
    public enum AudienceLane
    {
        AllAges,
        Kids,
        Girls,
        Boys,
        Teens,
        AdultWomen,
        AdultMen,
        Adults,
        PlayerLeader
    }

    public enum ContentRating
    {
        Everyone,
        Family,
        Teen,
        Adult
    }

    public enum QuarantineZoneState
    {
        Green,
        Yellow,
        Red,
        Recovery
    }

    [System.Serializable]
    public class QuarantineMissionDefinition
    {
        public string id;
        public string title;
        [TextArea] public string description;
        public AudienceLane[] audiences;
        public ContentRating rating;
        public int xpReward;
        public int inGameCreditReward;
        public bool requiresAdultLane;
        public string[] objectives;
        public string[] worldTags;
    }

    public class QuarantineZoneMissionCatalog : MonoBehaviour
    {
        public static QuarantineZoneMissionCatalog Instance { get; private set; }
        public QuarantineZoneState state = QuarantineZoneState.Yellow;
        public List<QuarantineMissionDefinition> missions = new List<QuarantineMissionDefinition>();

        void Awake()
        {
            Instance = this;
            if (missions.Count == 0) LoadDefaults();
        }

        public List<QuarantineMissionDefinition> GetForAudience(AudienceLane lane)
        {
            return missions.FindAll(m =>
                System.Array.Exists(m.audiences, a => a == AudienceLane.AllAges || a == lane));
        }

        void LoadDefaults()
        {
            missions.Add(new QuarantineMissionDefinition
            {
                id = "qz_family_supply_run",
                title = "Family Supply Run",
                description = "Help neighborhood households receive groceries, water, medicine pickups, batteries and accessibility supplies through verified distribution points.",
                audiences = new[] { AudienceLane.AllAges, AudienceLane.Kids, AudienceLane.Girls, AudienceLane.Boys },
                rating = ContentRating.Family,
                xpReward = 250,
                inGameCreditReward = 50,
                objectives = new[] { "Collect sealed supply crates", "Follow safe delivery route", "Deliver to three households", "Return delivery proof" },
                worldTags = new[] { "delivery", "family", "community", "holo-delivery" }
            });

            missions.Add(new QuarantineMissionDefinition
            {
                id = "qz_animal_rescue",
                title = "Animal Rescue Route",
                description = "Find displaced pets, bring food and water, and escort animals to a safe care center.",
                audiences = new[] { AudienceLane.AllAges, AudienceLane.Kids, AudienceLane.Girls, AudienceLane.Boys, AudienceLane.Teens },
                rating = ContentRating.Family,
                xpReward = 300,
                inGameCreditReward = 60,
                objectives = new[] { "Locate animals", "Deliver food and water", "Escort animals to care center" },
                worldTags = new[] { "animals", "rescue", "care" }
            });

            missions.Add(new QuarantineMissionDefinition
            {
                id = "qz_creator_truth_check",
                title = "Creator Truth Check",
                description = "Record a community update, verify the source before posting, tag the correct location, and publish a useful StreetVerse reel without spreading rumors.",
                audiences = new[] { AudienceLane.Teens, AudienceLane.AdultWomen, AudienceLane.AdultMen, AudienceLane.Adults, AudienceLane.PlayerLeader },
                rating = ContentRating.Teen,
                xpReward = 400,
                inGameCreditReward = 80,
                objectives = new[] { "Interview an NPC", "Verify source", "Record reel", "Add location tag", "Publish verified update" },
                worldTags = new[] { "creator", "reel", "media-literacy", "community" }
            });

            missions.Add(new QuarantineMissionDefinition
            {
                id = "qz_women_business_recovery",
                title = "Women-Led Business Recovery",
                description = "Help a local woman-owned shop rebuild inventory, reopen its AI storefront and reconnect delivery while staying within safe margin rules.",
                audiences = new[] { AudienceLane.AdultWomen, AudienceLane.Adults, AudienceLane.PlayerLeader },
                rating = ContentRating.Everyone,
                xpReward = 550,
                inGameCreditReward = 120,
                objectives = new[] { "Audit inventory", "Connect verified supplier", "Set floor price", "Create Holo Coupon", "Reopen storefront" },
                worldTags = new[] { "commerce", "women-owned", "merchant", "supply-plug" }
            });

            missions.Add(new QuarantineMissionDefinition
            {
                id = "qz_youth_science_team",
                title = "Youth Science & Sensor Team",
                description = "Use fictional in-game environmental sensors to map air quality, temperature and safe routes, then build a color-coded community map.",
                audiences = new[] { AudienceLane.Kids, AudienceLane.Girls, AudienceLane.Boys, AudienceLane.Teens },
                rating = ContentRating.Family,
                xpReward = 350,
                inGameCreditReward = 70,
                objectives = new[] { "Visit sensor stations", "Collect readings", "Build safe-route map", "Share with community hub" },
                worldTags = new[] { "science", "education", "mapping", "nonviolent" }
            });

            missions.Add(new QuarantineMissionDefinition
            {
                id = "qz_accessibility_support",
                title = "Accessibility Support Network",
                description = "Deliver accessible supplies, repair route markers and help NPCs reach transportation, grocery and care locations.",
                audiences = new[] { AudienceLane.AllAges, AudienceLane.Teens, AudienceLane.Adults, AudienceLane.PlayerLeader },
                rating = ContentRating.Everyone,
                xpReward = 450,
                inGameCreditReward = 90,
                objectives = new[] { "Identify blocked route", "Repair accessibility marker", "Escort NPC", "Confirm destination reached" },
                worldTags = new[] { "accessibility", "transport", "community" }
            });

            missions.Add(new QuarantineMissionDefinition
            {
                id = "qz_food_hub",
                title = "Fresh Food Hub",
                description = "Coordinate local farms, grocers and Holo Fridge demand to keep fresh food moving through the neighborhood without wasting inventory.",
                audiences = new[] { AudienceLane.Teens, AudienceLane.Adults, AudienceLane.AdultWomen, AudienceLane.AdultMen, AudienceLane.PlayerLeader },
                rating = ContentRating.Everyone,
                xpReward = 600,
                inGameCreditReward = 130,
                objectives = new[] { "Check demand", "Match local supplier", "Build delivery route", "Deliver cold-chain order", "Update Holo Fridge" },
                worldTags = new[] { "yahavah-grocery", "holo-fridge", "local-farm", "delivery" }
            });

            missions.Add(new QuarantineMissionDefinition
            {
                id = "qz_command_center",
                title = "Community Command Center",
                description = "Coordinate stores, transportation, creators, volunteers and supply routes as a player-leader while Guardian verifies consequential actions.",
                audiences = new[] { AudienceLane.PlayerLeader, AudienceLane.Adults },
                rating = ContentRating.Teen,
                xpReward = 900,
                inGameCreditReward = 200,
                requiresAdultLane = true,
                objectives = new[] { "Review city status", "Prioritize supply route", "Assign AI crew", "Approve Holo Coupon", "Restore two neighborhood services" },
                worldTags = new[] { "leadership", "hologpt", "guardian", "ai-cafe", "city-recovery" }
            });
        }
    }
}
