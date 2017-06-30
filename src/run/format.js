import prettier from 'prettier'
import chalk from 'chalk'
import glob from 'glob'
import path from 'path'
import fs from 'fs'
import { log } from '../util/log'
import eslintConfig from '../javascript-eslintrc.json'

const getUserPrettierOptions = projectPath => {
  const projectEslintrcPath = path.join(projectPath, '.eslintrc')
  const eslintrc = JSON.parse(fs.readFileSync(projectEslintrcPath, 'utf8'))
  const prettierRulesKey = 'prettier/prettier'

  if (
    eslintrc.rules &&
    Array.isArray(eslintrc.rules[prettierRulesKey]) &&
    eslintrc.rules[prettierRulesKey][1]
  ) {
    return { ...eslintrc.rules[prettierRulesKey][1] }
  } else {
    return {}
  }
}

const prettierOptions = eslintConfig.rules['prettier/prettier'][1]

export default saguiConfig =>
  new Promise((resolve, reject) => {
    log('Formatting files...')

    try {
      const files = [
        ...glob.sync(path.join(saguiConfig.projectPath, 'sagui.config.js')),
        ...glob.sync(path.join(saguiConfig.projectPath, 'src/**/*.{js,jsx,es6}')),
      ]

      const formatted = files
        .map(file => {
          const original = fs.readFileSync(file).toString()
          const formatted = prettier.format(original, {
            ...prettierOptions,
            ...getUserPrettierOptions(saguiConfig.projectPath),
          })

          return [file, original, formatted]
        })
        .filter(([file, original, formatted]) => {
          const changed = original.indexOf(formatted)
          const color = changed ? chalk.green : chalk.dim
          const relativePath = path.relative(saguiConfig.projectPath, file)

          console.log(color(relativePath))
          return changed
        })

      formatted.forEach(([file, original, formatted]) => fs.writeFileSync(file, formatted))

      log(`Formatted ${formatted.length} files.`)

      resolve()
    } catch (error) {
      return reject(error)
    }
  })
