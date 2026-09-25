using UnityEngine;
using System.Collections.Generic;

namespace StreetVerse.Crisis
{
    [System.Serializable]
    public class DocumentaryReference
    {
        public string id;
        public string displayName;
        [TextArea] public string factualRoleSummary;
        public string sourceLabel;
        public string sourceUrl;
        public string sourceDate;
        public bool interactiveNpc = false;
        public bool syntheticQuoteAllowed = false;
    }

    /// <summary>
    /// Historical COVID mode uses sourced documentary references instead of
    /// invented dialogue or villain roles for real people.
    /// Dramatic missions should use fictional characters.
    /// </summary>
    public class CovidHistoricalArchiveCatalog : MonoBehaviour
    {
        public List<DocumentaryReference> references = new List<DocumentaryReference>();

        void Awake()
        {
            if (references.Count == 0) LoadDefaults();
        }

        void LoadDefaults()
        {
            references.Add(new DocumentaryReference
            {
                id = "anthony-fauci-niaid",
                displayName = "Anthony S. Fauci, M.D.",
                factualRoleSummary = "Served as Director of the U.S. National Institute of Allergy and Infectious Diseases from 1984 to 2022 and advised U.S. presidents on infectious-disease threats, including COVID-19.",
                sourceLabel = "NIAID / NIH",
                sourceUrl = "https://www.niaid.nih.gov/about/anthony-s-fauci-md-bio",
                sourceDate = "2025-03-21",
                interactiveNpc = false,
                syntheticQuoteAllowed = false
            });

            references.Add(new DocumentaryReference
            {
                id = "bill-gates-foundation-covid",
                displayName = "Bill Gates / Gates Foundation",
                factualRoleSummary = "The Gates Foundation reported committing more than $2 billion to the global COVID-19 response, including support for tests, treatments, vaccines, manufacturing, delivery and health-system response.",
                sourceLabel = "Gates Foundation COVID-19 response",
                sourceUrl = "https://www.gatesfoundation.org/ideas/articles/covid19-faq",
                sourceDate = "historical-response-summary",
                interactiveNpc = false,
                syntheticQuoteAllowed = false
            });
        }
    }
}
