/*
 * @Author: liyingda
 * @Date: 2024-07-17 19:24:21
 * @LastEditors: liyingda
 * @LastEditTime: 2024-07-18 10:53:36
 * @Description: 
 */
import * as vscode from 'vscode';

export function registerFunctionBox(context: vscode.ExtensionContext) {
  const sidebarProvider = new FunctionBoxProvider(context);
  vscode.window.registerWebviewViewProvider(
    'FunctionBoxContent',
    sidebarProvider
  );
}

class FunctionBoxProvider implements vscode.WebviewViewProvider {
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

    this._view.webview.html = this.getHtmlForWebview(webviewView.webview);
    webviewView.webview.onDidReceiveMessage((message) => {
      // if (message.command === 'copyText') {
      //   const index = message.index;
      //   const clipboardTextList: string[] =
      //     this._context.globalState.get('clipboardTextList') || [];
      //   const textToCopy = clipboardTextList[index];
      //   if (textToCopy) {
      //     vscode.env.clipboard.writeText(textToCopy);
      //     vscode.window.showInformationMessage('Copied to clipboard');
      //   }
      // }
    });
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const iframeSrc = webview.asWebviewUri(vscode.Uri.parse('https://khtest.10jqka.com.cn/dev/liyingda/functionBox/index.html'));
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Function Box</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <iframe src="${iframeSrc}"></iframe>
</body>
</html>`;
  }
}
