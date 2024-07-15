/*
 * @Author: liyingda
 * @Date: 2024-07-15 14:22:25
 * @LastEditors: liyingda
 * @LastEditTime: 2024-07-15 19:59:17
 * @Description:
 */
import * as vscode from 'vscode';

export function setupTabCompletionListener(context: vscode.ExtensionContext) {
  let completionLineForKhAi =
    context.workspaceState.get<number>('completionLineForKhAi') || 0;
  let clipboardTextList =
    context.workspaceState.get<string[]>('clipboardTextList') || [];

  // console.log(
  //   completionLineForKhAi,
  //   'completionLineForKhAi',
  //   clipboardTextList
  // );

  vscode.workspace.onDidChangeTextDocument((event) => {
    event.contentChanges.forEach((change) => {
      const newText = change.text;
      const newTextTrim = newText.trim();

      if (!newTextTrim || newTextTrim === '\n' || newTextTrim === '\r\n') {
        return;
      }

      const newLines = newText.split('\n').length;
      const completionLength =
        newText.length - event.document.getText(change.range).length;

      if (completionLength > 6) {
        vscode.env.clipboard.readText().then((clipboardText: string) => {
          if (clipboardTextList.indexOf(clipboardText) === -1) {
            clipboardTextList.push(clipboardText);
            context.workspaceState.update(
              'clipboardTextList',
              clipboardTextList
            );
            // updateWebviewContent(context);
          }
          if (newText !== clipboardText) {
            completionLineForKhAi += newLines;
            // console.log(
            //   completionLineForKhAi,
            //   'completionLineForKhAi',
            //   clipboardTextList
            // );
            context.workspaceState.update(
              'completionLineForKhAi',
              completionLineForKhAi
            );
          }
        });
      }
    });
  });
}

// function updateWebviewContent(context: vscode.ExtensionContext) {
//   const clipboardTextList =
//     context.workspaceState.get<string[]>('clipboardTextList') || [];
//   const sidebarProvider: ClipboardTextListSidebarProvider = context.workspaceState.get<ClipboardTextListSidebarProvider>('sidebarProvider');

//   if (sidebarProvider && sidebarProvider._view) {
//     const content = clipboardTextList
//       .map(
//         (text, index) => `
//           <div class="text-item">
//             <span>${index + 1}. ${text}</span>
//             <button onclick="copyText('${text.replace(/'/g, "\\'")}')">Copy</button>
//           </div>
//         `
//       )
//       .join('');
//     sidebarProvider._view.webview.html = sidebarProvider.getHtmlForWebview(content);
//   }
// }