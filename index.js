import find from './lib/find'
import getManager from './lib/managers'

async function run() {
  const packages = await find()
    
  for (let pkg of packages) {
    const manager = getManager(pkg.name)
    const updates = await manager.getUpdates(pkg)
  }
  
  return 'Done'
}

run()
