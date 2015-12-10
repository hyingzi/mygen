import actions from './actions'
import commander from 'commander'

let isHelp = process.argv.length === 2

commander
  .usage('<command>')
  .version(require('../package.json').version)

for (let action of actions) {
  if(action.options){
    commander.command(action.name, action.description, action.options).action(action.callback)
  }else{
    commander.command(action.name).description(action.description).action(action.callback)
  }
}

commander[!isHelp ? 'parse' : 'help'](!isHelp ? process.argv : '')
