let lightningInterval = null;

function searchCity(){

  const loader = document.getElementById("loader");
  loader.style.display = "block";

  const city = document.getElementById("cityInput").value.trim();

  if(city === ""){
    alert("Enter city name");
    loader.style.display = "none";
    return;
  }

  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
    .then(res => res.json())
    .then(data => {
      if(!data.results){
        alert("City not found");
        setTimeout(()=>{
  loader.style.display = "none";
},300);
        return;
      }

      const lat = data.results[0].latitude;
      const lon = data.results[0].longitude;
      const name = data.results[0].name;

      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,pressure_msl&daily=temperature_2m_max,weathercode&timezone=auto`)
        .then(res => res.json())
        .then(weather => {

          updateUI(name, weather);
          updateWeekly(weather.daily);

          loader.classList.add("hide");

setTimeout(()=>{
  loader.style.display = "none";
  loader.classList.remove("hide");
},400);

        });
    });
}

function getWeatherText(code){
  if(code === 0) return "Sunny";
  if(code === 1 || code === 2) return "Partly Cloudy";
  if(code === 3) return "Cloudy";
  if(code >= 51 && code <= 67) return "Rainy";
  if(code >= 80) return "Heavy Rain";
  if(code >= 95) return "Thunderstorm";
  return "Weather";
}

function getWeatherIcon(condition){
  if(condition === "Sunny") return "☀️";
  if(condition === "Partly Cloudy") return "🌤️";
  if(condition === "Cloudy") return "☁️";
  if(condition === "Rainy" || condition === "Heavy Rain") return "🌧️";
  if(condition === "Thunderstorm") return "⚡";
  return "🌍";
}

function getIconFromCode(code){
  if(code === 0) return "☀️";
  if(code === 1 || code === 2) return "🌤️";
  if(code === 3) return "☁️";
  if(code >= 51 && code <= 67) return "🌧️";
  if(code >= 80) return "🌧️";
  if(code >= 95) return "⚡";
  return "🌍";
}

function updateUI(city, weather){

  const current = weather.current_weather;

  const condition = getWeatherText(current.weathercode);
  const icon = getWeatherIcon(condition);

  document.getElementById("city").innerText = city;

  // 🔥 temperature animation
  let tempEl = document.getElementById("temp");
  let start = 0;
  let end = Math.round(current.temperature);

  let interval = setInterval(()=>{
  tempEl.innerText = start + "°";
  start += Math.ceil(end / 30);

  if(start >= end){
    tempEl.innerText = end + "°";
    clearInterval(interval);
  }
},20);

  const badge = document.getElementById("condition");
  badge.innerHTML = `${icon} ${condition}`;

  document.getElementById("wind").innerText = current.windspeed + " km/h";
  const windSpeed = current.windspeed;
const bars = document.querySelectorAll("#windLines span");
let baseHeights = [2, 5, 8, 12, 16, 25, 16, 12, 8, 5, 2];
let scale = windSpeed / 5;

bars.forEach((bar, i) => {
  let height = baseHeights[i] * scale;
  if(height > 20) height = 20;
  bar.style.height = height + "px";
});

  const humidity = weather.hourly.relativehumidity_2m[0];
  const pressure = weather.hourly.pressure_msl[0];

  document.getElementById("humidity").innerText = humidity + "%";
  document.getElementById("pressure").innerText = pressure + " hPa";

  document.getElementById("humidityBar").style.width = humidity + "%";
  document.getElementById("pressureBar").style.width = (pressure / 1100 * 100) + "%";

  const bg = document.getElementById("weatherBg");
  const rain = document.getElementById("rain");
  const lightning = document.getElementById("lightning");
  const sun = document.getElementById("sun");
  const clouds = document.getElementById("clouds");
  const sunBg = document.getElementById("sunBg");

  rain.style.opacity = 0;
  sun.style.opacity = 0;
  clouds.style.opacity = 0;
  sunBg.style.opacity = 0;
  lightning.style.animation = "none";

  if(lightningInterval){
    clearInterval(lightningInterval);
    lightningInterval = null;
  }

  badge.className = "badge";

  if(condition === "Sunny"){
    badge.style.background = "linear-gradient(135deg,#fff6b7,#fddb92,#ffcc70)";
    badge.style.color = "#222";

    bg.classList.add("fade");

setTimeout(()=>{
  bg.style.backgroundImage = "url('Images/sunny.jpg')";
  bg.classList.remove("fade");
},300);
    sun.style.opacity = 0.6;
    sunBg.style.opacity = 0.4;
  }

  else if(condition === "Cloudy" || condition === "Partly Cloudy"){
    badge.style.background = "linear-gradient(135deg,#ffd6e0,#cde7ff,#ffffff)";
    badge.style.color = "#333";

    bg.classList.add("fade");

setTimeout(()=>{
  bg.style.backgroundImage = "url('Images/cloud.jpg')";
  bg.classList.remove("fade");
},300);
    clouds.style.opacity = 0.5;
  }

  else if(condition === "Rainy" || condition === "Heavy Rain"){
    badge.style.background = "linear-gradient(135deg,#0f0f0f,#1c1c1c,#d4af37)";
    badge.style.color = "#fff";

    bg.classList.add("fade");

setTimeout(()=>{
  bg.style.backgroundImage = "url('Images/rain.jpg')";
  bg.classList.remove("fade");
},300);
    rain.style.opacity = 0.6;
  }

  else if(condition === "Thunderstorm"){
    badge.classList.add("thunder");

    bg.classList.add("fade");

setTimeout(()=>{
  bg.style.backgroundImage = "url('https://i.pinimg.com/1200x/1e/5c/98/1e5c98ac87ca6f8b51432d9f47cafb81.jpg')";
  bg.classList.remove("fade");
},300);

    rain.style.opacity = 0.6;

    lightningInterval = setInterval(()=>{
      lightning.style.animation = "flash 0.3s";
      setTimeout(()=>{
        lightning.style.animation = "none";
      },300);
    }, 4000);
  }
  setTimeout(()=>{
  bg.style.transform = "scale(1.1)";
},100);

setTimeout(()=>{
  bg.style.transform = "scale(1.05)";
},6000);
}

function updateWeekly(daily){

  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  for(let i=0;i<7;i++){

    const date = new Date(daily.time[i]);
    const dayName = days[date.getDay()];
    const temp = Math.round(daily.temperature_2m_max[i]);
    const code = daily.weathercode[i];

    document.getElementById(`day${i+1}Name`).innerText = dayName;
    document.getElementById(`day${i+1}Temp`).innerText = temp + "°";
    document.getElementById(`day${i+1}Icon`).innerText = getIconFromCode(code);

    const base = 35;
    const scale = temp / 40;

    const y1 = base - (scale * (8 + i));
    const y2 = base - (scale * (12 + i*1.2));
    const y3 = base - (scale * (10 + i*0.8));
    const y4 = base - (scale * (15 + i*1.5));
    const y5 = base - (scale * (11 + i));

    const points = `0,${y1} 25,${y2} 50,${y3} 75,${y4} 100,${y5}`;

    const polyline = document.querySelector(`#day${i+1}Graph`);
    if(polyline){
      polyline.setAttribute("points", points);
    }

    const gradient = document.querySelector(`#grad${i+1}`);
    const stops = gradient.querySelectorAll("stop");

    if(code === 0){
      stops[0].setAttribute("stop-color", "#ffe066");
      stops[1].setAttribute("stop-color", "#fab005");
    }
    else if(code <= 3){
      stops[0].setAttribute("stop-color", "#dee2e6");
      stops[1].setAttribute("stop-color", "#adb5bd");
    }
    else{
      stops[0].setAttribute("stop-color", "#4dabf7");
      stops[1].setAttribute("stop-color", "#1c7ed6");
    }
  }

  const weekly = document.getElementById("weekly");

  weekly.classList.remove("animate");

  setTimeout(()=>{
    weekly.classList.add("animate");
  },100);
}

// ENTER KEY SEARCH
document.getElementById("cityInput").addEventListener("keypress",function(e){
if(e.key === "Enter"){
searchCity();
}
});
function startVoice(){

  if(!('webkitSpeechRecognition' in window)){
    alert("Voice not supported in this browser");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-IN";
  recognition.start();

  recognition.onresult = function(event){
    const text = event.results[0][0].transcript;
    document.getElementById("cityInput").value = text;
    searchCity();
  };

  recognition.onerror = function(){
    alert("Voice recognition error");
  };
}
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js");
}
let deferredPrompt;

window.addEventListener("beforeinstallprompt",(e)=>{
e.preventDefault();
deferredPrompt = e;

document.getElementById("installBtn").style.display = "inline-block";
});

document.getElementById("installBtn").addEventListener("click",async ()=>{
if(deferredPrompt){
deferredPrompt.prompt();

const choice = await deferredPrompt.userChoice;

if(choice.outcome === "accepted"){
console.log("User installed app");
}

deferredPrompt = null;
document.getElementById("installBtn").style.display = "none";
}
});
function getLocation(){

  console.log("GPS clicked");

  if(!navigator.geolocation){
    alert("Geolocation not supported");
    return;
  }

  const loader = document.getElementById("loader");
  loader.style.display = "block";

  navigator.geolocation.getCurrentPosition(
    position => {

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // WEATHER API
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,pressure_msl&daily=temperature_2m_max,weathercode&timezone=auto`)
        .then(res => res.json())
        .then(weather => {

          // REVERSE GEO (WITH TIMEOUT SAFETY)
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);

          fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}`, {
            signal: controller.signal
          })
          .then(res => res.json())
          .then(loc => {

            clearTimeout(timeout);

            let cityName = "Your Location";

            if(loc && loc.results && loc.results.length > 0){
              cityName = loc.results[0].name;
            }

            updateUI(cityName, weather);
            updateWeekly(weather.daily);

            loader.classList.add("hide");

setTimeout(()=>{
  loader.style.display = "none";
  loader.classList.remove("hide");
},400);
          })
          .catch(() => {
            // fallback if reverse fails
            updateUI("Your Location", weather);
            updateWeekly(weather.daily);

            loader.classList.add("hide");

setTimeout(()=>{
  loader.style.display = "none";
  loader.classList.remove("hide");
},400);
          });

        })
        .catch(() => {
          loader.style.display = "none";
          alert("Weather fetch failed");
        });

    },
    error => {
      loader.style.display = "none";

      if(error.code === 1){
        alert("Permission denied — allow location");
      } else if(error.code === 2){
        alert("Location unavailable (turn on GPS)");
      } else if(error.code === 3){
        alert("Location timeout");
      } else {
        alert("GPS error");
      }

      console.log(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("gpsBtn").addEventListener("click", getLocation);
});