const { upload } = require('./../helper/uploading');

const { 
  archiveController
} = require('./../controllers');

module.exports =
  (app) => {
    app.get('/test', (req, res) => res.status(200).send({
      message: 'Welcome'
    }));

    app.post('/create', upload.single('archive'), archiveController.create);
    app.get('/archives', archiveController.getAll);
  };
