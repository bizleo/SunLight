import React, { useState } from "react";
import axios from "axios";

function App() {
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  const getWeatherData = async (lat, lon) => {
    try {
      console.log(lat);
      console.log(lon);
      const apiKey = process.env.API_WEATHER_KEY;
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );
      console.log(response);
      setWeatherData(response.data);
    } catch (err) {
      console.error(err);
      setError("Error fetching weather data.");
    }
  };

  const requestUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          getWeatherData(latitude, longitude);
        },
        (err) => {
          console.error(err);
          setError(
            "Failed to get user location. Please enable location services."
          );
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>React Weather App</h1>
      <button
        onClick={requestUserLocation}
        style={{ padding: "10px", cursor: "pointer" }}
      >
        Get Weather Information
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {location && (
        <div>
          <h2>Your Location is :</h2>
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>
        </div>
      )}

      {weatherData && (
        <div>
          <h2>The Weather Information</h2>
          <pre
            style={{
              background: "#f4f4f4",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            {JSON.stringify(weatherData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
