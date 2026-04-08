function renderTimeMachine() {
  return `
    <div class="section">
      <div class="card">
        <h2>Time Machine</h2>

        <select id="worldSelect">
          <option value="earth">Earth</option>
          <option value="moon">Moon</option>
          <option value="mars">Mars</option>
          <option value="twin_earth">Twin Earth</option>
        </select>

        <select id="timelineSelect">
          <option value="past">Past</option>
          <option value="present">Present</option>
          <option value="future">Future</option>
        </select>

        <button onclick="jumpTimeMachine()">Activate Rings</button>
      </div>
    </div>

    <script>
      function jumpTimeMachine() {
        const world = document.getElementById('worldSelect').value;
        const timeline = document.getElementById('timelineSelect').value;

        alert(
          "Activating Rings:\\n" +
          "1. Coordinate Ring\\n" +
          "2. Timeline Ring\\n" +
          "3. World Ring\\n" +
          "4. Protection Shield\\n" +
          "5. Energy Core\\n\\n" +
          "Traveling to " + world + " in " + timeline
        );
      }
    </script>
  `;
}

module.exports = { renderTimeMachine };
