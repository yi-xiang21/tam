const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRouter = require('./auth');

const app = express();
const PORT = 3000;

app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', authRouter);

app.use(express.static(__dirname));

app.use((req, res, next) => {
  res.status(404).json({ status: 'error', message: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
