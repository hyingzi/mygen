import helper from './helper'

let fileName, foldersName

fileName = '.genrc'
foldersName = 'generator'

export default {
  *init() {
    yield helper.mkdir(foldersName)
    yield helper.writeFile(fileName, {
      github : null,
      staticFile : 'http://www.staticfile.org'
    })
  },
  'clear' : {
    description : 'Clear generator',
    *callback() {
      yield helper.rmdir(foldersName)
    }
  },
  'install' : {
    description : 'Install generator',
    *callback() {
      let obj, url, zipName

      obj = unserialize(yield helper.readFile(fileName))
      url = `https://github.com/${obj.github}/generator/archive/master.zip`

      yield helper.unzip(zipName = yield helper.download(url), 'temp')
      yield helper.move('temp/generator-master', foldersName)
      yield helper.unlink(zipName)
      yield helper.rmdir('temp')
    }
  },
  'get' : {
    description : 'Get the config value',
    *callback(key) {
      if(isString(key)){
        let obj = unserialize(yield helper.readFile(fileName))
        console.log(`${obj[key]}\n`)
      }
    }
  },
  'set' : {
    description : 'Set the config value',
    *callback(key, value) {
      if(isString(key) && isString(value)){
        let obj = unserialize(yield helper.readFile(fileName))

        yield helper.writeFile(fileName, Object.assign(obj, {
          [key] : value
        }), true)
      }
    }
  },
  'config' : {
    description : 'Output the config value',
    *callback() {
      let obj, result

      result = []
      obj = unserialize(yield helper.readFile(fileName))

      for(let key in obj){
        result.push(`${key} = ${obj[key]}\n`)
      }

      console.log(result.join(''))
    }
  },
  'list' : {
    description : 'Output the generator available',
    *callback() {
      let result = []

      for(let item of yield helper.readdir(foldersName)){
        result.push(`${item}\n`)
      }

      console.log(result.join(''))
    }
  },
  '*' : {
    options : {
      noHelp : true
    },
    description : 'Generator App',
    *callback(cmd) {
      yield helper.copy(`${foldersName}/${cmd}`, process.cwd())
      console.log('Bingo!\n')
    }
  }
}

function isString(obj){
  return typeof obj === 'string'
}

function unserialize(str){
  return JSON.parse(str)
}
