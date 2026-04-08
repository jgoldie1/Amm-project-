using UnityEngine;
using UnityEngine.Networking;
using System.Collections;

public class BackendHealthCheck : MonoBehaviour
{
    public string baseUrl = "http://192.168.1.115:8080";

    void Start()
    {
        StartCoroutine(CheckBackend());
    }

    IEnumerator CheckBackend()
    {
        using UnityWebRequest req = UnityWebRequest.Get(baseUrl + "/safe-diagnostics");
        yield return req.SendWebRequest();

        if (req.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError("Backend check failed: " + req.error);
        }
        else
        {
            Debug.Log("Backend check success.");
            Debug.Log(req.downloadHandler.text);
        }
    }
}
