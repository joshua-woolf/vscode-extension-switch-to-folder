import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "open-folder-from-context-menu" is now active')

  const disposable = vscode.commands.registerCommand('open-folder-from-context-menu.openFolder', async (uri: vscode.Uri) => {
    console.log('Command triggered with URI:', uri?.fsPath)

    if (!uri) {
      console.log('No URI provided')
      vscode.window.showErrorMessage('No directory selected')
      return
    }

    try {
      // Open the directory directly without creating a workspace
      await vscode.commands.executeCommand('vscode.openFolder', uri)
      console.log('Opened directory:', uri.fsPath)

      const folderName = uri.fsPath.split('/').pop() || ''
      vscode.window.showInformationMessage(`Switched to directory: ${folderName}`)
    }
    catch (error) {
      console.error('Error switching directory:', error)
      vscode.window.showErrorMessage(`Failed to switch directory: ${error}`)
    }
  })

  context.subscriptions.push(disposable)
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() { }
