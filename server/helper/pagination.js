const path = require('path');

module.exports = {
  getPagination (page, size) {
    const limit = size ? +size : 2;
    const offset = page ? page * limit : 0;
  
    return { limit, offset };
  },
  
  getPagingData (data, page, limit, baseUrl) {
    const { count: totalItems, rows: archives } = data;
    const currentPage = page ? +page : 1;
    const totalPages = Math.ceil(totalItems / limit);

    const archivesWithUrl = archives.map(doc => {
    const documentObject = doc.toJSON();
    const { filePath, ...rest } = documentObject;
      return {
        ...rest,
        fileUrl: `${baseUrl}/uploads/${path.basename(doc.filePath)}`,
      }
    });
  
    return { totalItems, archivesWithUrl, totalPages, currentPage };
  },
};
