const express = require('express');
const bodyParser = require('body-parser');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
app.use(bodyParser.json());
app.use('/reports', reportRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`));
