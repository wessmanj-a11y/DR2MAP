import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

const dashboardPayload = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalCustomersOut: 148223,
    impactedCounties: 37,
    severeCounties: 12,
    activeWeatherAlerts: 34,
    roadClosures: 18,
    gridStatus: 'Elevated Risk',
    statewideTrend: '+18.4%'
  },
  counties: [
    { name: 'Dallas', region: 'North Texas', risk: 78, outages: 25200, incidents: 42, weather: 'Severe Thunderstorm Watch', roads: 4, trend: 'Worsening', lat: 32.7767, lng: -96.7970 },
    { name: 'Tarrant', region: 'North Texas', risk: 74, outages: 19450, incidents: 37, weather: 'High Wind Advisory', roads: 5, trend: 'Worsening', lat: 32.7555, lng: -97.3308 },
    { name: 'Collin', region: 'North Texas', risk: 69, outages: 14300, incidents: 26, weather: 'Severe Thunderstorm Watch', roads: 2, trend: 'Elevated', lat: 33.1795, lng: -96.4930 },
    { name: 'Harris', region: 'Gulf Coast', risk: 83, outages: 35100, incidents: 51, weather: 'Flood Watch', roads: 6, trend: 'Worsening', lat: 29.7604, lng: -95.3698 },
    { name: 'Travis', region: 'Central Texas', risk: 58, outages: 7800, incidents: 19, weather: 'Heat Advisory', roads: 1, trend: 'Stable', lat: 30.2672, lng: -97.7431 },
    { name: 'Rockwall', region: 'North Texas', risk: 61, outages: 4200, incidents: 11, weather: 'Severe Thunderstorm Watch', roads: 0, trend: 'Stable', lat: 32.9312, lng: -96.4597 }
  ],
  recommendations: [
    'Prioritize Gulf Coast and North Texas monitoring over the next operational period.',
    'Stage restoration crews near Dallas/Tarrant corridor due to simultaneous outage and road-access pressure.',
    'Treat Harris County as a severe operational watch due to outage volume plus flood conditions.',
    'Use Collin/Rockwall as early warning counties for North Texas eastward spread.'
  ],
  pipeline: {
    status: 'Sandbox data mode',
    nextMilestone: 'Connect live outage, weather, road, and ML scoring feeds',
    modelReadiness: 42
  }
};

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', platform: 'DR2MAP', mode: 'sandbox' });
});

app.get('/api/dashboard', (_, res) => {
  res.json({ ...dashboardPayload, generatedAt: new Date().toISOString() });
});

app.listen(PORT, () => console.log(`DR2MAP server running on port ${PORT}`));
