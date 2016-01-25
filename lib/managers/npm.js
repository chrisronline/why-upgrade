import Promise from 'bluebird'
import shell from 'shelljs'
import semver from 'semver'
import github from '../util/github'

const getContentAsync = Promise.promisify(github.repos.getContent)
const execAsync = Promise.promisify(shell.exec)

// git://github.com/isaacs/rimraf.git
const gitUrlDetailsRegEx = /.*\/([^\/]+)\/([^\/]+).git/

async function fetchChangelog (dependencyName, pkg) {
  const cmd = 'npm view --registry=http://npm.thorhudl.com ' + dependencyName + ' repository.url'
  const gitUrl = (await execAsync(cmd, { silent: true })).trim()
  const matches = gitUrlDetailsRegEx.exec(gitUrl)
  const [ user, repo ] = matches.slice(1, 3)
  const path = 'CHANGELOG.md'
  
  console.log('Fetching changelog from %s', repo)
  // console.log('Fetching %s repo from %s using %s', repo, user, path)
  const content = await getContentAsync({ user, repo, path })
  const changelog = new Buffer(content.content, 'base64').toString()
  console.log('changelog=%s', changelog)
}

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
        
    if (semver.gtr(latestVersion, dependencyVersion)) {
      console.log('Update available for %s', dependencyName)
      try {
        const changelog = await fetchChangelog(dependencyName, pkg)
      }
      catch (e) {
        console.warn('warning: ', e)
      }
    }
  }
  
  // console.log(dependencies) 
}

export default npmManager