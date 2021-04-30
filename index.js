const express = require('express');
const cors = require('cors');
// const bodyParser = require('body-parser');
const mongodb = require('./models/mongoose');
const { eventInit } = require('./redis/event');
const { singleFilterCache, akrualkasCache } = require('./jobs/caching/cache-filter');
const controllers = require('./controllers/index');

const app = express();
const port = process.env.PORT || 4000;

eventInit();
mongodb();

// TODO: Fetch filter from mongodb then store as redis hash
singleFilterCache();
akrualkasCache();

app.use(cors());
app.options('*', cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

app.use('/user', controllers.user);
app.use('/upload', controllers.upload);
app.use('/single_filter', controllers.singleFilter);
app.use('/telaah', controllers.telaah);
app.use('/download', controllers.download);

app.listen(port, () => console.log(`Using port ${port}`));