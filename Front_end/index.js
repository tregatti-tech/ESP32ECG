const express = require('express');
const utils = require('./utils');
const app = express();

// Object.getPrototypeOf(express.response).renderWithLayout = function () {
//   console.log(123);
// }

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('layout', './layout');

app.get('/', (req, res) => {
  utils.renderWithLayout(res, 'home', 'HOME');
});

app.listen(8080, () => {
  console.log('Server is listening on :8080');
});