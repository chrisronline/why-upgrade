import npm from './npm'
import nuget from './nuget'

export default (name) => {
  if (npm.isPackageFile(name)) return npm
  if (nuget.isPackageFile(name)) return nuget
}