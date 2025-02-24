import * as assert from 'assert';
import * as vscode from 'vscode';

interface ExtensionExports {
  activate: () => Promise<void>
  deactivate: () => void
}

suite('Switch to Folder Extension Test Suite', () => {
  let extension: vscode.Extension<ExtensionExports> | undefined;

  suiteSetup(async function () {
    extension = vscode.extensions.getExtension('joshua-woolf.switch-to-folder');

    if (!extension) {
      throw new Error('Extension not found.');
    }

    if (!extension.isActive) {
      await extension.activate();
    }
  });

  test('Extension should be present', () => {
    assert.ok(extension, 'Extension should be present');
  });

  test('Command should be registered', async () => {
    const commands = await vscode.commands.getCommands();
    assert.ok(commands.includes('switch-to-folder.openFolder'),
      'Command switch-to-folder.openFolder should be registered');
  });

  test('Command should be available in explorer context menu', async () => {
    const pkg = require('../../package.json');
    const menus = pkg.contributes.menus['explorer/context'];

    const menuItem = menus.find((item: any) =>
      item.command === 'switch-to-folder.openFolder' &&
      item.when === 'explorerResourceIsFolder'
    );

    assert.ok(menuItem, 'Menu item should be defined for explorer context');
    assert.strictEqual(menuItem.group, 'navigation');
  });

  test('Should fail when no folder is provided', async () => {
    let errorMessage: string | undefined;
    const showErrorMessage = vscode.window.showErrorMessage;
    vscode.window.showErrorMessage = (message: string) => {
      errorMessage = message;
      return Promise.resolve(undefined);
    };

    try {
      await vscode.commands.executeCommand('switch-to-folder.openFolder');
      assert.strictEqual(errorMessage, 'No folder selected.', 'Should show correct error message');
    }
    finally {
      vscode.window.showErrorMessage = showErrorMessage;
    }
  });

  test('Should handle valid folder URI', async () => {
    let commandCalled = false;
    let commandUri: vscode.Uri | undefined;
    const executeCommand = vscode.commands.executeCommand;

    vscode.commands.executeCommand = (async <T>(command: string, ...args: unknown[]): Promise<T> => {
      if (command === 'vscode.openFolder') {
        commandCalled = true;
        commandUri = args[0] as vscode.Uri;
        return Promise.resolve(undefined as unknown as T);
      }
      return executeCommand.apply(vscode.commands, [command, ...args]) as Promise<T>;
    }) as typeof vscode.commands.executeCommand;

    try {
      const testUri = vscode.Uri.file('/test/path');
      await vscode.commands.executeCommand('switch-to-folder.openFolder', testUri);

      assert.strictEqual(commandCalled, true, 'vscode.openFolder command should be called');
      assert.strictEqual(commandUri?.fsPath, testUri.fsPath, 'Command should be called with correct URI');
    }
    finally {
      vscode.commands.executeCommand = executeCommand;
    }
  });
});
