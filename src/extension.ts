
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as mcfcra from '@mcfed/cra-render';
import * as fs from 'fs';
import * as path from 'path';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let currentPanel: vscode.WebviewPanel | undefined = undefined;
	// let currentPanel: vscode.WebviewPanel | undefined = undefined;
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "demo" is now active!');

	// context.subscriptions.push(vscode.commands.registerCommand('demo', () => {
	// 	// The code you place here will be executed every time your command is executed

	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World from mcf-gui!');
	// }));
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(vscode.commands.registerCommand('demo', () => {
		if (currentPanel) {
			currentPanel.reveal(vscode.ViewColumn.One);
		} else {
			currentPanel = vscode.window.createWebviewPanel(
				'demo',
				'demo view',
				vscode.ViewColumn.One,
				{
					enableScripts: true,
					retainContextWhenHidden: true,
				}
			);
			// currentPanel.webview.postMessage({ command: 'refactor', text: 'vscodedemo' });

			// And set its HTML content
			currentPanel.webview.html = getWebviewContentForFile();// getWebviewContent();
			currentPanel.onDidDispose(
				() => {
				  // When the panel is closed, cancel any future updates to the webview content
				  console.log('close webview demo');
				//   vscode.window.
				currentPanel = undefined;
				},
				null,
				context.subscriptions
			  );
			// Handle messages from the webview
			currentPanel.webview.onDidReceiveMessage(
				message => {
					switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage('点击提交了啊！！！');
						renderTemplate(message.text);
						return;
					}
				},
				undefined,
				context.subscriptions
			);
		}
	}));
}
function renderTemplate(config={}) {
	console.log('start render template');

	mcfcra.renderTemplate(config);

	console.log('render template success');
}
function getWebviewContentForFile() {
	return fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf-8');
}

function getWebviewContent() {
	return `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Cat Coding</title>
	</head>
	<script src="">
	</script>
	<style type="text/css">
    .title {
        text-align: center;
        padding: 20px;
	}
	.namespace {
        text-align: center;
        padding: 10px;
    }
    .pwd {
        text-align: center;
        padding: 10px;
    }
    .button {
        text-align: center;
        padding: 20px;
    }
	</style>
	<body>
		<div>
			<div>
				<div class="title">
					生成模版项目
				</div>
			</div>
			<div class="namespace">
				<span>模版名称：</span>
				<input id="namespace" value="vscodedemo" />
			</div>
			<div class="pwd">
				<span>usercenter项目路径：</span>
				<input id="pwd" value="/Users/lixiang/works/packages/usercenter" />
			</div>
			<div class="button">
				<button id="button">
					提交
				</button>
			</div>
		</div>
		<script>
			document.getElementById("button").onclick = function() {
				// 设置在此处单击#button时要发生的事件
				// document.getElementById("namespace").value = "我点击了！";
				let namespace = document.getElementById("namespace").value;
				let pwd = document.getElementById("pwd").value;
				
				const vscode = acquireVsCodeApi();
				vscode.postMessage({ command: 'alert', text: { namespace, pwd }})
			};
		</script>
	</body>
	</html>
	`;
}
// 
// this method is called when your extension is deactivated
export function deactivate() {}
