const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDatabase } = require('./config/db');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const PORT = process.env.PORT || 4000;

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });