using UnityEngine;
using UnityEngine.Networking;
using System.Collections;

public class ApiClient : MonoBehaviour
{
    public string baseUrl = "http://192.168.1.115:8080";

    public IEnumerator GetRoute(string route)
    {
        using UnityWebRequest req = UnityWebRequest.Get(baseUrl + route);
        yield return req.SendWebRequest();

        if (req.result != UnityWebRequest.Result.Success)
            Debug.LogError("API error: " + req.error);
        else
            Debug.Log("API success: " + req.downloadHandler.text);
    }
}
