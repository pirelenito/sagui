import eslint from 'eslint'
import { logError, log } from '../util/log'

export default ({ projectPath }) => new Promise((resolve, reject) => {
  const cli = new eslint.CLIEngine({
    cwd: projectPath,
    extensions: ['.js', '.jsx', '.es6']
  })

  const report = cli.executeOnFiles([projectPath])
  const formatter = cli.getFormatter()

  if (report.errorCount > 0) {
    logError('Lint failed:')
    console.log(formatter(report.results))
    reject()
  } else {
    log('Lint completed without errors.')
    resolve()
  }
})
