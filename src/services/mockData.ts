// Mock data for when the OpenWeatherMap API is not available
import { WeatherData, ForecastData, WeatherLocation } from "@/types/weather";

// Mock locations for search
export const mockLocations: WeatherLocation[] = [
  {
    name: "London",
    lat: 51.5074,
    lon: -0.1278,
    country: "GB",
    state: "England",
  },
  {
    name: "New York",
    lat: 40.7128,
    lon: -74.006,
    country: "US",
    state: "New York",
  },
  {
    name: "Tokyo",
    lat: 35.6762,
    lon: 139.6503,
    country: "JP",
  },
  {
    name: "Sydney",
    lat: -33.8688,
    lon: 151.2093,
    country: "AU",
    state: "New South Wales",
  },
  {
    name: "Paris",
    lat: 48.8566,
    lon: 2.3522,
    country: "FR",
  },
];

// Mock weather data
export const mockWeatherData: WeatherData = {
  coord: { lon: -0.1278, lat: 51.5074 },
  weather: [
    {
      id: 800,
      main: "Clear",
      description: "clear sky",
      icon: "01d",
    },
  ],
  base: "stations",
  main: {
    temp: 18.5,
    feels_like: 17.8,
    temp_min: 16.2,
    temp_max: 20.1,
    pressure: 1013,
    humidity: 65,
  },
  visibility: 10000,
  wind: {
    speed: 5.1,
    deg: 240,
  },
  clouds: {
    all: 5,
  },
  dt: Math.floor(Date.now() / 1000),
  sys: {
    type: 1,
    id: 1414,
    country: "GB",
    sunrise: Math.floor(Date.now() / 1000) - 21600, // 6 hours ago
    sunset: Math.floor(Date.now() / 1000) + 21600,  // 6 hours from now
  },
  timezone: 0,
  id: 2643743,
  name: "London",
  cod: 200,
};

// Mock forecast data
export const mockForecastData: ForecastData = {
  cod: "200",
  message: 0,
  cnt: 40,
  list: Array.from({ length: 40 }, (_, i) => ({
    dt: Math.floor(Date.now() / 1000) + i * 3600 * 3, // Every 3 hours
    main: {
      temp: 17 + Math.random() * 5,
      feels_like: 16 + Math.random() * 5,
      temp_min: 15 + Math.random() * 3,
      temp_max: 19 + Math.random() * 3,
      pressure: 1013,
      sea_level: 1013,
      grnd_level: 1010,
      humidity: 65 + Math.floor(Math.random() * 15),
      temp_kf: 0,
    },
    weather: [
      {
        id: 800 + Math.floor(Math.random() * 3),
        main: ["Clear", "Clouds", "Rain"][Math.floor(Math.random() * 3)],
        description: ["clear sky", "few clouds", "scattered clouds", "light rain"][
          Math.floor(Math.random() * 4)
        ],
        icon: ["01d", "02d", "03d", "04d", "10d"][Math.floor(Math.random() * 5)],
      },
    ],
    clouds: {
      all: Math.floor(Math.random() * 100),
    },
    wind: {
      speed: 3 + Math.random() * 5,
      deg: Math.floor(Math.random() * 360),
      gust: 5 + Math.random() * 5,
    },
    visibility: 10000,
    pop: Math.random() * 0.5,
    sys: {
      pod: i % 2 === 0 ? "d" : "n",
    },
    dt_txt: new Date(Date.now() + i * 3600 * 3 * 1000).toISOString().split(".")[0].replace("T", " "),
  })),
  city: {
    id: 2643743,
    name: "London",
    coord: {
      lat: 51.5074,
      lon: -0.1278,
    },
    country: "GB",
    population: 1000000,
    timezone: 0,
    sunrise: Math.floor(Date.now() / 1000) - 21600, // 6 hours ago
    sunset: Math.floor(Date.now() / 1000) + 21600,  // 6 hours from now
  },
};
