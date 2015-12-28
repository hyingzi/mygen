import co from 'co'
import actions from './actions'
import commander from 'commander'

let isHelp = process.argv.length === 2

commander
  .usage('<command>')
  .version(require('../package.json').version)

for (let key in actions) {
  let action = actions[key]

  if(key === 'init'){
    continue
  }

  if(action.options){
    commander.command(key, action.description, action.options).action((...args) => {
      co(function *(){
        yield actions.init.apply(action)
        yield action.callback.apply(action, args)
      }).catch(onerror)
    })
  }else{
    commander.command(key).description(action.description).action((...args) => {
      co(function *(){
        yield actions.init.apply(action)
        yield action.callback.apply(action, args)
      }).catch(onerror)
    })
  }
}

commander[!isHelp ? 'parse' : 'help'](!isHelp ? process.argv : '')

function onerror(err){
  console.error(err.stack)
}
