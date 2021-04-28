# rpf-util
This is a windows only tool for Node.JS to use GTAUtil and convert RPFs in bulk

# Usage / Installation
To use this script, just provide an input rpf and an output folder for the script to convert.
Anything inside [] = optional value

### General Usage:
```
node .\convert.js
```
### Convert Folder
```
node .\convert.js .\inputFolderDirectPath\ [.\outputFolderDirectPath\]
```

### Convert into a car resource
```
node .\convert.js [cars] [.\convert-folder\] [.\output_folder\]
```


If there is not an output folder specified the program will make a new folder named `rpf-convert`

