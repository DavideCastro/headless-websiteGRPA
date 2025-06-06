const playBtn = document.getElementById("playBtn");
const helpBtn = document.getElementById("helpBtn");
const scoreBtn = document.getElementById("scoreBtn");
const menu = document.getElementById("main-menu");
const helpScreen = document.getElementById("help-screen");
const backFromHelp = document.getElementById("backFromHelp");
const usernameInput = document.getElementById("usernameInput");

playBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (!username) {
    alert("Please enter a username before playing.");
    return;
  }

  localStorage.setItem("username", username);
  menu.style.display = "none";
  document.body.classList.add("game-active");

  import('./main.js').then(({ startGame }) => {
    if (typeof startGame === 'function') {
      startGame();
    }
  });
});

scoreBtn.addEventListener("click", () => {
  import('./leaderboard.js').then(({ showLeaderboard }) => {
    showLeaderboard();
  });
});

helpBtn.addEventListener("click", () => {
  menu.style.display = "none";
  helpScreen.style.display = "flex";
});

backFromHelp.addEventListener("click", () => {
  helpScreen.style.display = "none";
  menu.style.display = "flex";
});
