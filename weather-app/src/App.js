import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [daylightMessage, setDaylightMessage] = useState("");
  const [error, setError] = useState(null);
  const [background, setBackground] = useState("bg-blue-500");

  const getWeatherData = async (lat, lon) => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateString = yesterday.toISOString().split("T")[0];

      const sunriseSunsetUrl = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${dateString}`;
      const sunriseSunsetResponse = await fetch(sunriseSunsetUrl);
      const sunriseSunsetData = await sunriseSunsetResponse.json();

      if (sunriseSunsetData.status === "OK") {
        const yesterdaySunrise = new Date(
          `${dateString}T${sunriseSunsetData.results.sunrise}Z`
        );
        const yesterdaySunset = new Date(
          `${dateString}T${sunriseSunsetData.results.sunset}Z`
        );
        const yesterdayDaylight =
          (yesterdaySunset - yesterdaySunrise) / (1000 * 60);

        const apiKey = "loadAPIKey";
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const weatherResponse = await axios.get(weatherUrl);
        const weatherData = weatherResponse.data;

        const todaySunrise = new Date(weatherData.sys.sunrise * 1000);
        const todaySunset = new Date(weatherData.sys.sunset * 1000);
        const todayDaylight = (todaySunset - todaySunrise) / (1000 * 60);

        const daylightDifference = todayDaylight - yesterdayDaylight;
        setDaylightMessage(
          daylightDifference > 0
            ? `You get extra ${Math.round(
                daylightDifference
              )} minutes of light today!`
            : daylightDifference < 0
            ? `You have ${Math.round(
                -daylightDifference
              )} minutes less light today.`
            : `You have the same amount of light as yesterday.`
        );

        setWeatherData(weatherData);

        // Change background based on weather conditions
        if (weatherData.weather[0].main.includes("Clear")) {
          setBackground("bg-yellow-400");
        } else if (weatherData.weather[0].main.includes("Cloud")) {
          setBackground("bg-gray-400");
        } else if (weatherData.weather[0].main.includes("Rain")) {
          setBackground("bg-blue-700");
        } else {
          setBackground("bg-blue-500");
        }
      } else {
        setError("Failed to fetch yesterday's sunrise and sunset data.");
      }
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
    <div
      className={`min-h-screen flex flex-col items-center justify-center ${background} text-white p-6 relative`}
    >
      {weatherData && (
        <div className="absolute top-4 right-4 text-4xl font-bold">
          {weatherData?.name}
          <p className="text-2xl">{weatherData?.main.temp}</p>
        </div>
      )}

      <button
        onClick={requestUserLocation}
        className="bg-white text-blue-500 px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition"
      >
        Get Weather Information
      </button>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {weatherData && (
        <div className="mt-6 bg-white text-gray-800 p-6 rounded-lg shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-semibold">Current Weather</h2>
          <p>
            <strong>Weather:</strong> {weatherData.weather[0].description}
          </p>
          <p>
            <strong>Sunrise:</strong>{" "}
            {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}
          </p>
          <p>
            <strong>Sunset:</strong>{" "}
            {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}
          </p>
        </div>
      )}

      {daylightMessage && (
        <div className="absolute bottom-0 w-full flex justify-center items-center bg-gradient-to-t from-black to-transparent p-6">
          <div className="w-48 h-24 border-t-4 border-yellow-400 rounded-t-full flex justify-center items-center text-lg">
            {daylightMessage}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
