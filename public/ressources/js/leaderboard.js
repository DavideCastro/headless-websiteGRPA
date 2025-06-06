export function showLeaderboard() {
    const container = document.getElementById("leaderboard-container");
    const list = document.getElementById("leaderboard-list");
    const closeBtn = document.getElementById("closeLeaderboard");
  

    const scores = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  

    list.innerHTML = "";
  
    if (scores.length === 0) {
      list.innerHTML = "<li>No scores yet.</li>";
    } else {
      scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .forEach(entry => {
          const li = document.createElement("li");
          li.innerHTML = `
            <img src="${entry.image}" width="32" height="32" style="vertical-align:middle;border-radius:50%;">
            <strong> ${entry.username}</strong>: ${entry.score} pts
          `;
          list.appendChild(li);
        });
    }
  
    container.style.display = "flex";
    closeBtn.onclick = () => (container.style.display = "none");
  }
  
  export function saveScore(score) {
    const username = localStorage.getItem("username") || "Unknown";
    const image = localStorage.getItem("profileImage") || "ressources/images/maquettes/defaultpicture.png";
    const newEntry = { username, image, score };
  
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
    leaderboard.push(newEntry);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  }

document.addEventListener("DOMContentLoaded", () => {
  const resetBtn = document.getElementById("resetLeaderboard");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const confirmReset = confirm("Are you sure you want to reset the leaderboard?");
      if (confirmReset) {
        localStorage.removeItem("leaderboard");
        showLeaderboard();
      }
    });
  }
});

  