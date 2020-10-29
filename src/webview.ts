import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as mcfcra from '@mcfed/cra-render';
import { PackageModules } from './packageModules';
import { PackageManage } from './packageManage';
import { BaseUtil } from './baseUtils';

export const messageType = {
	changeRouter: 'changeRouter',
	installStatus: 'installStatus',
	uninstallStatus: 'uninstallStatus'
};

export class WebViewContainer extends BaseUtil {
    packageModulePenal?: PackageModules;
    currentPanel: vscode.WebviewPanel | undefined;
    context: vscode.ExtensionContext;
    viewPath: string;
	html: string;
	packageManage: PackageManage;
    constructor(context: vscode.ExtensionContext, packageModulePenal?: PackageModules) {
		super();
        this.packageModulePenal = packageModulePenal;
        this.context = context;
        this.viewPath = '';
		this.html = '';
		this.packageManage = new PackageManage(this);
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
		this.currentPanel.webview.html = this.html;

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
				  this.sendMessage('renderStatus', 'pending');
				  this.renderTemplate(message.text);
				  return;
				case 'install':
				  this.packageManage.installPackage(message.text);
				  break;
				case 'uninstall': 
				  this.packageManage.uninstallPackage(message.text);
				  break;
				default: 
				  return;
			  }
			});
    }
	renderTemplate(config:any={}) {
		console.log('start render template', typeof config,JSON.stringify(config, null, 2));
		config.namespace = config.modelname;
		config.pwd = this.workspaceRoot;
		if (!config.newRenderProjectDir) {
			config.newRenderProjectDir = path.resolve(this.workspaceRoot, `packages/${config.modelname}`);
		}
		if (fs.existsSync(config.newRenderProjectDir)) {
			this.showErrorMessage(`模块 ${config.modelname} 已存在`);
			return ;
		}

		try {
			mcfcra.processConfig(config);
			console.log('after process config', JSON.stringify(config, null, 2));
	
			mcfcra.renderTemplate(config);
		} catch (error) {
			this.showErrorMessage(`模块 创建失败`);
			this.sendMessage('renderStatus', 'fail');
			return ;
		}
		console.log('render template success');
		this.sendMessage('renderStatus', 'success');
		this.showInfoMessage('创建模块成功');
		this.packageModulePenal?.refresh();
	}
    getCreateModuleViewContentForFile() {
		return fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf-8');
	}
	getPackageModulesViewContentForFile() {
		 return fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf-8');
	}
    
}