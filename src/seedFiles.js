const mongoose = require('mongoose');
require('dotenv').config();
const File = require('./models/File');
const Movement = require('./models/Movement');

const files = [
  { date: '2021-12-01', partyName: 'John Smith', caseCode: 'CR', caseNumber: '1', caseYear: '2019', lastActivity: '2021-11-30', status: 'archived', comingFrom: 'Registry', destination: 'Archives', reason: 'Completed', storageLocation: 'Shelf 1', currentLocation: 'Archives' },
  { date: '2021-12-02', partyName: 'Mary Johnson', caseCode: 'TR', caseNumber: '2', caseYear: '2019', lastActivity: '2021-11-29', status: 'archived', comingFrom: 'Registry', destination: 'Archives', reason: 'Completed', storageLocation: 'Shelf 2', currentLocation: 'Archives' },
  { date: '2021-12-03', partyName: 'Robert Williams', caseCode: 'SO', caseNumber: '3', caseYear: '2020', lastActivity: '2021-11-28', status: 'archived', comingFrom: 'Registry', destination: 'Archives', reason: 'Completed', storageLocation: 'Shelf 3', currentLocation: 'Archives' },
  { date: '2021-12-04', partyName: 'Sarah Davis', caseCode: 'CC', caseNumber: '4', caseYear: '2020', lastActivity: '2021-11-27', status: 'archived', comingFrom: 'Registry', destination: 'Archives', reason: 'Completed', storageLocation: 'Shelf 4', currentLocation: 'Archives' },
  { date: '2021-12-05', partyName: 'Michael Brown', caseCode: 'MCCHCC', caseNumber: '5', caseYear: '2021', lastActivity: '2021-11-26', status: 'archived', comingFrom: 'Registry', destination: 'Archives', reason: 'Completed', storageLocation: 'Shelf 5', currentLocation: 'Archives' },
  { date: '2021-12-06', partyName: 'Lisa Wilson', caseCode: 'CR', caseNumber: '6', caseYear: '2021', lastActivity: '2021-11-25', status: 'archived', comingFrom: 'Registry', destination: 'Archives', reason: 'Completed', storageLocation: 'Shelf 6', currentLocation: 'Archives' },
  { date: '2021-12-07', partyName: 'David Miller', caseCode: 'TR', caseNumber: '7', caseYear: '2019', lastActivity: '2021-11-24', status: 'archived', comingFrom: 'Registry', destination: 'Archives', reason: 'Completed', storageLocation: 'Shelf 7', currentLocation: 'Archives' },
  { date: '2021-12-08', partyName: 'Jennifer Garcia', caseCode: 'SO', caseNumber: '8', caseYear: '2020', lastActivity: '2021-11-23', status: 'archived', comingFrom: 'Registry', destination: 'Archives', reason: 'Completed', storageLocation: 'Shelf 8', currentLocation: 'Archives' },
  { date: '2021-12-09', partyName: 'Christopher Martinez', caseCode: 'CC', caseNumber: '9', caseYear: '2021', lastActivity: '2021-11-22', status: 'archived', comingFrom: 'Registry', destination: 'Archives', reason: 'Completed', storageLocation: 'Shelf 9', currentLocation: 'Archives' },
  { date: '2021-12-10', partyName: 'Amanda Rodriguez', caseCode: 'MCCHCC', caseNumber: '10', caseYear: '2019', lastActivity: '2021-11-21', status: 'archived', comingFrom: 'Registry', destination: 'Archives', reason: 'Completed', storageLocation: 'Shelf 10', currentLocation: 'Archives' },
  { date: '2021-12-11', partyName: 'James Anderson', caseCode: 'CR', caseNumber: '11', caseYear: '2020', lastActivity: '2021-11-20', status: 'archived', comingFrom: 'Registry', destination: 'Archives', reason: 'Completed', storageLocation: 'Shelf 1', currentLocation: 'Archives' },
  { date: '2021-12-12', partyName: 'Michelle Taylor', caseCode: 'TR', caseNumber: '12', caseYear: '2021', lastActivity: '2021-11-19', status: 'archived', comingFrom: 'Registry', destination: 'Archives', reason: 'Completed', storageLocation: 'Shelf 2', currentLocation: 'Archives' },
  { date: '2021-12-13', partyName: 'Kevin Thomas', caseCode: 'SO', caseNumber: '13', caseYear: '2019', lastActivity: '2021-11-18', status: 'archived', comingFrom: 'Registry', destination: 'Archives', reason: 'Completed', storageLocation: 'Shelf 3', currentLocation: 'Archives' },
  { date: '2021-12-14', partyName: 'Nicole Hernandez', caseCode: 'CC', caseNumber: '14', caseYear: '2020', lastActivity: '2021-11-17', status: 'archived', comingFrom: 'Registry', destination: 'Archives', reason: 'Completed', storageLocation: 'Shelf 4', currentLocation: 'Archives' },
  { date: '2021-12-15', partyName: 'Steven Moore', caseCode: 'MCCHCC', caseNumber: '15', caseYear: '2021', lastActivity: '2021-11-16', status: 'archived', comingFrom: 'Registry', destination: 'Archives', reason: 'Completed', storageLocation: 'Shelf 5', currentLocation: 'Archives' },
  { date: '2021-12-16', partyName: 'Rachel Jackson', caseCode: 'CR', caseNumber: '16', caseYear: '2019', lastActivity: '2021-11-15', status: 'archived', comingFrom: 'Registry', destination: 'Archives', reason: 'Completed', storageLocation: 'Shelf 6', currentLocation: 'Archives' },
  { date: '2021-12-17', partyName: 'Daniel White', caseCode: 'TR', caseNumber: '17', caseYear: '2020', lastActivity: '2021-11-14', status: 'archived', comingFrom: 'Registry', destination: 'Archives', reason: 'Completed', storageLocation: 'Shelf 7', currentLocation: 'Archives' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB');

  await Movement.deleteMany({});
  await File.deleteMany({});

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