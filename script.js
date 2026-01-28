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

/* ---------------- DARK MODE ---------------- */

if (localStorage.getItem("dark") === "true") {
  document.body.classList.add("dark");
  darkToggle.textContent = "☀️";
}

darkToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("dark", isDark);
  darkToggle.textContent = isDark ? "☀️" : "🌙";
});

/* ---------------- MAIN FLOW ---------------- */

checkBtn.addEventListener("click", () => {
  statusText.classList.remove("hidden");
  statusText.textContent = "Checking conditions…";
  resultBox.classList.add("hidden");

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      fetchLocation(latitude, longitude);
      fetchWeather(latitude, longitude);
      fetchAQI(latitude, longitude);
    },
    () => {
      statusText.textContent = "Location access denied.";
    }
  );
});

/* ---------------- LOCATION ---------------- */

function fetchLocation(lat, lon) {
  fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}`)
    .then(r => r.json())
    .then(d => {
      const p = d.results?.[0];
      if (!p) {
        locationText.textContent = "Location unavailable";
        return;
      }

      const place =
        p.city ||
        p.town ||
        p.village ||
        p.name ||
        p.administrative_area ||
        "Unknown place";

      locationText.textContent = `${place}, ${p.country}`;
    })
    .catch(() => {
      locationText.textContent = "Location unavailable";
    });
}

/* ---------------- WEATHER ---------------- */

function fetchWeather(lat, lon) {
  fetch(
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    `&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m` +
    `&current_weather=true` +
    `&timezone=auto`
  )
    .then(r => r.json())
    .then(showWeather)
    .catch(() => {
      statusText.textContent = "Weather fetch failed.";
    });
}

function showWeather(data) {
  const h = data.hourly;

  const t = h.temperature_2m[0];
  const hmd = h.relative_humidity_2m[0];
  const w = h.wind_speed_10m[0];
  const r = h.precipitation_probability[0];

  tempEl.textContent = t;
  humidityEl.textContent = hmd;
  windEl.textContent = w;
  rainEl.textContent = r;

  /* ---- Local time formatting with timezone ---- */
  const localDate = new Date(data.current_weather.time);
  const formattedTime = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short"
  }).format(localDate);

  timeText.textContent = `Local time: ${formattedTime}`;

  /* ---- Decision logic ---- */
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

  /* ---- Advice ---- */
  let advice = "";
  if (r > 30) advice += "Carry an umbrella. ";
  if (t < 10 || w > 25) advice += "Carry a jacket. ";

  adviceEl.textContent = advice || "No extra preparation needed.";

  /* ---- Next 2 hours ---- */
  hourlyEl.innerHTML = "";
  for (let i = 1; i <= 2; i++) {
    hourlyEl.innerHTML +=
      `<div>In ${i} hour: ${h.temperature_2m[i]}°C, rain ${h.precipitation_probability[i]}%</div>`;
  }

  statusText.classList.add("hidden");
  resultBox.classList.remove("hidden");
}

/* ---------------- AQI (GLOBAL) ---------------- */

function fetchAQI(lat, lon) {
  fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    `&hourly=us_aqi,european_aqi`
  )
    .then(r => r.json())
    .then(d => {
      const eu = d.hourly?.european_aqi?.[0];
      const us = d.hourly?.us_aqi?.[0];
      aqiEl.textContent = eu ?? us ?? "Not available";
    })
    .catch(() => {
      aqiEl.textContent = "Not available";
    });
}
