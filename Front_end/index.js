const express = require('express');
const utils = require('./utils');
const app = express();

// Object.getPrototypeOf(express.response).renderWithLayout = function () {
//   console.log(123);
// }

const PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('layout', './layout');

app.get('/', (req, res) => {
  utils.renderWithLayout(res, 'home', 'HOME');
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${[PORT]}...`);
});