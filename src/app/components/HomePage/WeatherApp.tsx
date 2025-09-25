"use client";

import React, { useState } from "react";
import { Search, Sun, Settings, MapPin } from "lucide-react";
import {
  WeatherData,
  ForecastData,
  ForecastItem,
  DailyForecast,
} from "@/app/types";

const WeatherApp = () => {
  // ✅ Typed state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_OPENWEATHER_BASE_URL;


  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp * 1000)
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      })
      .replace(":00", ""); // Remove minutes to match the image "3 PM"
  };

  const getDayName = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      weekday: "short",
    });
  };

  const getWeatherIcon = (iconCode: string): string => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const searchWeather = async (): Promise<void> => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Fetch current weather
      const weatherResponse = await fetch(
        `${BASE_URL}/weather?q=${searchQuery}&appid=${API_KEY}&units=metric`
      );

      if (!weatherResponse.ok) {
        throw new Error("City not found");
      }

      const weatherResult: WeatherData = await weatherResponse.json();

      // Fetch forecast data
      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?q=${searchQuery}&appid=${API_KEY}&units=metric`
      );

      const forecastResult: ForecastData = await forecastResponse.json();

      setWeatherData(weatherResult);
      setForecastData(forecastResult);
      setSearchQuery("");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch weather data";
      setError(errorMessage);
      setWeatherData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e?: React.FormEvent): void => {
    if (e) e.preventDefault();
    searchWeather();
  };

  const getDailyForecast = (): DailyForecast[] => {
    if (!forecastData) return [];

    const dailyData: Record<
      string,
      { date: number; temps: number[]; icon: string; description: string }
    > = {};

    forecastData.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          date: item.dt,
          temps: [item.main.temp],
          icon: item.weather[0].icon,
          description: item.weather[0].description,
        };
      } else {
        dailyData[date].temps.push(item.main.temp);
      }
    });

    return Object.values(dailyData)
      .slice(0, 7)
      .map((day) => ({
        date: day.date,
        high: Math.round(Math.max(...day.temps)),
        low: Math.round(Math.min(...day.temps)),
        icon: day.icon,
        description: day.description,
      }));
  };

  const getHourlyForecast = (): ForecastItem[] => {
    if (!forecastData) return [];
    return forecastData.list.slice(0, 8);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2C1B4D] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading weather data...</p>
        </div>
      </div>
    );
  }

  return (
    // Using the arbitrary dark purple color sampled from the image
    <div className="min-h-screen bg-[radial-gradient(circle,#551C84_60%,#2B1B59_100%)]  text-white font-sans">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            {/* Replaced emoji with Lucide icon */}
            <Sun className="text-yellow-400 w-8 h-8 fill-yellow-400" />
            <h1 className="text-xl font-semibold">Weather Now</h1>
          </div>
          {/* Updated Units button to match the pill shape and gear icon */}
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-white/20 transition">
            <Settings size={14} />
            <span>Units ▼</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light">
            How&#39;s the sky looking today?
          </h2>
        </div>

        {/* Search Bar */}
        {/* Changed structure to separate the input and the button */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
                placeholder="Search for a place..."
                // Using the sampled dark purple color for the input background
                className="w-full px-4 py-3 pl-12 rounded-xl bg-[#362A4F] border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              />
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-colors duration-200 font-semibold"
            >
              Search
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-8 bg-red-500/80 text-white px-6 py-4 rounded-xl text-center">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!weatherData && !error && (
          <div className="text-center text-white/70 mt-16">
            <p className="text-lg">
              Search for a city to see weather information
            </p>
          </div>
        )}

        {/* Weather Data Display */}
        {weatherData && (
          <div className="">
            <div className="grid lg:grid-cols-14 gap-6 ">
              {/* LEFT COLUMN (Contains Main Card, Stats, Daily) */}
              <div className="lg:col-span-9 flex flex-col gap-6">
                {/* Main Weather Card */}
                {/* Updated gradient and repositioned elements */}
                <div className="bg-gradient-to-br from-[#4953EB] to-[#8837EA] rounded-3xl p-6 text-white relative min-h-[220px] flex flex-col justify-between">
                  {/* Top Row */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">
                        {weatherData.name}, {weatherData.sys.country}
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {formatDate(weatherData.dt)}
                      </p>
                    </div>
                    {/* Pin Icon */}
                    <MapPin className="text-red-500 fill-red-500" size={20} />
                  </div>

                  {/* Bottom Row */}
                  <div className="flex justify-between items-end mt-4">
                    {/* Weather Icon - Bottom Left */}
                    <img
                      src={getWeatherIcon(weatherData.weather[0].icon)}
                      alt={weatherData.weather[0].description}
                      className="w-12 h-12"
                    />
                    {/* Temperature - Bottom Right */}
                    <div className="text-7xl font-light leading-none">
                      {Math.round(weatherData.main.temp)}°
                    </div>
                  </div>
                </div>

                {/* Weather Stats Grid */}
                {/* MOVED OUT of the main card and styled as individual cards */}
                <div className="grid grid-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#362A4F] rounded-xl p-5">
                    <p className="text-gray-400 text-xs mb-1">Feels Like</p>
                    <p className="text-2xl font-medium">
                      {Math.round(weatherData.main.feels_like)}°
                    </p>
                  </div>
                  <div className="bg-[#362A4F] rounded-xl p-5">
                    <p className="text-gray-400 text-xs mb-1">Humidity</p>
                    <p className="text-2xl font-medium">
                      {weatherData.main.humidity}%
                    </p>
                  </div>
                  <div className="bg-[#362A4F] rounded-xl p-5">
                    <p className="text-gray-400 text-xs mb-1">Wind</p>
                    {/* Slightly smaller font for Wind/Precipitation per image */}
                    <p className="text-xl font-medium leading-8">
                      {Math.round(weatherData.wind.speed)} km/h
                    </p>
                  </div>
                  <div className="bg-[#362A4F] rounded-xl p-5">
                    <p className="text-gray-400 text-xs mb-1">Precipitation</p>
                    <p className="text-xl font-medium leading-8">0 mm</p>
                  </div>
                </div>

                {/* Daily Forecast */}
                <div className="">
                  <h4 className="text-white font-semibold mb-4">
                    Daily forecast
                  </h4>
                  <div className="flex gap-3 w-full">
                    {getDailyForecast().map((day, index) => (
                      <div
                        key={index}
                        className="bg-[#362A4F] rounded-xl p-4 text-center text-white flex flex-col items-center min-h-[120px] flex-1"
                      >
                        <p className="text-xs mb-3 text-gray-400">
                          {index === 0 ? "Tue" : getDayName(day.date)}
                        </p>
                        <img
                          src={getWeatherIcon(day.icon)}
                          alt={day.description}
                          className="w-8 h-8 mx-auto mb-auto"
                        />
                        <div className="space-y-0 mt-3">
                          <p className="font-semibold text-sm">{day.high}°</p>
                          <p className="text-xs text-gray-400">{day.low}°</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Hourly Forecast */}
              <div className="lg:col-span-5 ">
                {/* Using the dark card background */}
                <div className="bg-[#362A4F] rounded-3xl p-6 text-white h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-semibold">Hourly forecast</h4>
                    <span className="text-xs bg-white/10 px-3 py-1 rounded-lg text-gray-300">
                      Tuesday
                    </span>
                  </div>

                  <div className="">
                    {getHourlyForecast().map((hour, index) => (
                      // Added border-b for separators
                      <div
                        key={index}
                        className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={getWeatherIcon(hour.weather[0].icon)}
                            alt={hour.weather[0].description}
                            className="w-6 h-6"
                          />
                          <span className="text-sm text-gray-300">
                            {index === 0 ? "Now" : formatTime(hour.dt)}
                          </span>
                        </div>
                        <span className="font-semibold">
                          {Math.round(hour.main.temp)}°
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;
