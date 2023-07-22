import fs from 'fs';

let FOLDER_PATH = '';
let NEW_FILE_NAME = '';

function readDir(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (error, files) => {
      if (error) return reject(null);

      return resolve(files);
    });
  });
}

function getFileSize(files) {
  return files.map((fileName) => {
    const stats = fs.statSync(FOLDER_PATH + '/' + fileName);

    return {
      fileName,
      size: stats.size,
    };
  });
}

function sortData(files, direction = 'asc') {
  const cloneData = structuredClone(files);

  cloneData.sort((a, b) => {
    if (direction === 'asc') {
      return a.size - b.size;
    } else {
      return b.size - a.size;
    }
  });

  return cloneData;
}

function renameFiles(files) {
  return Promise.all(
    files.map((file, index) => {
      let newFileIndex = index + 1;

      if (1 <= newFileIndex && newFileIndex <= 9) {
        newFileIndex = '00' + newFileIndex;
      } else if (10 <= newFileIndex && newFileIndex <= 99) {
        newFileIndex = '0' + newFileIndex;
      }

      return new Promise((resolve, reject) => {
        const oldPathName = FOLDER_PATH + '/' + file.fileName;
        const newPathName = FOLDER_PATH + '/' + NEW_FILE_NAME + ' ' + newFileIndex;
        fs.rename(oldPathName, newPathName, () => resolve(newPathName));
      });
    })
  );
}

async function rename() {
  const args = process.argv.slice(2);
  const folderPath = args[0];
  const newFileName = args[1];

  if (!folderPath || !newFileName)
    return console.error(
      `
        Status folder path: ${!folderPath ? 'empty' : folderPath} \n 
        Status new name: ${!newFileName ? 'empty' : newFileName}
      `
    );

  // Save those value to global
  FOLDER_PATH = folderPath;
  NEW_FILE_NAME = newFileName;

  const result = await readDir(folderPath);

  if (!result) return console.error('Get file from folder fail');

  const listFileWithSize = getFileSize(result);

  const sortedFiles = sortData(listFileWithSize);

  const finalResult = await renameFiles(sortedFiles);

  if (finalResult.length > 0) return console.info('RENAME SUCCESS');
  else return console.error('RENAME ERROR');
}

// Start
rename();
