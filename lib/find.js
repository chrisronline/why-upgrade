import Promise from 'bluebird'
import github from './util/github'
import config from '../config.json'
import getManager from './managers'

const getTreeAsync = Promise.promisify(github.gitdata.getTree)
const getContentAsync = Promise.promisify(github.repos.getContent)

const findPackagesInFileList = (list) => {
  return list.filter(file => !!getManager(file.name))
}

export default async () => {
  const packages = []
  const repos = config.github.repos
  for (let repoDetails of repos) {
    const { user, repo, paths } = repoDetails
    // Fetch the contents and extract the package files
    console.log('Fetching tree for %s', repo)
    const { tree } = await getTreeAsync({ user, repo, sha: 'HEAD', recursive: true })
    for (let file of tree) {
      for (let repoPath of paths) {
        if (file.path === repoPath && file.type === 'tree') {
          console.log('Getting content for %s', file.path)
          const fileList = await getContentAsync({ user, repo, path: file.path })
          // To make subsequent github calls, we need the user and repo attached to the object
          const packageList = findPackagesInFileList(fileList).map(pkg => Object.assign({}, pkg, { user, repo }))
          packages.push(...packageList)
        }
      }
    }
  }
  console.log('Found %d package(s)', packages.length)
  return packages
}