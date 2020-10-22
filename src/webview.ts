import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as mcfcra from '@mcfed/cra-render';
import { PackageModules } from './packageModules';
import * as shell from 'shelljs';

shell.config.execPath = shell.which('node').toString();

const messageType = {
	changeRouter: 'changeRouter',
	installStatus: 'installStatus'
};

export class WebViewContainer {
    packageModulePenal?: PackageModules; 
    workspaceRoot: string;
	// usercenter: string;
    currentPanel: vscode.WebviewPanel | undefined;
    context: vscode.ExtensionContext;
    viewPath: string;
    html: string;
    constructor(context: vscode.ExtensionContext, packageModulePenal?: PackageModules) {
        const rootPath: string = vscode.workspace.rootPath || '';
        this.packageModulePenal = packageModulePenal;
		this.workspaceRoot = rootPath;
        // this.usercenter = path.resolve(rootPath, '..', 'usercenter');
        this.context = context;
        this.viewPath = '';
        this.html = '';
    }
    setPath(p:string) {
       this.viewPath = p;
    }
    setHtml(html:string) {
        this.html = html;
    }
    createView() {
        if (!this.viewPath || !this.html) {
            return ;
        }
		if (this.currentPanel) {
			return this.currentPanel.reveal(vscode.ViewColumn.One);
		}
		this.currentPanel = vscode.window.createWebviewPanel(
			'view',
			'views Desc',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				enableCommandUris: true
			}
		);
		this.currentPanel.webview.html = this.html;// this.getMainViewContentForFile();

		this.sendMessage(messageType.changeRouter, this.viewPath);

		this.currentPanel.onDidDispose(
			() => {
				// When the panel is closed, cancel any future updates to the webview content
				console.log('close mian view');
			//   vscode.window.
			this.currentPanel = undefined;
			},
			null,
			this.context.subscriptions
        );
        this.listenMessage();
	}
	sendMessage(command:string, text: any) {
		this.currentPanel?.webview.postMessage({ command, text });
	}
	listenMessage() {
        if (!this.currentPanel) { return null; }
		this.currentPanel.webview.onDidReceiveMessage(
			message => {
			  switch (message.command) {
				case 'alert':
				  this.renderTemplate(message.text);
				  return;
				case 'install':
				  this.installPackage(message.text);
				  break;
				case 'uninstall': 
				  this.uninstallPackage(message.text);
				  break;
				default: 
				  return;
			  }
			});
    }
    installPackage(data: any) {
		data = '@mcfed/cra-render';
		this.sendMessage(messageType.installStatus, 'loading');
		if (this.checkProjectUseLerna()) {
			if (this.installByLerna(data)) {
				this.sendMessage(messageType.installStatus, 'success');
				vscode.window.showInformationMessage(`install package success`);
				return;
			}
			this.sendMessage(messageType.installStatus, 'fail');
			vscode.window.showErrorMessage(`lerna install ${data} error`);
			return;
		}
		if (!(this.installByYarn(data) ||
		this.installByNpm(data))) {
			vscode.window.showErrorMessage(`install ${data} error`);
			this.sendMessage(messageType.installStatus, 'error');
		}

		this.sendMessage(messageType.installStatus, 'success');
		vscode.window.showInformationMessage(`install package success`);
	}
	installByYarn(packageName: string) {
		console.log('installByYarn:', packageName);
		// if (shell.which('yarn') && !this.exec(`yarn add --cwd ${this.usercenter} ${packageName}`)) {
		if (shell.which('yarn') && !this.exec(`yarn add --cwd ${this.workspaceRoot} ${packageName}`)) {
				return false;
		}
		return true;
	}
	installByNpm(packageName: string) {
		console.log('installByNpm:', packageName);
		// if (shell.which('npm') && !this.exec(`npm install --cwd ${this.usercenter} ${packageName}`)) {
		if (shell.which('npm') && !this.exec(`npm install --cwd ${this.workspaceRoot} ${packageName}`)) {
				return false;
		}
		return true;
	}
	installByLerna(packageName: string) {
		console.log('installByLerna:', packageName);
		// if (!shell.which('lerna') ||
		// 	!this.exec(`cd ${this.usercenter} && lerna add ${packageName}`)) {
		if (!shell.which('lerna') ||
			!this.exec(`cd ${this.workspaceRoot} && lerna add ${packageName}`)) {
	
				console.log('lerna install error');
			return false;
		}
		return true;
	}
	checkProjectUseLerna() {
		// if (fs.existsSync(path.resolve(this.usercenter, 'lerna.json'))) {
		if (fs.existsSync(path.resolve(this.workspaceRoot, 'lerna.json'))) {
				return true;
		}
		return false;
	}
	exec(command: string) {
		if (shell.exec(command).code !== 0) {
			return false;
		}
		return true;
	}
	uninstallPackage(data:any) {
		console.log("==uninstallPackage===", data);
	}
	renderTemplate(config:any={}) {
		console.log('start render template', typeof config,JSON.stringify(config, null, 2));
		config.namespace = config.modelname;
		// config.pwd = this.usercenter;
		config.pwd = this.workspaceRoot;

		mcfcra.renderTemplate(config);
	
		console.log('render template success');
		this.packageModulePenal?.refresh();
    }
    getCreateModuleViewContentForFile() {
		return fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf-8');
		// return fs.readFileSync(path.resolve(__dirname, '..', 'build/index.html'), 'utf-8');	
	}

	getPackageModulesViewContentForFile() {
		 return fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf-8');
		// return fs.readFileSync(path.resolve(__dirname, '..', 'build/index.html'), 'utf-8');	
	}
    
}