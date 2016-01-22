import Promise from 'bluebird'
import shell from 'shelljs'
import semver from 'semver'
import github from '../util/github'

const getContentAsync = Promise.promisify(github.repos.getContent)
const execAsync = Promise.promisify(shell.exec)

const npmManager = {}

npmManager.isPackageFile = (file) => file === 'package.json'
npmManager.getUpdates = async (pkg) => {
  // Fetch the contents
  const { user, repo, path } = pkg
  const content = await getContentAsync({ user, repo, path })
  const json = JSON.parse(new Buffer(content.content, 'base64').toString())
  const dependencies = json.dependencies
  
  // Get the info for each dependency
  for (let dependencyName in dependencies) {
    const dependencyVersion = dependencies[dependencyName]
    
    const rawVersion = await execAsync('npm view --registry=http://npm.thorhudl.com ' + dependencyName + ' version', { silent: true })
    const latestVersion = semver.clean(rawVersion)
    
    console.log('here', dependencyVersion, semver.clean(dependencyVersion))
    try {
      if (semver.compare(latestVersion, dependencyVersion)) {
        console.log('update available for ', dependencyName)
      }
    }
    catch (e) {
      console.warn(e)
    }
    
    // info = info.substr(0, info.length - 1)
    
    console.log(dependencyName, dependencyVersion, latestVersion)
    
    
    // info = info.substr(1)
    // console.log('info="' + info + '"')
  }
  
  // console.log(dependencies) 
}

export default npmManager