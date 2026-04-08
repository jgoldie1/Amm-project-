using UnityEngine;

public class TouchInputController : MonoBehaviour
{
    public Vector2 simulatedMove;

    public void MoveUp() => simulatedMove = Vector2.up;
    public void MoveDown() => simulatedMove = Vector2.down;
    public void MoveLeft() => simulatedMove = Vector2.left;
    public void MoveRight() => simulatedMove = Vector2.right;
    public void Stop() => simulatedMove = Vector2.zero;
}
