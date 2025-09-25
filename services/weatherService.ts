// Weather service for Twin Cities (Rawalpindi and Islamabad)
export interface WeatherData {
  id: string;
  city: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  condition: string;
  description: string;
  icon: string;
  timestamp: string;
}

export interface ForecastData {
  id: string;
  city: string;
  date: string;
  day: string;
  highTemp: number;
  lowTemp: number;
  condition: string;
  description: string;
  icon: string;
  precipitation: number;
  humidity: number;
  windSpeed: number;
}

export interface WeatherAlerts {
  id: string;
  city: string;
  type: 'warning' | 'watch' | 'advisory';
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  issuedAt: string;
  expiresAt: string;
}

// Mock weather data for Twin Cities
const mockCurrentWeather: WeatherData[] = [
  {
    id: '1',
    city: 'Islamabad',
    temperature: 28,
    feelsLike: 32,
    humidity: 65,
    windSpeed: 12,
    windDirection: 'NW',
    pressure: 1013,
    visibility: 10,
    uvIndex: 7,
    condition: 'Partly Cloudy',
    description: 'Partly cloudy with some sunshine',
    icon: 'partly-cloudy-day',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    city: 'Rawalpindi',
    temperature: 30,
    feelsLike: 34,
    humidity: 58,
    windSpeed: 15,
    windDirection: 'W',
    pressure: 1011,
    visibility: 8,
    uvIndex: 8,
    condition: 'Sunny',
    description: 'Clear skies with bright sunshine',
    icon: 'sunny',
    timestamp: new Date().toISOString(),
  },
];

const mockForecastData: ForecastData[] = [
  // Islamabad 7-day forecast
  {
    id: 'isb-1',
    city: 'Islamabad',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: 'Tomorrow',
    highTemp: 31,
    lowTemp: 22,
    condition: 'Partly Cloudy',
    description: 'Partly cloudy with occasional sunshine',
    icon: 'partly-cloudy-day',
    precipitation: 20,
    humidity: 70,
    windSpeed: 10,
  },
  {
    id: 'isb-2',
    city: 'Islamabad',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 29,
    lowTemp: 20,
    condition: 'Rain',
    description: 'Light rain expected throughout the day',
    icon: 'rainy',
    precipitation: 80,
    humidity: 85,
    windSpeed: 8,
  },
  {
    id: 'isb-3',
    city: 'Islamabad',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 26,
    lowTemp: 18,
    condition: 'Cloudy',
    description: 'Overcast skies with cool temperatures',
    icon: 'cloudy',
    precipitation: 30,
    humidity: 75,
    windSpeed: 6,
  },
  {
    id: 'isb-4',
    city: 'Islamabad',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 32,
    lowTemp: 24,
    condition: 'Sunny',
    description: 'Clear skies and warm weather',
    icon: 'sunny',
    precipitation: 0,
    humidity: 55,
    windSpeed: 12,
  },
  {
    id: 'isb-5',
    city: 'Islamabad',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 30,
    lowTemp: 22,
    condition: 'Partly Cloudy',
    description: 'Mix of sun and clouds',
    icon: 'partly-cloudy-day',
    precipitation: 15,
    humidity: 60,
    windSpeed: 9,
  },
  {
    id: 'isb-6',
    city: 'Islamabad',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 27,
    lowTemp: 19,
    condition: 'Thunderstorm',
    description: 'Thunderstorms likely in the afternoon',
    icon: 'thunderstorm',
    precipitation: 90,
    humidity: 80,
    windSpeed: 18,
  },
  {
    id: 'isb-7',
    city: 'Islamabad',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 25,
    lowTemp: 17,
    condition: 'Rain',
    description: 'Heavy rain expected',
    icon: 'rainy',
    precipitation: 95,
    humidity: 88,
    windSpeed: 14,
  },
  // Rawalpindi 7-day forecast
  {
    id: 'rwp-1',
    city: 'Rawalpindi',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: 'Tomorrow',
    highTemp: 33,
    lowTemp: 24,
    condition: 'Sunny',
    description: 'Clear skies with hot weather',
    icon: 'sunny',
    precipitation: 5,
    humidity: 65,
    windSpeed: 12,
  },
  {
    id: 'rwp-2',
    city: 'Rawalpindi',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 31,
    lowTemp: 22,
    condition: 'Rain',
    description: 'Moderate rain showers',
    icon: 'rainy',
    precipitation: 70,
    humidity: 80,
    windSpeed: 10,
  },
  {
    id: 'rwp-3',
    city: 'Rawalpindi',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 28,
    lowTemp: 20,
    condition: 'Cloudy',
    description: 'Overcast conditions',
    icon: 'cloudy',
    precipitation: 25,
    humidity: 70,
    windSpeed: 8,
  },
  {
    id: 'rwp-4',
    city: 'Rawalpindi',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 35,
    lowTemp: 26,
    condition: 'Sunny',
    description: 'Hot and sunny weather',
    icon: 'sunny',
    precipitation: 0,
    humidity: 50,
    windSpeed: 14,
  },
  {
    id: 'rwp-5',
    city: 'Rawalpindi',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 32,
    lowTemp: 24,
    condition: 'Partly Cloudy',
    description: 'Mix of sun and clouds',
    icon: 'partly-cloudy-day',
    precipitation: 10,
    humidity: 58,
    windSpeed: 11,
  },
  {
    id: 'rwp-6',
    city: 'Rawalpindi',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 29,
    lowTemp: 21,
    condition: 'Thunderstorm',
    description: 'Strong thunderstorms expected',
    icon: 'thunderstorm',
    precipitation: 85,
    humidity: 75,
    windSpeed: 20,
  },
  {
    id: 'rwp-7',
    city: 'Rawalpindi',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: 27,
    lowTemp: 19,
    condition: 'Rain',
    description: 'Heavy rainfall throughout the day',
    icon: 'rainy',
    precipitation: 90,
    humidity: 85,
    windSpeed: 16,
  },
];

