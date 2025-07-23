const mongoose = require('mongoose');
require('dotenv').config();
const File = require('./models/File');
const Movement = require('./models/Movement');

const years = [2019, 2020, 2021];
const partyNames = [
  'John Doe',
  'Jane Smith',
  'Michael Johnson',
  'Emily Davis',
  'David Wilson',
  'Sarah Brown',
  'Chris Lee',
  'Jessica Martinez',
  'Daniel Anderson',
  'Laura Thomas',
  'James Taylor',
  'Olivia Moore',
  'Matthew Jackson',
  'Sophia White',
  'Benjamin Harris',
];
const files = [];
let counter = 0;
for (const year of years) {
  for (let i = 0; i < 5; i++) {
    files.push({
      date: '2021-12-01',
      partyName: partyNames[counter],
      caseCode: 'CR',
      caseNumber: `${1000 + counter + 1}`,
      caseYear: `${year}`,
      lastActivity: '2021-11-30',
      status: 'archived',
      comingFrom: 'Registry',
      destination: 'Archives',
      reason: 'Completed',
      storageLocation: `Shelf ${((counter) % 10) + 1}`,
      currentLocation: 'Archives',
    });
    counter++;
  }
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB');

  // Optionally clear existing files
  // await File.deleteMany({});

  for (const fileData of files) {
    const file = await File.create(fileData);
    await Movement.create({
      file: file._id,
      action: 'moved',
      details: 'Moved from Registry to Archives',
    });
    console.log(`Created file: ${file.partyName}, year: ${file.caseYear}`);
  }

  await mongoose.disconnect();
  console.log('Seeding complete.');
}

seed().catch(err => {
  console.error(err);
  mongoose.disconnect();
}); 