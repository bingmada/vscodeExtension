import * as vscode from 'vscode';

export function setupTabCompletionListener(context: vscode.ExtensionContext) {
  let completionLineForKhAi =
    context.workspaceState.get<number>('completionLineForKhAi') || 0;
  let clipboardTextList =
    context.workspaceState.get<string[]>('clipboardTextList') || [];

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
  const handleClipboardText = async () => {
    const clipboardText = await vscode.env.clipboard.readText();
    if (clipboardTextList.indexOf(clipboardText) === -1) {
      clipboardTextList.push(clipboardText);
      if (clipboardTextList.length > 30) {
        clipboardTextList.shift(); // 删除前面的元素
      }
      context.workspaceState.update('clipboardTextList', clipboardTextList);
      vscode.commands.executeCommand('updateClipboardTextList'); // 更新侧边栏内容
    }
  };

  vscode.workspace.onDidChangeTextDocument((event) => {
    if (isUndoing || isRedoing) {
      // 跳过撤销或重做操作
      return;
    }
    event.contentChanges.forEach((change) => {
      const newText = change.text;
      const newTextTrim = newText.trim();

      if (!newTextTrim || newTextTrim === '\n' || newTextTrim === '\r\n') {
        return;
      }

      const newLines = newText.split('\n').filter(line => line.trim() !== '' && line !== '\r').length;
      const completionLength =
        newText.length - event.document.getText(change.range).length;

      if (completionLength > 6) {
        handleClipboardText().then(() => {
          if (clipboardTextList.indexOf(newText) === -1) {
            completionLineForKhAi += newLines;
            console.log(completionLineForKhAi);
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