const mockWeatherAlerts: WeatherAlerts[] = [
  {
    id: '1',
    city: 'Islamabad',
    type: 'warning',
    title: 'Heat Wave Warning',
    description: 'High temperatures expected. Stay hydrated and avoid prolonged exposure to sun.',
    severity: 'moderate',
    issuedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    city: 'Rawalpindi',
    type: 'advisory',
    title: 'Air Quality Alert',
    description: 'Poor air quality due to dust and pollution. Limit outdoor activities.',
    severity: 'low',
    issuedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  },
];

// Weather service functions
export const weatherService = {
  // Get current weather for both cities
  getCurrentWeather: async (): Promise<WeatherData[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockCurrentWeather;
  },

  // Get 7-day forecast for a specific city
  getForecast: async (city: 'Islamabad' | 'Rawalpindi' | 'both'): Promise<ForecastData[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (city === 'both') {
      return mockForecastData;
    }
    
    return mockForecastData.filter(forecast => forecast.city === city);
  },

  // Get weather alerts
  getWeatherAlerts: async (): Promise<WeatherAlerts[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockWeatherAlerts;
  },

  // Get weather icon emoji based on condition
  getWeatherIcon: (condition: string): string => {
    const iconMap: { [key: string]: string } = {
      'sunny': '☀️',
      'partly-cloudy-day': '⛅',
      'cloudy': '☁️',
      'rainy': '🌧️',
      'thunderstorm': '⛈️',
      'snowy': '❄️',
      'foggy': '🌫️',
      'windy': '💨',
    };
    
    return iconMap[condition] || '🌤️';
  },

  // Format temperature
  formatTemperature: (temp: number): string => {
    return `${Math.round(temp)}°C`;
  },

  // Get UV index description
  getUVDescription: (uvIndex: number): { level: string; color: string; advice: string } => {
    if (uvIndex <= 2) {
      return { level: 'Low', color: '#4ade80', advice: 'Safe to stay outside' };
    } else if (uvIndex <= 5) {
      return { level: 'Moderate', color: '#fbbf24', advice: 'Seek shade during midday' };
    } else if (uvIndex <= 7) {
      return { level: 'High', color: '#f97316', advice: 'Wear sunscreen and hat' };
    } else if (uvIndex <= 10) {
      return { level: 'Very High', color: '#ef4444', advice: 'Avoid sun exposure' };
    } else {
      return { level: 'Extreme', color: '#7c3aed', advice: 'Stay indoors if possible' };
    }
  },

  // Get wind direction arrow
  getWindDirectionArrow: (direction: string): string => {
    const directionMap: { [key: string]: string } = {
      'N': '↑',
      'NE': '↗️',
      'E': '→',
      'SE': '↘️',
      'S': '↓',
      'SW': '↙️',
      'W': '←',
      'NW': '↖️',
    };
    
    return directionMap[direction] || '→';
  },
};
