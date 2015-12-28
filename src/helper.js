import mv from 'mv'
import _fs from 'fs'
import ncp from 'ncp'
import fs from 'co-fs'
import extract from 'unzip'
import request from 'request'
import {join, parse} from 'path'
import ProgressBar from 'progress'

export default {
  *writeFile (path = '', content = '', override){

    if(!(yield fs.exists(path)) || override){
      if(typeof content === 'object'){
        content = JSON.stringify(content)
      }

      yield fs.writeFile(path, content, 'utf8')
    }

    return path
  },
  *readFile (path = '', content = ''){
    if(yield fs.exists(path)){
      content = yield fs.readFile(path, 'utf8')
    }

    return content
  },
  *unlink (...paths){
    for(let path of paths){
      if(yield fs.exists(path)){
        yield fs.unlink(path)
      }
    }

    return true
  },
  *mkdir (path = ''){
    if(!(yield fs.exists(path))){
      yield fs.mkdir(path)
    }

    return path
  },
  *readdir (path = '', result = []){
    if(yield fs.exists(path)){
      for(let item of yield fs.readdir(path)){
        let tmp = join(path, item)

        if((yield fs.lstat(tmp)).isDirectory() && !tmp.includes('.')){
          result.push(item)
        }
      }
    }

    return result
  },
  *rmdir (...paths){
    for(let path of paths){
      if(yield fs.exists(path)){
        for(let item of yield fs.readdir(path)){
          let tmp = join(path, item)

          if((yield fs.lstat(tmp)).isDirectory()){
            yield this.rmdir(tmp)
          }else{
            yield this.unlink(tmp)
          }
        }

        yield fs.rmdir(path)
      }
    }

    return true
  },
  *download (url = '', showProgress = true){
    return new Promise(function(resolve, reject){
      request(url).on('response', function(res){
        let total, progress, path

        path = parse(url).base
        total = parseInt(res.headers['content-length'], 10)

        if(isNaN(total)){
          reject(new Error('can not find the remote file'))
          return
        }

        if(showProgress){
          progress = new ProgressBar('Downloading... [:bar] :percent :etas', {
            complete : '=',
            incomplete : ' ',
            total : total
          })
        }
        
        res.on('data', function(chunk){
          showProgress && progress.tick(chunk.length)
        }).pipe(_fs.createWriteStream(path))

        res.on('end', function(){
          showProgress && progress.tick(progress.total - progress.curr)
          resolve(path)
        })
      })
    })
  },
  *unzip (filePath = '', foldersPath = ''){
    return new Promise((resolve, reject) => {
      _fs.createReadStream(filePath).on('end', function(){
        setTimeout(() => {
          resolve(foldersPath)
        }, 100)
      }).pipe(extract.Extract({path : foldersPath}))
    })
  },
  *move (srcPath = '', distPath = ''){
    return new Promise((resolve, reject) => {
      mv(srcPath, distPath, {mkdirp:false}, function(err){
        if(err){
          reject(err)
        }

        resolve(true)
      })
    })
  },
  *copy (srcPath = '', distPath = ''){
    ncp.ncp.limit = 16

    return new Promise((resolve, reject) => {
      ncp.ncp(srcPath, distPath, function(err){
        if(err){
          reject(err)
        }

        resolve(true)
      })
    })
  }
}
