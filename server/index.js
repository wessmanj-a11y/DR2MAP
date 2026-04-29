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

const dataSources = [
  {
    key: 'outages',
    name: 'TDIS / Texas outage feed',
    category: 'Outage intelligence',
    status: 'sandbox-ready',
    use: 'County outage totals, incidents, largest single outage, outage point intelligence',
    productionNote: 'Connect only after confirming commercial-use rights and attribution requirements.'
  },
  {
    key: 'nws-alerts',
    name: 'National Weather Service active alerts',
    category: 'Weather risk',
    status: 'live-ready',
    endpoint: 'https://api.weather.gov/alerts/active?area=TX',
    use: 'Weather alert count, severity weighting, county-level risk pressure'
  },
  {
    key: 'radar',
    name: 'OpenWeather precipitation radar tiles',
    category: 'Radar overlay',
    status: 'api-key-required',
    use: 'Precipitation/radar layer for operational context'
  },
  {
    key: 'roads',
    name: 'DriveTexas road closure data',
    category: 'Restoration access',
    status: 'integration-needed',
    use: 'Road closures, detours, access constraints affecting restoration'
  },
  {
    key: 'hhs-hospital',
    name: 'CDC/HHS hospital capacity data',
    category: 'Community impact',
    status: 'integration-needed',
    use: 'Statewide hospital occupancy and capacity trend context'
  },
  {
    key: 'ercot',
    name: 'ERCOT grid status',
    category: 'Grid reliability',
    status: 'integration-needed',
    use: 'Reserve status, grid stress, operational risk context'
  }
];

const counties = [
  { name: 'Dallas', region: 'North Texas', risk: 78, probability: 72, confidence: 64, severity: 'Severe', outages: 25200, incidents: 42, weather: 'Severe Thunderstorm Watch', roads: 4, hospital: 'Moderate capacity pressure', grid: 'Elevated', trend: 'Worsening', lat: 32.7767, lng: -96.7970 },
  { name: 'Tarrant', region: 'North Texas', risk: 74, probability: 68, confidence: 61, severity: 'High', outages: 19450, incidents: 37, weather: 'High Wind Advisory', roads: 5, hospital: 'Normal', grid: 'Elevated', trend: 'Worsening', lat: 32.7555, lng: -97.3308 },
  { name: 'Collin', region: 'North Texas', risk: 69, probability: 59, confidence: 58, severity: 'Elevated', outages: 14300, incidents: 26, weather: 'Severe Thunderstorm Watch', roads: 2, hospital: 'Normal', grid: 'Elevated', trend: 'Elevated', lat: 33.1795, lng: -96.4930 },
  { name: 'Harris', region: 'Gulf Coast', risk: 83, probability: 76, confidence: 67, severity: 'Severe', outages: 35100, incidents: 51, weather: 'Flood Watch', roads: 6, hospital: 'Capacity watch', grid: 'Watch', trend: 'Worsening', lat: 29.7604, lng: -95.3698 },
  { name: 'Travis', region: 'Central Texas', risk: 58, probability: 41, confidence: 52, severity: 'Guarded', outages: 7800, incidents: 19, weather: 'Heat Advisory', roads: 1, hospital: 'Normal', grid: 'Normal', trend: 'Stable', lat: 30.2672, lng: -97.7431 },
  { name: 'Rockwall', region: 'North Texas', risk: 61, probability: 48, confidence: 55, severity: 'Elevated', outages: 4200, incidents: 11, weather: 'Severe Thunderstorm Watch', roads: 0, hospital: 'Normal', grid: 'Elevated', trend: 'Stable', lat: 32.9312, lng: -96.4597 }
];

function buildDashboardPayload() {
  const totalCustomersOut = counties.reduce((sum, c) => sum + c.outages, 0);
  const severeCounties = counties.filter(c => c.risk >= 75).length;
  const roadClosures = counties.reduce((sum, c) => sum + c.roads, 0);
  const activeWeatherAlerts = counties.filter(c => c.weather && c.weather !== 'None').length;
  const topCounty = [...counties].sort((a, b) => b.risk - a.risk)[0];

  return {
    generatedAt: new Date().toISOString(),
    mode: 'Phase 4 data-source architecture',
    summary: {
      totalCustomersOut,
      impactedCounties: counties.filter(c => c.outages > 0).length,
      severeCounties,
      activeWeatherAlerts,
      roadClosures,
      gridStatus: 'Elevated Risk',
      statewideTrend: '+18.4%',
      topCounty: topCounty.name,
      modelReadiness: 54
    },
    counties,
    dataSources,
    ml: {
      modelName: 'DR2MAP outage-worsening classifier',
      status: 'sandbox scoring with live-source-ready inputs',
      target: 'Predict counties likely to worsen over the next operational period',
      features: ['customersOut', 'incidents', 'maxSingleOutage', 'weatherRisk', 'roadClosureRisk', 'trend24h', 'sevenDayPeak', 'gridStress'],
      caveat: 'Decision-support signal only; not a guarantee or official forecast.'
    },
    recommendations: [
      'Prioritize Harris County due to the highest combined outage, weather, and road-access pressure.',
      'Stage monitoring across Dallas/Tarrant corridor where outages and weather pressure are moving together.',
      'Treat Collin and Rockwall as watch counties for North Texas eastward spread.',
      'Before commercial use, verify TDIS/source licensing and avoid reselling raw data as the product.'
    ],
    pipeline: {
      status: 'Source registry installed',
      nextMilestone: 'Replace sandbox county rows with normalized live-source adapters',
      modelReadiness: 54
    }
  };
}

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', platform: 'DR2MAP', mode: 'phase-4' });
});

app.get('/api/sources', (_, res) => {
  res.json({ generatedAt: new Date().toISOString(), sources: dataSources });
});

app.get('/api/counties', (_, res) => {
  res.json({ generatedAt: new Date().toISOString(), counties });
});

app.get('/api/dashboard', (_, res) => {
  res.json(buildDashboardPayload());
});

app.listen(PORT, () => console.log(`DR2MAP server running on port ${PORT}`));
