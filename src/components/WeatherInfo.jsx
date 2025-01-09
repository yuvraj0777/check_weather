import React, { useState, useEffect } from "react";

const WeatherInfo = () => {
  const [weather, setWeather] = useState(null);
  const [bg, setBg] = useState(null);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("metric");
  const [searchHistory, setSearchHistory] = useState([]);

  const apiKey = import.meta.env.VITE_API_KEY;
  const unsplashApiKey = import.meta.env.VITE_IMG_API_KEY;

  const weatherData = async (cityName) => {
    if (!cityName) {
      setError("Please enter a city name");
      return;
    }

    if (!apiKey) {
      setError("API key is missing. Please check your .env configuration.");
      return;
    }

    setLoading(true);
    setError(null);
    setWeather(null);
    setCity("");

    try {
      const imgUrl = `https://api.unsplash.com/search/photos?query=${cityName}&client_id=${unsplashApiKey}&per_page=1`;
      const response = await fetch(imgUrl);
      const data = await response.json();
      const imgData = data.results[0]?.urls.regular || null;
      setBg(imgData);
      if (imgData) {
        // document.body.style.backgroundImage = `url(${imgData})`;
      }
    } catch (err) {
      setError("Failed to load background image.");
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&APPID=${apiKey}&units=${unit}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`Error: ${response.statusText}`);

      const data = await response.json();
      setWeather(data);

      setSearchHistory((prev) => [...new Set([cityName, ...prev])]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocationWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&APPID=${apiKey}&units=${unit}`;
            const response = await fetch(url);
            const data = await response.json();
            setWeather(data);
          } catch (err) {
            setError("Failed to fetch weather for your location.");
          }
        },
        () => {
          setError("Unable to access your location.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div
      className="container"
      style={{
        backgroundImage: bg ? `url(${bg})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1>Weather App</h1>
      <div>
        <input
          type="text"
          className="city"
          placeholder="Enter a city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <div className="btn-containar">
          <button onClick={() => weatherData(city)}>
            {loading ? "Loading..." : "Check Weather"}
          </button>
          <button onClick={getCurrentLocationWeather}>
            📍Current Location
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {weather && (
        <div id="newDiv">
          <h2>City: {weather.name}</h2>
          <p>
            Temperature: {weather.main.temp}°{unit === "metric" ? "C" : "F"}
          </p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind Speed: {weather.wind.speed} m/s</p>
          <p>Description: {weather.weather[0].description}</p>
          <p>Weather: {weather.weather[0].main}</p>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="Weather Icon"
          />
        </div>
      )}

      {searchHistory.length > 0 && (
        <div className="history">
          <h3>Search History</h3>
          <ul>
            {searchHistory.map((item, index) => (
              <li key={index} onClick={() => weatherData(item)}>
                {item}
              </li>
            ))}
          </ul>
          <button onClick={() => setSearchHistory((prev) => prev.slice(0, -1))}>
            Clear history
          </button>
        </div>
      )}
    </div>
  );
};

export default WeatherInfo;
