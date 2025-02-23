import * as assert from 'assert'
import * as vscode from 'vscode'
import { before, suite, test } from 'mocha'

// Define an interface for our extension's exports
interface ExtensionExports {
  activate: () => Promise<void>
  deactivate: () => void
}

const EXTENSION_ID = 'joshua-woolf.open-folder-from-context-menu'

suite('Extension Test Suite', () => {
  let extension: vscode.Extension<ExtensionExports> | undefined

  before(async () => {
    // The extension should be available because we're running in development mode
    extension = vscode.extensions.getExtension<ExtensionExports>(EXTENSION_ID)
    if (!extension) {
      throw new Error(`Extension ${EXTENSION_ID} not found`)
    }

    // Activate the extension if it's not already activated
    if (!extension.isActive) {
      await extension.activate()
    }

    vscode.window.showInformationMessage('Starting all tests.')
  })

  test('Extension should be present', () => {
    assert.ok(extension, 'Extension should be present')
  })

  test('Should register openFolder command', async () => {
    const commands = await vscode.commands.getCommands()
    assert.ok(
      commands.includes('open-folder-from-context-menu.openFolder'),
      'Command should be registered',
    )
  })

  test('Command should be available in explorer context menu', () => {
    assert.ok(extension, 'Extension should be present')
    const packageJSON = extension.packageJSON

    assert.ok(
      packageJSON.contributes.menus['explorer/context'].some(
        (item: { command: string }) => item.command === 'open-folder-from-context-menu.openFolder',
      ),
      'Command should be in explorer context menu',
    )
  })

  test('Should show error when no URI is provided', async () => {
    // Mock showErrorMessage to capture the error
    let errorMessage: string | undefined
    const showErrorMessage = vscode.window.showErrorMessage
    vscode.window.showErrorMessage = (message: string) => {
      errorMessage = message
      return Promise.resolve(undefined)
    }

    try {
      await vscode.commands.executeCommand('open-folder-from-context-menu.openFolder')
      assert.strictEqual(errorMessage, 'No folder selected.', 'Should show correct error message')
    }
    finally {
      // Restore original function
      vscode.window.showErrorMessage = showErrorMessage
    }
  })

  test('Should attempt to open folder when URI is provided', async () => {
    // Mock executeCommand to verify it's called with correct parameters
    let commandCalled = false
    let commandUri: vscode.Uri | undefined
    const executeCommand = vscode.commands.executeCommand

    // Type assertion to handle the mock implementation
    vscode.commands.executeCommand = (async <T>(command: string, ...args: unknown[]): Promise<T> => {
      if (command === 'vscode.openFolder') {
        commandCalled = true
        commandUri = args[0] as vscode.Uri
        return Promise.resolve(undefined as unknown as T)
      }
      // Properly type the return value from the original executeCommand
      return executeCommand.apply(vscode.commands, [command, ...args]) as Promise<T>
    }) as typeof vscode.commands.executeCommand

    try {
      const testUri = vscode.Uri.file('/test/path')
      await vscode.commands.executeCommand('open-folder-from-context-menu.openFolder', testUri)

      assert.strictEqual(commandCalled, true, 'vscode.openFolder command should be called')
      assert.strictEqual(commandUri?.fsPath, testUri.fsPath, 'Command should be called with correct URI')
    }
    finally {
      // Restore original function
      vscode.commands.executeCommand = executeCommand
    }
  })
})
