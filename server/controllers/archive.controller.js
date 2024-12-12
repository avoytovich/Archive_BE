const path = require('path');
const fs = require('fs');

const { Archive, Sequelize } = require('./../models');
const { getPagination, getPagingData } = require('./../helper/pagination');
const { archive: messages } = require('./../helper/messages');

// Define the directory where the files are stored
const uploadDir = path.join(__dirname, '../../public/uploads');

module.exports = {
  // Create a new archive
  create(req, res) {
    const title = path.basename(req.file.originalname, path.extname(req.file.originalname));
    const filePath = req.file.path;
    const group = req.body.group;

    Archive.create({ title, filePath, group })
      .then((archive) =>
        res.status(200).json({ message: messages.created, archive })
      )
      .catch((error) => res.status(500).send({ error: error.message }));
  },

  // Get all archives with pagination and optional title filter
  getAll(req, res) {
    const { page, size, title, group } = req.query;
    const { limit, offset } = getPagination(page, size);

    // Create condition for title filter
    const titleCondition = title ? { title: { [Sequelize.Op.like]: `%${title}%` } } : null;
    
    // Create condition for group filter (assuming group is a field in your Archive model)
    const groupCondition = group ? { group: { [Sequelize.Op.eq]: group } } : null;

    // Combine conditions if both title and group filters are provided
    const condition = {
      ...titleCondition,
      ...groupCondition,
    };

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
  },

  // Delete a single archive by ID
  delete(req, res) {
    const { id } = req.params;

    Archive.findByPk(id)
      .then((archive) => {
        if (!archive) {
          return res.status(404).json({ message: "Archive not found" });
        }

        // Delete the file from the server
        fs.unlink(archive.filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
            return res.status(500).json({ message: "Failed to delete file from server" });
          }

          // Delete the record from the database
          archive.destroy()
            .then(() => {
              return res.status(200).json({ message: messages.deleted });
            })
            .catch((error) => {
              console.error("Error deleting record from database:", error);
              res.status(500).json({ message: "Failed to delete record from database" });
            });
        });
      })
      .catch((error) => res.status(500).send({ error: error.message }));
  },

  // Bulk delete archives by an array of IDs
  bulkDelete(req, res) {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Please provide an array of IDs to delete" });
    }

    // Find archives by the provided IDs
    Archive.findAll({
      where: {
        id: { [Sequelize.Op.in]: ids }
      }
    })
      .then((archives) => {
        if (archives.length === 0) {
          return res.status(404).json({ message: "No archives found for the given IDs" });
        }

        // Delete files from the server and records from the database
        const deletePromises = archives.map((archive) => {
          return new Promise((resolve, reject) => {
            // Delete the file from the server
            fs.unlink(archive.filePath, (err) => {
              if (err) {
                reject(`Error deleting file for archive ${archive.title}: ${err.message}`);
              } else {
                // Delete the record from the database
                archive.destroy()
                  .then(() => resolve())
                  .catch((error) => reject(`Error deleting record for archive ${archive.title}: ${error.message}`));
              }
            });
          });
        });

        // Execute all delete promises
        Promise.all(deletePromises)
          .then(() => {
            return res.status(200).json({ message: `${archives.length} archives deleted successfully` });
          })
          .catch((error) => {
            console.error("Error occurred during bulk delete:", error);
            return res.status(500).json({ message: "Error occurred while deleting files and records" });
          });
      })
      .catch((error) => res.status(500).send({ error: error.message }));
  },

  // Fetch distinct groups
  getAllGroups (req, res) {
    Archive.aggregate("group", "DISTINCT", { plain: false })
      .then((groups) => {
        res.status(200).json(groups.map((g) => g.DISTINCT));
      })
      .catch((error) => {
        res.status(500).json({ error: error.message  });
      })
  }
};
