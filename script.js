const checkBtn = document.getElementById("checkBtn");
const statusText = document.getElementById("status");
const resultBox = document.getElementById("result");
const decisionText = document.getElementById("decision");
const detailsText = document.getElementById("details");
const shareBtn = document.getElementById("shareBtn");

let shareMessage = "";

checkBtn.addEventListener("click", () => {
  statusText.classList.remove("hidden");
  statusText.textContent = "Getting your location…";
  resultBox.classList.add("hidden");
  shareBtn.classList.add("hidden");

  if (!navigator.geolocation) {
    statusText.textContent = "Location not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      fetchWeather(
        position.coords.latitude,
        position.coords.longitude
      );
    },
    () => {
      statusText.textContent =
        "Location permission denied.";
    }
  );
});

function fetchWeather(lat, lon) {
  statusText.textContent = "Checking UK weather…";

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    `&hourly=precipitation_probability,wind_speed_10m,apparent_temperature` +
    `&forecast_days=1` +
    `&timezone=auto`;

  fetch(url)
    .then(res => res.json())
    .then(data => analyzeWeather(data))
    .catch(() => {
      statusText.textContent = "Weather fetch failed.";
    });
}

function analyzeWeather(data) {
  const rain = data.hourly.precipitation_probability[0];
  const wind = data.hourly.wind_speed_10m[0];
  const temp = data.hourly.apparent_temperature[0];

  statusText.classList.add("hidden");
  resultBox.classList.remove("hidden");

  if (rain < 20 && wind < 20 && temp > 5) {
    decisionText.textContent = "✅ Yes — safe to step out.";
    detailsText.textContent =
      "Low rain risk, manageable wind, and comfortable temperature.";
    shareMessage =
      "Today’s verdict: ✅ Safe to step out. UK weather behaving for once.";
  } 
  else if (rain < 40 && wind < 30) {
    decisionText.textContent = "⚠️ Risky — you might regret it.";
    detailsText.textContent =
      "Weather could change soon. Waiting a bit may help.";
    shareMessage =
      "Today’s verdict: ⚠️ Risky to step out. Classic UK weather.";
  } 
  else {
    decisionText.textContent = "❌ Not worth it right now.";
    detailsText.textContent =
      "High rain or strong wind expected.";
    shareMessage =
      "Today’s verdict: ❌ Not worth stepping out. Proper UK weather.";
  }

  shareBtn.classList.remove("hidden");
}

shareBtn.addEventListener("click", () => {
  if (navigator.share) {
    navigator.share({ text: shareMessage });
  } else {
    navigator.clipboard.writeText(shareMessage);
    alert("Result copied to clipboard!");
  }
});

