const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}
app.use(cors(corsOptions))

// Define the endpoint to obtain the directory listing
app.get('/directory/:path(*)', (req, res) => {
  const directoryPath = req.params.path || '.'; // Default to the current directory if no path is provided
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
 
  fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    //Add pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = files.slice(startIndex, endIndex);


    const directoryListing =paginatedFiles.map(file => {
      const filePath = path.join(directoryPath, file.name);
      const stats = fs.statSync(filePath);
      const isDirectory = file.isDirectory();
      const fileSize = isDirectory ? '-' : formatFileSize(stats.size);
      const fileExtension = isDirectory ? '-' : path.extname(file.name).slice(1);
      const createdDate = stats.birthtime.toISOString();
      const permissions = formatPermissions(stats);

      return {
        name: file.name,
        path: filePath,
        size: fileSize,
        extension: fileExtension,
        createdDate: createdDate,
        isDirectory: isDirectory,
        permissions: permissions
      };
    });
    const totalFiles = files.length;
    const totalPages = Math.ceil(files.length / limit);
    res.json({
      currentPage: page,
      totalPages: totalPages,
      totalFiles: totalFiles,
      filesPerPage: limit,
      directoryListing: directoryListing
    });
  });
});

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to format file permissions
function formatPermissions(stats) {
  const permissions = [
    stats.mode & 400 ? 'r' : '-',
    stats.mode & 200 ? 'w' : '-',
    stats.mode & 100 ? 'x' : '-',
    stats.mode & 40 ? 'r' : '-',
    stats.mode & 20 ? 'w' : '-',
    stats.mode & 10 ? 'x' : '-',
    stats.mode & 4 ? 'r' : '-',
    stats.mode & 2 ? 'w' : '-',
    stats.mode & 1 ? 'x' : '-'
  ];

  return permissions.join('');
}

// Start the server
app.listen(port, () => {
  console.log(`Servers listening on port ${port}`);
});