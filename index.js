const express = require('express');
const client = require('prom-client');

const app = express();
const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.get('/', (req, res) => res.json({ message: 'Hello from jenkins-demo!', status: 'ok' }));
app.get('/health', (req, res) => res.json({ status: 'healthy' }));
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

const PORT = process.env.PORT || 3000;
if (require.main === module) app.listen(PORT, () => console.log(`Running on port ${PORT}`));

module.exports = app;