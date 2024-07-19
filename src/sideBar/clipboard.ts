import * as vscode from 'vscode';
export function registerClipboardTextListSidebar(
  context: vscode.ExtensionContext
) {
  const sidebarProvider = new ClipboardTextListSidebarProvider(context);
  vscode.window.registerWebviewViewProvider(
    'clipboardTextContent',
    sidebarProvider
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('updateClipboardTextList', () => {
      sidebarProvider.updateWebviewContent();
    })
  );
}

class ClipboardTextListSidebarProvider implements vscode.WebviewViewProvider {
  public _view?: vscode.WebviewView;
  private readonly _context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext<unknown>,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
    };

    this.updateWebviewContent();
    webviewView.webview.onDidReceiveMessage((message) => {
      if (message.command === 'copyText') {
        const index = message.index;
        const clipboardTextList: string[] =
          this._context.globalState.get('clipboardTextList') || [];
        const textToCopy = clipboardTextList[index];
        if (textToCopy) {
          vscode.env.clipboard.writeText(textToCopy);
          vscode.window.showInformationMessage('Copied to clipboard');
        }
      }
    });
  }

  public updateWebviewContent() {
    const clipboardTextList: string[] =
      this._context.globalState.get('clipboardTextList') || [];

    const content = clipboardTextList
      .map(
        (text, index) => `
          <div class="text-item">
            <span class="text-item-span">${this.escapeHtml(text)}</span>
            <button class="ant-btn" onclick="copyText(${index})">Copy</button>
          </div>
        `
      )
      .join('');

    if (this._view) {
      this._view.webview.html = this.getHtmlForWebview(content);
    }
  }
  public escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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
          .text-item {
            margin-bottom: 10px;
            position: relative;
            line-height: 1.5;
            padding: 0 10px; 
          }
          .text-item-span{
            word-break:break-all;
          }
          .ant-btn {
            margin-left: 10px;
            padding: 0px 12px;
            font-size: 14px;
            line-height: 1.5;
            border-radius: 4px;
            color: #fff;
            background-color: #1890ff;
            border: 1px solid #1890ff;
            cursor: pointer;
            transition: background-color 0.3s, border-color 0.3s, color 0.3s;
          }
          .ant-btn:hover {
            background-color: #40a9ff;
            border-color: #40a9ff;
          }
          .ant-btn:focus {
            outline: none;
          }
        </style>
      </head>
      <body>
        ${content}
        <script>
          const vscode = acquireVsCodeApi();

          function copyText(index) {
            vscode.postMessage({ command: 'copyText', index });
          }

          function scrollToBottom() {
            window.scrollTo(0, document.body.scrollHeight);
          }

          scrollToBottom();
        </script>
      </body>
      </html>
    `;
  }
}
