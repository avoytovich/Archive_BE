const { upload } = require('./../helper/uploading');
const { archiveController } = require('./../controllers');

module.exports = (app) => {
  // Test route for verification
  app.get('/test', (req, res) => res.status(200).send({
    message: 'Welcome'
  }));

  // Endpoint to fetch distinct groups
  app.get("/groups", archiveController.getAllGroups);

  // Route to create a new archive (uploading)
  app.post('/create', upload.single('archive'), archiveController.create);

  // Route to get all archives (with pagination and optional title filter)
  app.get('/archives', archiveController.getAll);

  // Route to delete a single archive by ID
  app.delete('/archives/:id', archiveController.delete);

  // Route for bulk delete (accepts an array of IDs)
  app.post('/archives/bulk-delete', archiveController.bulkDelete);
};

