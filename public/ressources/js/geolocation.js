const geoBtn = document.getElementById("geoBtn");

geoBtn.addEventListener("click", () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        alert(`Tu es ici :\nLatitude : ${latitude.toFixed(5)}\nLongitude : ${longitude.toFixed(5)}`);
      },
      (error) => {
        alert("Error when trying to get the position : " + error.message);
      }
    );
  } else {
    alert("Geolocation isn't supported by this browser.");
  }
});
