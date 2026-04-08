using UnityEngine;

public class PortalTrigger : MonoBehaviour
{
    public string destinationName = "Hub";

    public void ActivatePortal()
    {
        Debug.Log("Portal activated: " + destinationName);
        // TODO: load destination scene
    }
}
