'use client'

import React, { useState } from 'react';
import { Search} from 'lucide-react';
import { WeatherData, ForecastData, ForecastItem, DailyForecast } from '@/app/types';

const WeatherApp = () => {
  // ✅ Typed state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const API_KEY = '9d729cfd40c256defac28e6a8266b774';
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    });
  };

  const getDayName = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getWeatherIcon = (iconCode: string): string => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const searchWeather = async (): Promise<void> => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Fetch current weather
      const weatherResponse = await fetch(
        `${BASE_URL}/weather?q=${searchQuery}&appid=${API_KEY}&units=metric`
      );

      if (!weatherResponse.ok) {
        throw new Error('City not found');
      }

      const weatherResult: WeatherData = await weatherResponse.json();

      // Fetch forecast data
      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?q=${searchQuery}&appid=${API_KEY}&units=metric`
      );

      const forecastResult: ForecastData = await forecastResponse.json();

      setWeatherData(weatherResult);
      setForecastData(forecastResult);
      setSearchQuery('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center text-white">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
              ☀️
            </div>
            <h1 className="text-xl font-semibold">
              {weatherData ? 'Weather Now' : 'Weather Today'}
            </h1>
          </div>
          <div className="text-white text-sm opacity-70">
            🌍 Units ▼
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl text-white font-light">Hows the sky looking today?</h2>
        </div>

        {/* Search Bar */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="relative flex">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder="Search for a place..."
                className="w-full px-4 py-3 pl-12 rounded-l-xl bg-black/30 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-300"
              />
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300"
                size={18}
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-xl transition-colors duration-200 font-semibold"
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
            <div className="mb-8">
              <div className="w-16 h-16 mx-auto mb-4 opacity-50">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <p className="text-lg">Search for a city to see weather information</p>
            </div>
          </div>
        )}

        {/* Weather Data Display */}
        {weatherData && (
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Weather Card */}
              <div className="lg:col-span-2">
                <div className="bg-blue-600/80 backdrop-blur-sm rounded-3xl p-8 text-white relative overflow-hidden">
                  {/* Location and Date */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-semibold mb-1">
                      {weatherData.name}, {weatherData.sys.country}
                    </h3>
                    <p className="text-blue-100">{formatDate(weatherData.dt)}</p>
                  </div>

                  {/* Weather Icon */}
                  <div className="absolute top-6 right-6">
                    <img
                      src={getWeatherIcon(weatherData.weather[0].icon)}
                      alt={weatherData.weather[0].description}
                      className="w-16 h-16 opacity-80"
                    />
                  </div>

                  {/* Temperature */}
                  <div className="mb-8">
                    <div className="text-7xl font-light mb-2">
                      {Math.round(weatherData.main.temp)}°
                    </div>
                  </div>

                  {/* Weather Stats Grid */}
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-blue-200 text-sm mb-1">Feels Like</p>
                      <p className="text-xl font-semibold">
                        {Math.round(weatherData.main.feels_like)}°
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm mb-1">Humidity</p>
                      <p className="text-xl font-semibold">{weatherData.main.humidity}%</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm mb-1">Wind</p>
                      <p className="text-xl font-semibold">{Math.round(weatherData.wind.speed)} km/h</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm mb-1">Precipitation</p>
                      <p className="text-xl font-semibold">0 mm</p>
                    </div>
                  </div>
                </div>

                {/* Daily Forecast */}
                <div className="mt-6">
                  <h4 className="text-white text-lg font-semibold mb-4">Daily forecast</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {getDailyForecast().map((day, index) => (
                      <div
                        key={index}
                        className="bg-purple-800/50 backdrop-blur-sm rounded-2xl p-4 text-center text-white"
                      >
                        <p className="text-sm mb-2 opacity-90">
                          {index === 0 ? 'Tue' : getDayName(day.date)}
                        </p>
                        <img
                          src={getWeatherIcon(day.icon)}
                          alt={day.description}
                          className="w-8 h-8 mx-auto mb-2"
                        />
                        <div className="space-y-1">
                          <p className="font-semibold text-sm">{day.high}°</p>
                          <p className="text-xs opacity-70">{day.low}°</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hourly Forecast Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-purple-800/50 backdrop-blur-sm rounded-3xl p-6 text-white">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-semibold">Hourly forecast</h4>
                    <span className="text-sm bg-purple-700/50 px-3 py-1 rounded-full">
                      Tuesday
                    </span>
                  </div>

                  <div className="space-y-4">
                    {getHourlyForecast().map((hour, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={getWeatherIcon(hour.weather[0].icon)}
                            alt={hour.weather[0].description}
                            className="w-8 h-8"
                          />
                          <span className="text-sm">
                            {index === 0 ? 'Now' : formatTime(hour.dt).replace(' ', '')}
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