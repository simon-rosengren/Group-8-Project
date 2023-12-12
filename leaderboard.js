async function fetchData(url) {
  const result = await fetch(url);
  return result.json();
}

let homeBtn = document.querySelector("#homeBtn");
homeBtn.addEventListener("click", function () {
  document.location.href = "./index.html";
});

function updateLeaderboard(data) {
  const leaderboardBody = document.getElementById("leaderboardBody");
  leaderboardBody.innerHTML = ""; // Clear existing rows

  for (let i = 0; i < Math.min(data.length, 10); i++) {
    const item = data[i];

    const row = document.createElement("tr");
    row.classList.add('player');
    const rankCell = document.createElement("td");
    const nameCell = document.createElement("td");
    const scoreCell = document.createElement("td");

    rankCell.textContent = i + 1;
    nameCell.textContent = item.name;
    scoreCell.textContent = item.score;

    row.appendChild(rankCell);
    row.appendChild(nameCell);
    row.appendChild(scoreCell);

    row.id = `player${i}`; // Set row id

    if (i === 0) {
      row.classList.add("medal", "gold");
    } else if (i === 1) {
      row.classList.add("medal", "silver");
    } else if (i === 2) {
      row.classList.add("medal", "bronze");
    }

    leaderboardBody.appendChild(row);
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
setInterval(refreshLeaderboard, 5000);
