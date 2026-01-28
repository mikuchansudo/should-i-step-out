const checkBtn = document.getElementById("checkBtn");
const statusText = document.getElementById("status");
const resultBox = document.getElementById("result");
const decisionText = document.getElementById("decision");
const detailsText = document.getElementById("details");
const shareBtn = document.getElementById("shareBtn");

const tempEl = document.getElementById("temp");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const rainEl = document.getElementById("rain");
const aqiEl = document.getElementById("aqi");
const adviceEl = document.getElementById("advice");

const darkToggle = document.getElementById("darkToggle");

darkToggle.onclick = () => {
  document.body.classList.toggle("dark");
};

checkBtn.onclick = () => {
  statusText.classList.remove("hidden");
  statusText.textContent = "Checking conditions…";
  resultBox.classList.add("hidden");

  navigator.geolocation.getCurrentPosition(pos => {
    fetchWeather(pos.coords.latitude, pos.coords.longitude);
  });
};

function fetchWeather(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,us_aqi` +
    `&timezone=auto`;

  fetch(url)
    .then(res => res.json())
    .then(data => analyze(data));
}

function analyze(data) {
  const t = data.hourly.temperature_2m[0];
  const h = data.hourly.relative_humidity_2m[0];
  const r = data.hourly.precipitation_probability[0];
  const w = data.hourly.wind_speed_10m[0];
  const a = data.hourly.us_aqi[0];

  tempEl.textContent = t;
  humidityEl.textContent = h;
  rainEl.textContent = r;
  windEl.textContent = w;
  aqiEl.textContent = a;

  let advice = [];

  if (r > 30) advice.push("☔ Carry an umbrella");
  if (t < 10 || w > 25) advice.push("🧥 Carry a jacket");
  if (a > 100) advice.push("😷 Poor air quality");

  adviceEl.textContent = advice.join(" · ") || "👍 No extra preparation needed";

  if (r < 20 && w < 20 && t > 5) {
    decisionText.textContent = "✅ Yes- safe to step out.";
    detailsText.textContent = "Conditions are comfortable right now.";
  } else if (r < 40) {
    decisionText.textContent = "⚠️ Risky- consider waiting.";
    detailsText.textContent = "Conditions may change soon.";
  } else {
    decisionText.textContent = "❌ Not worth it right now.";
    detailsText.textContent = "High chance of discomfort.";
  }

  statusText.classList.add("hidden");
  resultBox.classList.remove("hidden");
}
