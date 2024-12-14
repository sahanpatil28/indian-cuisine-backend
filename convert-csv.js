const fs = require('fs');
const csv = require('csv-parser');

const dishes = [];

fs.createReadStream('indian_food.csv')
  .pipe(csv())
  .on('data', (row) => dishes.push(row))
  .on('end', () => {
    fs.writeFileSync('dishes.json', JSON.stringify(dishes, null, 2));
    console.log('CSV converted to JSON successfully.');
  });
