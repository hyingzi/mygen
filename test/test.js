import co from 'co'
import {join} from 'path'
import assert from 'assert'
import helper from '../dist/helper'

describe('helper', function(){
  let fileName, content, foldersName, subfoldersNames, zipName, url

  this.timeout(0)

  before(() => {
    content = 'test'
    fileName = '.genrc'
    zipName = 'master.zip'
    foldersName = 'generator',
    subfoldersNames = ['a', 'b', 'c']
    url = 'https://github.com/2046/generator/archive/master.zip'
  })

  after(() => {
    url = ''
    zipName = ''
    content = ''
    fileName = ''
    foldersName = ''
    subfoldersNames = []
  })

  function onerror(err){
    console.error(err.stack)
  }

  it('writeFile', (done) => {
    co(function *(){
      assert.equal(yield helper.writeFile(fileName, content), fileName)
    }).then(done, onerror)
  })

  it('readFile', (done) => {
    co(function *(){
      assert.equal(yield helper.readFile(fileName), content)
    }).then(done, onerror)
  })

  it('writeFile override', (done) => {
    co(function *(){
      assert.equal(yield helper.writeFile(fileName, (content  = 'test2'), true), fileName)
    }).then(done, onerror)
  })

  it('unlink', (done) => {
    co(function *(){
      assert.equal(yield helper.unlink(fileName), true)
    }).then(done, onerror)
  })

  it('mkdir', (done) => {
    co(function *(){
      assert.equal(yield helper.mkdir(foldersName), foldersName)
    }).then(done, onerror)
  })

  it('readdir', (done) => {
    co(function *(){
      for(let item of subfoldersNames){
        yield helper.mkdir(join(foldersName, item))
      }

      for (let item of yield helper.readdir(foldersName)){
        assert.notEqual(subfoldersNames.indexOf(item), -1)
      }
    }).then(done, onerror)
  })

  it('rmdir', (done) => {
    co(function *(){
      assert.equal(yield helper.rmdir(foldersName), true)
    }).then(done, onerror)
  })

  it('download', (done) => {
    co(function *(){
      assert.equal(yield helper.download(url, false), zipName)
    }).then(done, onerror)
  })

  it('unzip', (done) => {
    co(function *(){
      assert.equal(yield helper.unzip(zipName, 'temp'), 'temp')
    }).then(done, onerror)
  })

  it('move', (done) => {
    co(function *(){
      assert.equal(yield helper.move('temp/generator-master', yield helper.mkdir('generator')), true)

      yield helper.rmdir('temp')
      yield helper.unlink('master.zip')
    }).then(done, onerror)
  })

  it('copy', (done) => {
    co(function *(){
      assert.equal(yield helper.copy('generator/test', 'demo'), true)

      yield helper.rmdir('demo', 'generator')
    }).then(done, onerror)
  })
})
