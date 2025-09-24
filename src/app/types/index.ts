// src/types/index.ts

export interface WeatherData {
  name: string;
  dt: number;
  sys: {
    country: string;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
  };
}

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
}

export interface ForecastData {
  list: ForecastItem[];
}

export interface DailyForecast {
  date: number;
  high: number;
  low: number;
  icon: string;
  description: string;
}
