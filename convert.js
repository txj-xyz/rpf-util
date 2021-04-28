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
  const outputsubFolder = `${outputPath}\\${inputPath.split('\\')[inputPath.split('\\').length - 2]}\\${inputPath.match(/[^\\]*\.(\w+)$/g).toString()}\\`
  // console.log(`${outputPath}\\${inputPath.split('\\')[inputPath.split('\\').length - 2]}\\${inputPath.match(/[^\\]*\.(\w+)$/g).toString()}\\`)
  exec(`./tools/GTAUtil.exe`, ['extractarchive',`-i`,[inputPath],'-o',[outputsubFolder] ], function(err, data, pgmerr) {  
    if(err) {
      return console.log(err ?? "", data, pgmerr)
    } else {
      console.log(err ?? "", data, pgmerr)
    }
  })
}

if(!process.argv) {
  return console.log('node .\\convert.js .\\inputFolderDirectPath\\ .\\outputFolderDirectPath\\\n\nIf you do not provide an output folder then the program will make a folder named `rpf-extract`')
}
if(!process.argv[2]){
  return console.log('node .\\convert.js .\\inputFolderDirectPath\\ .\\outputFolderDirectPath\\\n\nIf you do not provide an output folder then the program will make a folder named `rpf-extract`')
}

if(!process.argv[3]){
  outputFolder = '.\\rpf-extract'
  fs.access(outputFolder, function(error) {
    if (error) {
      fs.mkdirSync('rpf-extract')
      outputFolder = '.\\rpf-extract';
    }
  })
} else { outputFolder = process.argv[3]; }
// console.log(process.argv)
getFiles(process.argv[2]).then(allFiles => {
  convertedFileCount = 0
  allFiles.forEach(file => {
      if(file.endsWith('.rpf'))
      GTAUtil(file, outputFolder)
      console.log(`Done, Converted ${convertedFileCount} files.`);
      // console.log(file.match(/[^\\]*\.(\w+)$/g).toString());
      // file.match(/[^\\]*\.(\w+)$/g).toString().slice(0, -4)
  });
})