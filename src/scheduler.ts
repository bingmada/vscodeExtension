/*
 * @Author: liyingda
 * @Date: 2024-07-15 14:22:51
 * @LastEditors: liyingda
 * @LastEditTime: 2024-07-18 09:45:39
 * @Description:
 */
import * as vscode from 'vscode';
import * as cron from 'node-cron';
import axios from 'axios';

export function scheduleWeeklyTask(context: vscode.ExtensionContext) {
  // 定义定时任务，每周五下午五点执行一次
  cron.schedule('30 16 * * 5', async () => {
    console.log('Uploaded completionLineForKhAi');
    let completionLineForKhAi =
      context.globalState.get<number>('completionLineForKhAi') || 0;
    let completionLineForKh =
      context.globalState.get<number>('completionLineForKh') || 0;
    try {
      // 获取外部 JavaScript 文件内容
      const { data } = await axios.get(
        'https://khtest.10jqka.com.cn/dev/liyingda/lines/lines.js'
      );
      console.log(data);
      const { uploadLine = '' } = data;
      // 从 JavaScript 文件内容中提取需要的地址信息（这里假设从内容中提取出了目标地址）

      console.error('d.js', uploadLine);
      // 检查是否成功提取了目标地址
      if (!uploadLine) {
        console.error('Failed to extract API URL from lines.js');
        return;
      }
      axios
        .post(uploadLine, {
          aiCodeLine: completionLineForKhAi,
          allCodeLine : completionLineForKh,
        })
        .then(() => {
          context.globalState.update('completionLineForKh', 0);
          context.globalState.update('completionLineForKhAi', 0);
          console.log('Uploaded completionLineForKhAi and cleared.');
        })
        .catch((error) => {
          console.error('Error uploading completionLineForKhAi:', error);
        });
    } catch (error) {
      console.error('Error fetching lines.js:', error);
    }
  });
}
