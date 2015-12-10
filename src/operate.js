import fs from 'fs'
import mv from 'mv'
import ncp from 'ncp'
import extract from 'unzip'
import request from 'request'
import ProgressBar from 'progress'
import {join, parse, isAbsolute} from 'path'

export let file = {
  create(path = '', content, override) {
    path = toAbsolutePath(path)

    if(!fs.existsSync(path) || override){
      fs.writeFileSync(path, content, 'utf8');
    }
  },
  read(path = '') {
    path = toAbsolutePath(path)

    if(fs.existsSync(path)){
      return fs.readFileSync(path, 'utf8')
    }
  },
  update(path = '', content) {
    this.create(path, content, true)
  },
  delete(path = '') {
    path = toAbsolutePath(path)

    if(fs.existsSync(path)){
      fs.unlinkSync(path)
    }
  }
}

export let folders = {
  create(path = '') {
    path = toAbsolutePath(path)

    if(!fs.existsSync(path)){
      fs.mkdirSync(path)
    }
  },
  read(path = '') {
    let set = new Set()

    path = toAbsolutePath(path)

    if(fs.existsSync(path)){
      fs.readdirSync(path).map(item => {
        if(fs.lstatSync(join(path, item)).isDirectory() && !join(path, item).includes('.')){
          set.add(item)
        }
      })
    }

    return set
  },
  delete(path = '') {
    path = toAbsolutePath(path)

    if(fs.existsSync(path)){
      deleteFolders(path)
    }
  }
}

export let download = function(url, callback){
  request(url).on('response', function(res){
    let total, progress, path

    total = parseInt(res.headers['content-length'], 10)

    if(isNaN(total)){
      callback(new Error('can not find the remote file'))
      return
    }

    path = toAbsolutePath(parse(url).base)

    progress = new ProgressBar('Downloading... [:bar] :percent :etas', {
      complete : '=',
      incomplete : ' ',
      total : total
    })

    res.on('data', function(chunk){
      progress.tick(chunk.length)
    }).pipe(fs.createWriteStream(path))

    res.on('end', function(){
      progress.tick(progress.total - progress.curr)
      callback(null, path)
    })
  })
}

export let unzip = function(filePath, foldersPath, callback){
  filePath = toAbsolutePath(filePath)
  foldersPath = toAbsolutePath(foldersPath)

  fs.createReadStream(filePath).on('end', function(){
    setTimeout(function(){
      callback(null, foldersPath)
    }, 100)
  }).pipe(extract.Extract({path : foldersPath}))
}

export let move = function(srcPath, distPath, callback){
  srcPath = toAbsolutePath(srcPath)
  distPath = toAbsolutePath(distPath)

  if(!fs.existsSync(srcPath)){
    callback(new Error('Source directory does not exist'))
    return
  }

  if(!fs.existsSync(distPath)){
    callback(new Error('Target directory does not exist'))
    return
  }

  mv(srcPath, distPath, {mkdirp:false}, function(err){
    callback(err)
  })
}

export let copy = function(srcPath, distPath, callback){
  srcPath = toAbsolutePath(srcPath)
  distPath = toAbsolutePath(distPath)

  if(!fs.existsSync(srcPath)){
    callback(new Error('Source directory does not exist'))
    return
  }

  if(!fs.existsSync(distPath)){
    callback(new Error('Target directory does not exist'))
    return
  }

  ncp.ncp.limit = 16
  ncp.ncp(srcPath, distPath, function(err){
    callback(err)
  })
}

function toAbsolutePath(path){
  return isAbsolute(path) ? path : join(__dirname, '/../', path)
}

function deleteFolders(path) {
  fs.readdirSync(path).map(item => {
    item = path + '/' + item

    if(fs.lstatSync(item).isDirectory()){
      deleteFolders(item)
    }else{
      fs.unlinkSync(item)
    }
  })

  fs.rmdirSync(path)
}
