import { UsernameSecurity } from './usernameSecurity.js';

const playBtn = document.getElementById("playBtn");
const helpBtn = document.getElementById("helpBtn");
const scoreBtn = document.getElementById("scoreBtn");
const menu = document.getElementById("main-menu");
const helpScreen = document.getElementById("help-screen");
const backFromHelp = document.getElementById("backFromHelp");
const usernameInput = document.getElementById("usernameInput");

playBtn.addEventListener("click", () => {
  const rawUsername = usernameInput.value.trim();

  if (!rawUsername) {
    alert("Please enter a username before playing.");
    return;
  }

  try {
    // Clean and validate the username
    const cleanUsername = UsernameSecurity.sanitizeAndValidate(rawUsername);

    // Inform user if the name was modified
    if (rawUsername !== cleanUsername) {
      const confirm = window.confirm(
          `Your username has been cleaned:\n` +
          `Original: "${rawUsername}"\n` +
          `Cleaned: "${cleanUsername}"\n\n` +
          `Do you want to continue with the cleaned name?`
      );

      if (!confirm) {
        usernameInput.focus();
        return;
      }

      // Update the field with the cleaned name
      usernameInput.value = cleanUsername;
    }

    // Save the cleaned username
    localStorage.setItem("username", cleanUsername);

    menu.style.display = "none";
    document.body.classList.add("game-active");

    import('./main.js').then(({ startGame }) => {
      if (typeof startGame === 'function') {
        startGame();
      }
    });

  } catch (error) {
    // Show error to user
    alert(`Username error: ${error.message}`);
    usernameInput.focus();
    usernameInput.select(); // Select text for easy correction
  }
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

document.addEventListener("DOMContentLoaded", () => {
  const savedUsername = localStorage.getItem("username");
  if (savedUsername) {
    // Clean even previously saved usernames
    const cleanUsername = UsernameSecurity.sanitizeOrFallback(savedUsername);
    usernameInput.value = cleanUsername;

    // Update localStorage if the name was cleaned
    if (savedUsername !== cleanUsername) {
      localStorage.setItem("username", cleanUsername);
    }
  }
});