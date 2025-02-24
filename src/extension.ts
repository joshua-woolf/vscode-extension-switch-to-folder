import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('switch-to-folder.openFolder', async (uri: vscode.Uri) => {
    if (!uri) {
      vscode.window.showErrorMessage('No folder selected.');
      return;
    }

    try {
      await vscode.commands.executeCommand('vscode.openFolder', uri);
    }
    catch (error) {
      vscode.window.showErrorMessage(`Failed to switch folder: ${error}`);
    }
  });

  context.subscriptions.push(disposable);
}

 
export function deactivate() { }
