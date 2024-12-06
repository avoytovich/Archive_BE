const { Archive, Sequelize } = require('./../models');
const { getPagination, getPagingData } = require('./../helper/pagination');
const { archive: messages } = require('./../helper/messages');
const path = require('path');

module.exports = {
  create(req, res) {
    const title = path.basename(req.file.originalname, path.extname(req.file.originalname));
    const filePath = req.file.path;
    
    Archive.create({ title, filePath })
      .then((archive) =>
        res.status(200).json({ message: messages.created, archive })
      )
      .catch((error) => res.status(500).send({ error: error.message }));
  },
  getAll(req, res) {
    const { page, size, title } = req.query;
    const condition = title ? { title: { [Sequelize.Op.like]: `%${title}%` } } : null;
    const { limit, offset } = getPagination(page, size);

    Archive.findAndCountAll({
        limit,
        offset,
        where: condition,
        order: [['createdAt', 'DESC']]
      })
      .then((archives) => {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const response = getPagingData(archives, page, limit, baseUrl);
        res.status(200).send(response);
      })
      .catch((error) => res.status(500).send(error));
  }
};
