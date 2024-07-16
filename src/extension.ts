/*
 * @Author: liyingda
 * @Date: 2024-07-13 16:52:20
 * @LastEditors: liyingda
 * @LastEditTime: 2024-07-15 20:17:14
 * @Description:
 */

import * as vscode from 'vscode';
import { setupTabCompletionListener } from './listeners';
import { scheduleWeeklyTask } from './scheduler';
import { registerClipboardTextListSidebar } from './sideBar';

export function activate(context: vscode.ExtensionContext) {
  // 初始化功能模块
  setupTabCompletionListener(context);
  scheduleWeeklyTask(context);
  registerClipboardTextListSidebar(context);
  // 注册命令
  let disposable = vscode.commands.registerCommand(
    'extension.listenTabCompletion',
    () => {
      vscode.window.showInformationMessage('Tab Completion Listener Activated');
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
