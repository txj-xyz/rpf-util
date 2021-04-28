const exec = require('child_process').execFile
const { promisify, isRegExp } = require('util');
const { resolve } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
let outputFolder = '';
let convertedFileCount = 0;

const getFiles = async function(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []);
}

const GTAUtil = function(inputPath, outputPath){
  console.log('[DEBUG] Util function inputPath:', inputPath);
  console.log('[DEBUG] Util function outputPath:', outputPath);
  const extractFolderConvert = `${outputPath}${inputPath.split('\\')[inputPath.split('\\').length - 2]}\\${inputPath.match(/[^\\]*\.(\w+)$/g).toString()}\\`
  const carsExtractFolderConvert = `${outputPath}${inputPath.split('\\')[inputPath.split('\\').length - 2]}\\`
  console.log('[DEBUG] Util function 1:', extractFolderConvert);
  console.log('[DEBUG] Util function 2:', carsExtractFolderConvert);
  // exec(`./tools/GTAUtil.exe`, ['extractarchive',`-i`,[inputPath],'-o',[extractFolderConvert] ], function(err, data, pgmerr) {  
  //   if(err) {
  //     return console.log(err ?? "", data, pgmerr)
  //   } else {
  //     console.log(err ?? "", data, pgmerr)
  //   }
  // })
}

console.log('[DEBUG] ARGS:',process.argv)

if(process.argv[2] === 'cars'){
  // Set the output folder here and make the folder if not exist
  if(!process.argv[4]){
    outputFolder = '.\\rpf-extract'
    fs.access(outputFolder, function(error) {
      if (error) {
        fs.mkdirSync('rpf-extract')
        outputFolder = '.\\rpf-extract';
      }
    })
  } else { outputFolder = process.argv[4]; }

  getFiles(process.argv[3]).then(allFiles => {
    allFiles.forEach(file => {
        if(file.endsWith('.rpf'))
        GTAUtil(file, outputFolder)
    });
  })
} else if(process.argv[2].includes('.\\')){
  if(!process.argv[3]){
    outputFolder = '.\\rpf-extract'
    fs.access(outputFolder, function(error) {
      if (error) {
        fs.mkdirSync('rpf-extract')
        outputFolder = '.\\rpf-extract';
      }
    })
  } else { outputFolder = process.argv[3]; }
  getFiles(process.argv[2]).then(allFiles => {
    allFiles.forEach(file => {
        if(file.endsWith('.rpf'))
        GTAUtil(file, outputFolder)
    });
  })
} else {
  return console.log('Usage: node .\\convert.js [cars] .\\inputFolderDirectPath\\ [.\\outputFolderDirectPath\\]')
}

// Set the output folder here and make the folder if not exist
// if(!process.argv[3]){
//   outputFolder = '.\\rpf-extract'
//   fs.access(outputFolder, function(error) {
//     if (error) {
//       fs.mkdirSync('rpf-extract')
//       outputFolder = '.\\rpf-extract';
//     }
//   })
// } else { outputFolder = process.argv[3]; }