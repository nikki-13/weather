
import React from "react";
import {
  CloudSun,
  CloudMoonRain,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
  Moon,
  Thermometer,
  ThermometerSnowflake,
  ThermometerSun,
  Wind,
  Umbrella,
  UmbrellaOff,
} from "lucide-react";

interface WeatherIconProps {
  name: string;
  size?: number;
  className?: string;
}

const WeatherIcon = ({ name, size = 24, className = "" }: WeatherIconProps) => {
  const iconProps = { size, className };

  switch (name) {
    case "cloud-sun":
      return <CloudSun {...iconProps} />;
    case "cloud-moon-rain":
      return <CloudMoonRain {...iconProps} />;
    case "cloud-lightning":
      return <CloudLightning {...iconProps} />;
    case "cloud-rain":
      return <CloudRain {...iconProps} />;
    case "cloud-snow":
      return <CloudSnow {...iconProps} />;
    case "sun":
      return <Sun {...iconProps} />;
    case "moon":
      return <Moon {...iconProps} />;
    case "thermometer":
      return <Thermometer {...iconProps} />;
    case "thermometer-snowflake":
      return <ThermometerSnowflake {...iconProps} />;
    case "thermometer-sun":
      return <ThermometerSun {...iconProps} />;
    case "wind":
      return <Wind {...iconProps} />;
    case "umbrella":
      return <Umbrella {...iconProps} />;
    case "umbrella-off":
      return <UmbrellaOff {...iconProps} />;
    default:
      return <CloudSun {...iconProps} />; // Default icon
  }
};

export default WeatherIcon;
