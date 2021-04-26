const exec = require('child_process').execFile
const { promisify, isRegExp } = require('util');
const { resolve } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const getFiles = async function(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []);
}

const GTAUtil = function(inputPath, outputPath){
   exec(`GTAUtil.exe extractarchive --input ${inputPath} --output ${outputPath}`, function(err, data) {  
        if(err) return err
        if(!err) return data.toString()
    })
}

if(!process.argv) {
  return new Error('node ./convert.js inputFolder/ outputFolder/')
}
if(!process.argv[0]){
  return new Error('node ./convert.js inputFolderDirectPath/ inputFolderDirectPath/\n\nIf you do not provide an output folder then the program will make a folder named `rpf-extract`')
}

getFiles(process.argv[0]).then(allFiles => {
    allFiles.forEach(file => {
        if(file.endsWith('.rpf'))
        console.log(`Found RPF: ${file}`)
        if(!process.argv[1]){
          fs.mkdirSync('rpf-extract');
        }
        // file.match(/[^\\]*\.(\w+)$/g).toString().slice(0, -4)
        GTAUtil(file.match(/[^\\]*\.(\w+)$/g).toString(), process.argv[1] || './rpf-extract/')
    });
})
