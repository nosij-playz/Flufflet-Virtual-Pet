const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files like CSS, JS, images
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route for the homepage
app.get('/', (req, res) => {
  res.render('index');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
