const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');
const port = process.env.PORT || 3000; 
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize an empty array to store dishes
let dishes = [];

// Helper function to sanitize time
function sanitizeTime(time) {
  return time === "-1" ? "N/A" : time + " mins";
}

// Helper function to sanitize state
function sanitizeState(state) {
  return state === "-1" ? "Unknown" : state;
}

// Read and parse the CSV file into JSON
fs.createReadStream('indian_food.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Sanitize and push the data to the dishes array
    row.preparation_time = sanitizeTime(row.preparation_time);
    row.cooking_time = sanitizeTime(row.cooking_time);
    row.state = sanitizeState(row.state);
    dishes.push(row);
  })
  .on('end', () => {
    console.log('CSV file successfully parsed into JSON.');
  });

// Route to get all dishes
app.get('/dishes', (req, res) => {
  res.json(dishes);  // Send back the dishes array as JSON
});

// Route to get a dish by name
app.get('/dishes/:name', (req, res) => {
  const dishName = req.params.name.toLowerCase();  // Case insensitive search
  const dish = dishes.find(d => d.name.toLowerCase() === dishName);  // Find the dish by name

  if (dish) {
    res.json(dish);  // Return the dish if found
  } else {
    res.status(404).send('Dish not found');  // Return error if dish is not found
  }
});

// Route to suggest dishes based on ingredients
app.get('/dishes/suggest', (req, res) => {
  const { ingredients } = req.query;  // Get the ingredients query parameter
  const userIngredients = ingredients.split(',').map(i => i.trim().toLowerCase());  // Process the ingredients

  const matchingDishes = dishes.filter(dish => {
    return userIngredients.every(ingredient => 
      dish.ingredients.toLowerCase().includes(ingredient)  // Check if the dish contains all the ingredients
    );
  });

  res.json(matchingDishes);  // Return the list of matching dishes
});

// Start the server

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});