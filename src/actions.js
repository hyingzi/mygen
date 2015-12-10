import {file, folders, download, unzip, move, copy} from './operate'

const genrcFileName = '.genrc'
const generatorFoldersName = 'generator'

folders.create(generatorFoldersName)
file.create(genrcFileName, JSON.stringify({
  github : null,
  staticFile : 'http://www.staticfile.org'
}))

export default new Set([
  {
    name : 'clear',
    description : 'Clear generator',
    callback : function (){
      folders.delete(generatorFoldersName)
    }
  },
  {
    name : 'install',
    description : 'Install generator',
    callback : function (){
      let content, url

      content = readGenrcFile()
      url = `https://github.com/${content.github}/generator/archive/master.zip`

      download(url, function(err, filePath){
        if(err){
          console.log(err.message)
          return
        }

        unzip(filePath, 'temp', function(err, foldersPath){
          move(`${foldersPath}/generator-master`, generatorFoldersName, function(err){
            file.delete(filePath)
            folders.delete(foldersPath)
          })
        })
      })
    }
  },
  {
    name : 'set',
    description : 'Set the config value',
    callback : function(key, value){
      if(typeof key === 'string' && typeof value === 'string'){
        let content = readGenrcFile()

        if(content.hasOwnProperty(key)){
          file.update(genrcFileName, JSON.stringify(Object.assign(content, {
            [key] : value
          })))
        }
      }
    }
  },
  {
    name : 'get',
    description : 'Get the config value',
    callback : function(key){
      if(typeof key === 'string'){
        let content = readGenrcFile()

        if(content.hasOwnProperty(key)){
          console.log(`${content[key]} \n`)
        }
      }
    }
  },
  {
    name : 'config',
    description : 'Output the config value',
    callback : function(){
      let content = readGenrcFile()

      for(let key in content){
        console.log(`${key} = ${content[key]}`)
      }
    }
  },
  {
    name : 'list',
    description : 'Output the generator available',
    callback : function(){
      for(let foldersName of folders.read(generatorFoldersName)){
        console.log(foldersName)
      }
    }
  },
  {
    name : '*',
    options : {
      noHelp : true
    },
    description : 'Generator App',
    callback : function(cmd){
      copy(`${generatorFoldersName}/${cmd}`, process.cwd(), function(err){
        if(err){
          console.log(err.message)
          return
        }

        console.log('done!')
      })
    }
  }
])

function readGenrcFile(){
  return JSON.parse(file.read(genrcFileName))
}
