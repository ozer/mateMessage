import mongoose from 'mongoose';

export const dropDatabase = async ({ dbName = '' }) => {
  mongoose.connect(`mongodb://localhost:27017/${dbName}`, {
    useNewUrlParser: true
  });

  await mongoose.connection
    .once('open', async () => {
      console.log('Connected Mongo Instance to drop the database.');
      await mongoose.connection.db.dropDatabase();
      return true;
    })
    .on('error', error => {
      console.log('Error dropping to MongoLab:', error);
      return false;
    });
};
