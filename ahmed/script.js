async function getLeaderboard() {
    let url = "https://wp.arashbesharat.com/wp-json/leaderboard/v1/leaderboard";
    const result = await fetch(url);
    const data = await result.json();
    //const listContainer = document.querySelector("#jsonList");
  
    //Get the top 10 results
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
  
getLeaderboard();  