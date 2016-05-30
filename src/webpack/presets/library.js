import { join } from 'path'

export default {
  name: 'library',
  configure ({ library, projectPath, buildTarget }) {
    if (!library) { return {} }

    const externals = probeExternals(projectPath)

    return {
      entry: './index.js',
      output: {
        path: join(projectPath, 'build'),
        filename: 'index.js',
        libraryTarget: buildTarget === 'test' ? undefined : 'commonjs2',
        library
      },
      externals: buildTarget === 'test' ? [] : externals
    }
  }
}

function probeExternals (projectPath) {
  const projectPackageJSON = require(join(projectPath, 'package.json'))
  return Object.keys(projectPackageJSON.peerDependencies || {})
}
