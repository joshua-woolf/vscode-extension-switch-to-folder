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
})
