import { HotModuleReplacementPlugin } from 'webpack'
import path from 'path'
import reactTransform from 'babel-plugin-react-transform'
import istanbul from 'babel-plugin-istanbul'
import { expect } from 'chai'
import loader from './javascript'
import fileExtensions from '../../file-extensions'
import actions from '../../actions'

describe('javaScript', () => {
  const projectPath = '/tmp/test-project'

  it('should only build files inside the src folder by default', () => {
    const webpack = loader.configure({ projectPath })
    expect(webpack.module.loaders[0].include).to.eql([path.join(projectPath, 'src')])
  })

  it('should include the user defined dependencies to be built', () => {
    const config = {
      projectPath,
      javaScript: {
        transpileDependencies: [
          // an example project
          'ui-react-components'
        ]
      }
    }

    const webpack = loader.configure(config)
    expect(webpack.module.loaders[0].include).to.eql([
      path.join(projectPath, 'src'),
      path.join(projectPath, 'node_modules', 'ui-react-components')
    ])
  })

  it('should disable compact mode (enabling it breaks source maps)', () => {
    const webpack = loader.configure({ projectPath })
    expect(getBabelLoaderQuery(webpack).compact).to.eql(false)
  })

  it(`should resolve JavaScript files (${fileExtensions.list.JAVASCRIPT})`, function () {
    const webpack = loader.configure({ projectPath })
    expect(webpack.resolve.extensions).to.eql(fileExtensions.list.JAVASCRIPT)
  })

  it('should not setup any babel plugin by default', () => {
    const webpack = loader.configure({ projectPath })
    expect(getBabelLoaderQuery(webpack).plugins).to.eql([])
  })

  it('should not setup any HMR plugin by default', () => {
    const webpack = loader.configure({ projectPath })

    const plugins = webpack.plugins.filter((plugin) => plugin instanceof HotModuleReplacementPlugin)
    expect(plugins.length).equal(0)
  })

  describe('HMR', () => {
    it('should setup react transform babel plugin if action is develop', () => {
      const webpack = loader.configure({ projectPath, action: actions.DEVELOP })
      expect(getBabelLoaderQuery(webpack).plugins[0][0]).to.equal(reactTransform)
    })

    it('should setup the HotModuleReplacementPlugin if action is develop', () => {
      const webpack = loader.configure({ projectPath, action: actions.DEVELOP })

      const plugins = webpack.plugins.filter((plugin) => plugin instanceof HotModuleReplacementPlugin)
      expect(plugins.length).equal(1)
    })
  })

  describe('code coverage instrumentation', () => {
    it('should setup istanbul babel plugin ignoring test files if action is test and coverage is enabled', () => {
      const webpack = loader.configure({ projectPath, action: actions.TEST_UNIT, coverage: true })

      expect(getBabelLoaderQuery(webpack).plugins[0][0]).to.equal(istanbul)
      expect(getBabelLoaderQuery(webpack).plugins[0][1]).to.eql({
        exclude: [
          '**/*.spec.*',
          '**/node_modules/**/*'
        ]
      })
    })

    it('should NOT setup istanbul babel plugin if action is test and coverage is disabled', () => {
      const webpack = loader.configure({ projectPath, action: actions.TEST_UNIT })
      expect(getBabelLoaderQuery(webpack).plugins).to.eql([])
    })
  })
})

const getBabelLoaderQuery = (config) => config.plugins
  .find((plugin) => plugin.name === 'HappyPack')
  .config.loaders[0].query
