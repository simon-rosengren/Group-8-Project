async function fetchData(url) {
  const result = await fetch(url);
  return result.json();
}
let homeBtn = document.querySelector("#homeBtn");
homeBtn.addEventListener("click", function () {
  document.location.href = "./index.html";
});
function updateLeaderboard(data) {
  for (let i = 0; i < Math.min(data.length, 10); i++) {
    const item = data[i];
    const playerContainer = document.querySelector(`#player${i}`);
    const listName = document.createElement("td");
    const listScore = document.createElement("td");
    listName.textContent = `${item.name}`;
    listScore.textContent = `${item.score}`;
    playerContainer.appendChild(listName);
    playerContainer.appendChild(listScore);
  }
}
async function refreshLeaderboard() {
  const url = "https://wp.arashbesharat.com/wp-json/leaderboard/v1/leaderboard";
  const data = await fetchData(url);
  updateLeaderboard(data);
}
// Initial load
refreshLeaderboard();
// Refresh the leaderboard every 5 seconds
// setInterval(refreshLeaderboard, 5000);
