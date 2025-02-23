import * as path from 'path'
import { runTests } from '@vscode/test-electron'

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../../')

    // The path to test runner
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, './suite/index')

    // Create a workspace folder for testing
    const testWorkspace = path.resolve(extensionDevelopmentPath, 'test-workspace')

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        testWorkspace,
        '--disable-extensions', // Disable other extensions
        '--disable-workspace-trust', // Disable workspace trust dialog
        '--enable-proposed-api=joshua-woolf.vscode-switch-workspace-to-directory', // Enable proposed API access for our extension
      ],
    })
  }
  catch (err) {
    console.error('Failed to run tests:', err)
    process.exit(1)
  }
}

main()
