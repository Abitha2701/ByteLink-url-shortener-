const app = require('./app');
const { connectDatabase } = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

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
