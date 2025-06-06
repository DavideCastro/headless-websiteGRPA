const menu = document.getElementById("main-menu");
const switchBtn = document.getElementById("switchBtn");
const dropArea = document.getElementById("drop-area");
const dropZone = document.getElementById("drop-zone");
const backFromDrop = document.getElementById("backFromDrop");
const characterImg = document.getElementById("character");

const savedImage = localStorage.getItem("profileImage");
if (savedImage) {
  characterImg.src = savedImage;
}

switchBtn.addEventListener("click", () => {
  menu.style.display = "none";
  dropArea.style.display = "flex";
});

backFromDrop.addEventListener("click", () => {
  dropArea.style.display = "none";
  menu.style.display = "flex";
});

["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
  dropZone.addEventListener(eventName, e => {
    e.preventDefault();
    e.stopPropagation();
  });
});

dropZone.addEventListener("dragover", () => {
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  dropZone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const imageURL = event.target.result;
      characterImg.src = imageURL;
      localStorage.setItem("profileImage", imageURL);

      dropArea.style.display = "none";
      menu.style.display = "flex";
    };
    reader.readAsDataURL(file);
  } else {
    alert("Wrong format, use an Image !");
  }
});

const resetBtn = document.getElementById("resetCharacter");

resetBtn.addEventListener("click", () => {
  localStorage.removeItem("profileImage");
  const defaultImagePath = "ressources/images/maquettes/defaultpicture.png";
  characterImg.src = defaultImagePath;
  alert("Profile image reset!");
});
