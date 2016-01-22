import GitHubApi from 'github'
import config from '../../config.json'

const github = new GitHubApi({ version: '3.0.0' })
github.authenticate(config.github.authenticate)

export default github