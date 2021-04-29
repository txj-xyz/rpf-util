const exec = require('child_process').execFile
const { promisify, isRegExp } = require('util');
const { resolve } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
let foundMatchFiles = new Array();

const { cwd } = process;

fs.access(`.\\rpf-extract\\stream\\`, function(error) {
  if (error) {
    fs.mkdir(`.\\rpf-extract\\stream\\`, (e)=>{e ? console.log(e): null})
  }
})
fs.access(`.\\rpf-extract\\meta\\`, function(error) {
  if (error) {
    fs.mkdir(`.\\rpf-extract\\meta\\`, (e)=>{e ? console.log(e): null})
  }
})

const singleSlashify = (str) =>
  (str
    .replace(/(\\+)/g, '\\')
    .replace(/(\/+)/g, '/'));

const getFiles = async function(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(
    subdirs.map(async (subdir) => {
    const res = resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []);
}

const GTAUtil = function(inputPath, outputPath){
  const carsExtractFolderConvert = `.\\rpf-extract\\meta\\${inputPath.split('\\')[inputPath.split('\\').length - 2]}`
  exec('./tools/GTAUtil.exe', [
    'extractarchive',
    `-i`, [inputPath], // input
    '-o', [carsExtractFolderConvert] // output
  ], (err, data, pgmerr) => {
    if (err) {
      return console.log(err ?? pgmerr);
    }

    const x = inputPath.split('\\')[inputPath.split('\\').length - 2];
    const yes = data.split('\n');
    console.log(yes, "--->", x)
    for (const dat of yes) {
      MoveAllFiles('.\\rpf-extract\\meta\\', dat.trim(), inputPath.trim());
      // CleanUpFiles('.\\rpf-extract\\meta\\', dat.trim(), inputPath.trim());
    }

    // console.log(`\nDone something with ${yes.length} files`);

    // '.\\rpf-extract\\stream\\'+inputPath.split('\\')[inputPath.split('\\').length - 2]
    // '.\\rpf-extract\\meta\\'+inputPath.split('\\')[inputPath.split('\\').length - 2]
  });
}

const extMap = [
  {
    extensions: [ '.meta', '.xml' ],
    pathSuffix: 'meta'
  },
  {
    extensions: [ '.ytd', '.yft' ],
    pathSuffix: 'stream'
  }
];

const modelNames = [];

// const CleanUpFiles = (inputPath) => {
//   // const [, main] = inputPath.split(/(\.\\.+)\\.+/g);
//   console.log('WOAH INCOMING: ' + inputPath)
//   fs.unlink()
// }


const MoveAllFiles = (inputPath, fileName, fullFilePath) => {
  const [, main] = inputPath.split(/(\.\\.+)\\.+/g);
  const [, modelName] = fullFilePath.endsWith('.rpf')
    ? fullFilePath.split(/.+\\(.+)\\dlc\.rpf$/g)
    : [];

  // console.log(`fname: ${fileName}`);
  const tempSplit = fileName.split(/.+(\\|\/)(.+)$/g).slice(1);
  const [, actualFileName] = tempSplit;

  if (!modelNames.find(x => x === modelName)) {
    modelNames.push(modelName);
  }

  const pathRegex = /[^\\]*\.(\w+)$/g;
  const fullFilePath_formatted = fullFilePath.match(pathRegex).toString();
  //console.log(`${modelName}${fileName || 'nofink'}`);

  for (const value of extMap) {
    for (const extension of (value?.extensions ?? [])) {
      if (fileName.endsWith(extension)) {

        foundMatchFiles.push(fullFilePath);
        try {
          fs.mkdirSync(`.\\rpf-extract\\stream\\${modelName}`, ()=>{})
        } catch(e) {
          // dir already exists
        }
        
        const init = singleSlashify(`${cwd()}${inputPath.slice(1)}${modelName}${fileName}`);

        // ex.
        // .\rpf-extract\stream
        const to = singleSlashify(`${cwd()}${main.slice(1)}\\${value.pathSuffix}\\${modelName}\\${actualFileName}`);

        // console.log('\n');
        // console.log(`Moving \x1b[31m${init}\x1b[0m to \x1b[31m${to}\x1b[0m`);

        fs.rename(
          init,
          to,
          () => {
            // console.log(`\nMoving \x1b[31m${init}\x1b[0m to \x1b[31m${to}\x1b[0m`);
          }
        );
      }
    }
  }
}

getFiles('.\\convert-folder\\').then(allFiles => {
  allFiles.forEach(file => {
      if (file.endsWith('.rpf')) {
        GTAUtil(file, '.\\rpf-extract');
      }
  });
});