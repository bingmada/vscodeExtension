import * as vscode from 'vscode';
import * as cron from 'node-cron';
import axios from 'axios';

export function scheduleWeeklyTask(context: vscode.ExtensionContext) {
  let completionLineForKhAi =
    context.workspaceState.get<number>('completionLineForKhAi') || 0;

  // 定义定时任务，每周五下午五点执行一次
  cron.schedule('10 14 * * 5', () => {
    console.log('Uploaded completionLineForKhAi');
    axios
      .post('http://localhost:8080/api', {
        completionLineForKhAi: completionLineForKhAi,
      })
      .then(() => {
        completionLineForKhAi = 0;
        context.workspaceState.update('completionLineForKhAi', 0);
        console.log('Uploaded completionLineForKhAi and cleared.');
      })
      .catch((error) => {
        console.error('Error uploading completionLineForKhAi:', error);
      });
  });
}