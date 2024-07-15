import * as vscode from 'vscode';


export function registerClipboardTextListSidebar(context: vscode.ExtensionContext) {
  const sidebarProvider = new ClipboardTextListSidebarProvider(context);
  // context.workspaceState.update('sidebarProvider', sidebarProvider);
  console.log('12313sss1334444333333. ',  vscode.CancellationToken)
  vscode.window.registerWebviewViewProvider('clipboardTextContent', sidebarProvider);
}

class ClipboardTextListSidebarProvider implements vscode.WebviewViewProvider {
  public _view?: vscode.WebviewView;
  private readonly _context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
    console.log('1231313333322222333. ',  vscode.CancellationToken)
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext<unknown>,
    _token: vscode.CancellationToken
  ) {
    console.log('12313133333333')
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
    };

    const clipboardTextList: string[] =
      this._context.workspaceState.get('clipboardTextList') || [];

    const content = clipboardTextList
      .map(
        (text, index) => `
          <div class="text-item">
            <span>${index + 1}. ${text}</span>
            <button onclick="copyText('${text.replace(/'/g, "\\'")}')">Copy</button>
          </div>
        `
      )
      .join('');

    this._view.webview.html = this.getHtmlForWebview(content);

    webviewView.webview.onDidReceiveMessage((message) => {
      if (message.command === 'copyText') {
        vscode.env.clipboard.writeText(message.text);
        vscode.window.showInformationMessage('Copied to clipboard');
      }
    });
  }

  public getHtmlForWebview(content: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Clipboard Text List</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 10px; }
          .text-item { margin-bottom: 10px; }
          button { margin-left: 10px; }
        </style>
      </head>
      <body>
        ${content}
        <script>
          const vscode = acquireVsCodeApi();

          function copyText(text) {
            vscode.postMessage({ command: 'copyText', text });
          }
        </script>
      </body>
      </html>
    `;
  }
}
