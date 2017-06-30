import { expect } from 'chai'
import loader from './style'
import actions from '../../actions'

describe('style', function() {
  const projectPath = '/tmp/test-project'

  it('should have css modules enabled by default', () => {
    const config = loader.configure({ projectPath })

    expect(config.module.rules[0].loader.includes('css-loader?modules')).to.eql(true)
    expect(config.module.rules[1].loader.includes('css-loader?modules')).to.eql(true)
  })

  it('should be possible to disable css modules', () => {
    const config = loader.configure({ projectPath, style: { cssModules: false } })

    expect(config.module.rules[0].loader.includes('css-loader?modules')).to.eql(false)
    expect(config.module.rules[1].loader.includes('css-loader?modules')).to.eql(false)
  })

  it('should have source maps disabled by default', () => {
    const config = loader.configure({ projectPath })

    expect(config.module.rules[0].loader.includes('sourceMap')).to.eql(false)
    expect(config.module.rules[1].loader.includes('sourceMap')).to.eql(false)
  })

  it('should be possible to enable source maps', () => {
    const config = loader.configure({ projectPath, style: { sourceMaps: true } })

    expect(config.module.rules[0].loader.includes('sourceMap')).to.eql(true)
    expect(config.module.rules[1].loader.includes('sourceMap')).to.eql(true)
  })

  describe('extract text webpack plugin', () => {
    it('should be disabled by default', () => {
      const config = loader.configure({ projectPath })

      expect(config.module.rules[0].loader.includes('css-loader')).to.eql(true)
      expect(config.module.rules[1].loader.includes('css-loader')).to.eql(true)
    })

    it('should be disabled on building NOT pages', () => {
      const config = loader.configure({ projectPath, action: actions.BUILD })

      expect(config.module.rules[0].loader.includes('css-loader')).to.eql(true)
      expect(config.module.rules[1].loader.includes('css-loader')).to.eql(true)
    })

    it('should be enabled on building pages', () => {
      const config = loader.configure({ projectPath, action: actions.BUILD, pages: ['index'] })

      expect(
        config.module.rules[0].loader.find(loaderWithName('extract-text-webpack-plugin'))
      ).to.be.an('object')
      expect(
        config.module.rules[1].loader.find(loaderWithName('extract-text-webpack-plugin'))
      ).to.be.an('object')
    })

    it('should be possible to disable it even when it should be enabled on building pages', () => {
      const config = loader.configure({
        projectPath,
        action: actions.BUILD,
        pages: ['index'],
        style: { extract: false },
      })

      expect(config.module.rules[0].loader.includes('css-loader')).to.eql(true)
      expect(config.module.rules[1].loader.includes('css-loader')).to.eql(true)
    })
  })

  describe('while running the tests', () => {
    it('should be a null loader for better performance', () => {
      const config = loader.configure({ action: actions.TEST_UNIT })

      expect(config.module.rules[0].loader).to.eql('null-loader')
      expect(config.module.rules[1].loader).to.eql('null-loader')
    })
  })
})

const loaderWithName = name => loader => loader.loader.indexOf(name) !== -1
