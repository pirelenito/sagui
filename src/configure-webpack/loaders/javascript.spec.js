import path from 'path'
import { expect } from 'chai'
import loader from './javascript'

describe('javaScript', () => {
  const projectPath = '/tmp/test-project'

  it('should lint the code by using eslint', () => {
    const projectPath = 'a/demo/path'
    const webpack = loader.configure({ projectPath })

    expect(webpack.module.rules[0].loader).to.eql('eslint-loader')
    expect(webpack.module.rules[0].enforce).to.eql('pre')
  })

  it('should only build files inside the src folder by default', () => {
    const webpack = loader.configure({ projectPath })
    const excludeCheck = webpack.module.rules[1].exclude

    expect(excludeCheck).to.eql(/node_modules/)
  })

  it('should include the user defined dependencies to be built', () => {
    const config = {
      projectPath,
      javaScript: {
        transpileDependencies: [
          // an example project
          'ui-react-components',
        ],
      },
    }

    const webpack = loader.configure(config)
    const excludeCheck = webpack.module.rules[1].exclude

    const srcFile = path.join(projectPath, 'src/index.js')
    const nodeModulesFile = path.join(projectPath, 'node_modules/batata/index.js')
    const transpiledDependency = path.join(projectPath, 'node_modules/ui-react-components/index.js')

    expect(excludeCheck(srcFile)).to.eql(false)
    expect(excludeCheck(transpiledDependency)).to.eql(false)
    expect(excludeCheck(nodeModulesFile)).to.eql(true)
  })
})
