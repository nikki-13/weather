# Weather Application

A modern weather application built with React, TypeScript, and Vite. This application allows users to:

- Search for weather by location
- View current weather conditions
- See weather forecasts
- Track weather history
- Visualize weather data with beautiful UI components

## Features

- **Current Weather Display**: Real-time weather information including temperature, conditions, and other metrics
- **Weather Forecast**: Multi-day weather predictions 
- **Search Functionality**: Find weather for any location
- **Weather History**: Save and track weather data over time
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks
- **API Integration**: OpenWeatherMap API (or similar)

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/weather.git

# Navigate to project directory
cd weather

# Install dependencies
npm install
# or using bun
bun install

# Create a .env file and add your API key
# Example:
# VITE_WEATHER_API_KEY=your_api_key_here

# Start the development server
npm run dev
# or using bun
bun run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── pages/               # Page components
├── services/            # API and data services
└── types/               # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/) (or your chosen API)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
