const checkBtn = document.getElementById("checkBtn");
const statusText = document.getElementById("status");
const resultBox = document.getElementById("result");

const decisionText = document.getElementById("decision");
const detailsText = document.getElementById("details");

const tempEl = document.getElementById("temp");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const rainEl = document.getElementById("rain");
const aqiEl = document.getElementById("aqi");

const adviceEl = document.getElementById("advice");
const hourlyEl = document.getElementById("hourly");

const locationText = document.getElementById("locationText");
const timeText = document.getElementById("timeText");

const darkToggle = document.getElementById("darkToggle");

/* Dark mode persistence */
if (localStorage.getItem("dark") === "true") {
  document.body.classList.add("dark");
  darkToggle.textContent = "☀️";
}

darkToggle.onclick = () => {
  const dark = document.body.classList.toggle("dark");
  localStorage.setItem("dark", dark);
  darkToggle.textContent = dark ? "☀️" : "🌙";
};

checkBtn.onclick = () => {
  statusText.classList.remove("hidden");
  statusText.textContent = "Checking conditions…";
  resultBox.classList.add("hidden");

  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    fetchLocation(latitude, longitude);
    fetchWeather(latitude, longitude);
    fetchAQI(latitude, longitude);
  });
};

/* Location */
function fetchLocation(lat, lon) {
  fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}`)
    .then(r => r.json())
    .then(d => {
      const p = d.results?.[0];
      locationText.textContent = p ? `${p.name}, ${p.country}` : "Location unavailable";
    });
}

/* Weather */
function fetchWeather(lat, lon) {
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m&current_weather=true&timezone=auto`)
    .then(r => r.json())
    .then(showWeather);
}

function showWeather(data) {
  const h = data.hourly;

  tempEl.textContent = h.temperature_2m[0];
  humidityEl.textContent = h.relative_humidity_2m[0];
  windEl.textContent = h.wind_speed_10m[0];
  rainEl.textContent = h.precipitation_probability[0];

  timeText.textContent = `Local time: ${data.current_weather.time}`;

  hourlyEl.innerHTML = "";
  for (let i = 1; i <= 2; i++) {
    hourlyEl.innerHTML +=
      `<div>In ${i} hour: ${h.temperature_2m[i]}°C, rain ${h.precipitation_probability[i]}%</div>`;
  }

  const r = h.precipitation_probability[0];
  const w = h.wind_speed_10m[0];
  const t = h.temperature_2m[0];

  if (r < 20 && w < 20 && t > 5) {
    decisionText.textContent = "Yes, safe to step out.";
    detailsText.textContent = "Conditions are comfortable right now.";
  } else if (r < 40) {
    decisionText.textContent = "Risky, you may want to wait.";
    detailsText.textContent = "Weather could change soon.";
  } else {
    decisionText.textContent = "Not worth it right now.";
    detailsText.textContent = "High chance of discomfort.";
  }

  adviceEl.textContent =
    (r > 30 ? "Carry an umbrella. " : "") +
    (t < 10 || w > 25 ? "Carry a jacket." : "") ||
    "No extra preparation needed.";

  statusText.classList.add("hidden");
  resultBox.classList.remove("hidden");
}

/* AQI */
function fetchAQI(lat, lon) {
  fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=us_aqi,european_aqi`)
    .then(r => r.json())
    .then(d => {
      const eu = d.hourly?.european_aqi?.[0];
      const us = d.hourly?.us_aqi?.[0];
      aqiEl.textContent = eu ?? us ?? "Not available";
    });
}
