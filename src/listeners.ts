/*
 * @Author: liyingda
 * @Date: 2024-07-15 14:22:25
 * @LastEditors: liyingda
 * @LastEditTime: 2024-07-17 13:49:07
 * @Description:
 */
import * as vscode from 'vscode';

export function setupTabCompletionListener(context: vscode.ExtensionContext) {
  let isUndoing = false;
  let isRedoing = false;

  // 拦截撤销命令
  context.subscriptions.push(
    vscode.commands.registerCommand('undo', async () => {
      console.log('listenTabCompletion');
      isUndoing = true;
      await vscode.commands.executeCommand('default:undo');
      isUndoing = false;
    })
  );

  // 拦截重做命令
  context.subscriptions.push(
    vscode.commands.registerCommand('redo', async () => {
      console.log('listenTabCompletion');
      isRedoing = true;
      await vscode.commands.executeCommand('default:redo');
      isRedoing = false;
    })
  );
  // 处理剪贴板逻辑
  let alClipboard = false;
  setInterval(() => {
    if (alClipboard) {
      alClipboard = false;
      return;
    }
    handleClipboardText();
  }, 1500);
  const handleClipboardText = async () => {
    let clipboardTextList =
      context.globalState.get<string[]>('clipboardTextList') || [];
    const clipboardText = await vscode.env.clipboard.readText();
    if (clipboardText && clipboardTextList.indexOf(clipboardText) === -1) {
      clipboardTextList.push(clipboardText);
      if (clipboardTextList.length > 30) {
        clipboardTextList.shift(); // 删除前面的元素
      }
      context.globalState.update('clipboardTextList', clipboardTextList);
      vscode.commands.executeCommand('updateClipboardTextList'); // 更新侧边栏内容
    }
  };
  vscode.workspace.onDidChangeTextDocument((event) => {
    if (isUndoing || isRedoing) {
      // 跳过撤销或重做操作
      return;
    }
    event.contentChanges.forEach((change) => {
      let completionLineForKhAi =
        context.globalState.get<number>('completionLineForKhAi') || 0;
      let completionLineForKh =
        context.globalState.get<number>('completionLineForKh') || 0;
      const newText = change.text;
      const newTextTrim = newText.trim();
      const newTextList = newText.split('\n');
      // 检查是否包含换行符
      if (newText.includes('\n')) {
        const newLines = newTextList.length - 1;
        completionLineForKh += newLines;
        context.globalState.update(
          'completionLineForKh',
          completionLineForKh
        );
        console.log('Total input lines:', completionLineForKh);
      }
      if (!newTextTrim || newTextTrim === '\n' || newTextTrim === '\r\n') {
        return;
      }

      const newLines = newTextList.filter(
        (line) => line.trim() !== '' && line !== '\r'
      ).length;
      const completionLength =
        newText.length - event.document.getText(change.range).length;
      if (completionLength > 6) {
        alClipboard = true;
        handleClipboardText().then(() => {
          let clipboardTextList =
            context.globalState.get<string[]>('clipboardTextList') || [];
          if (clipboardTextList.indexOf(newText) === -1) {
            completionLineForKhAi += newLines;
            console.log(completionLineForKhAi);
            context.globalState.update(
              'completionLineForKhAi',
              completionLineForKhAi
            );
          }
        });
      }
    });
  });
}
