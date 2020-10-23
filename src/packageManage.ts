import * as fs from 'fs';
import * as path from 'path';
import { BaseUtil } from './baseUtils';
import { WebViewContainer, messageType } from './webview';

export class PackageManage extends BaseUtil {
	webview?: WebViewContainer;
    constructor(webview?: WebViewContainer) {
		super();
		this.webview = webview;
	}

    installPackage(data: any) {
		if (data === 'disable') {
			data = '@mcfed/cra-render';
		}
		this.webview?.sendMessage(messageType.installStatus, 'loading');
		if (this.checkProjectUseLerna()) {
			if (this.installByLerna(data)) {
				this.webview?.sendMessage(messageType.installStatus, 'success');
				this.showInfoMessage(`install package success`);
				return;
			}
			this.webview?.sendMessage(messageType.installStatus, 'fail');
			this.showErrorMessage(`lerna install ${data} error`);
			return;
		}
		if (!(this.installByYarn(data) ||
		this.installByNpm(data))) {
			this.showErrorMessage(`install ${data} error`);
			this.webview?.sendMessage(messageType.installStatus, 'error');
		}

		this.webview?.sendMessage(messageType.installStatus, 'success');
		this.showInfoMessage(`install package success`);
	}

	installByYarn(packageName: string) {
		console.log('installByYarn:', packageName);
		if (!this.shell?.checkYarn() || 
			!this.shell?.exec(`yarn add --cwd ${this.workspaceRoot} ${packageName}`)) {
			return false;
		}
		return true;
	}
	installByNpm(packageName: string) {
		console.log('installByNpm:', packageName);
		if (!this.shell?.checkNpm() || 
			!this.shell?.exec(`npm install --cwd ${this.workspaceRoot} ${packageName}`)) {
			return false;
		}
		return true;
	}
	installByLerna(packageName: string) {
		console.log('installByLerna:', packageName);
		if (!this.shell?.checkLerna() || 
			!this.shell?.exec(`cd ${this.workspaceRoot} && lerna add ${packageName} --scope=${this.config.mainModuleName}`)) {
			return false;
		}
		return true;
	}
	checkProjectUseLerna() {
		if (this.workspaceRoot 
			&& fs.existsSync(path.resolve(this.workspaceRoot, 'lerna.json'))) {
			return true;
		}
		return false;
	}

	uninstallPackage(data:any) {
		// 移除主包的模块
		console.log("uninstallPackage:", data);
		if (data === 'disable') {
			data = '@mcfed/cra-render';
		}

		this.webview?.sendMessage(messageType.uninstallStatus, 'loading');
		if (this.checkProjectUseLerna()) {
			if (this.uninstallByLerna(data)) {
				this.webview?.sendMessage(messageType.uninstallStatus, 'success');
				this.showInfoMessage(`uninstall package success`);
				return;
			}
			this.webview?.sendMessage(messageType.uninstallStatus, 'fail');
			this.showErrorMessage(`lerna uninstall ${data} error`);
			return;
		}
		if (!(this.uninstallByYarn(data) ||
		this.uninstallByNpm(data))) {
			this.showErrorMessage(`uninstall ${data} error`);
			this.webview?.sendMessage(messageType.uninstallStatus, 'error');
		}

		this.webview?.sendMessage(messageType.uninstallStatus, 'success');
		this.showInfoMessage(`uninstall package success`);

	}
	uninstallByLerna(packageName: string) {
		console.log('uninstallByLerna:', packageName);

		if (!this.shell?.checkLerna() ||
			!this.shell?.checkYarn() || 
			!this.shell?.exec(`cd ${this.workspaceRoot} && lerna exec yarn remove ${packageName} --scope=${this.config.mainModuleName}`)) {
	
			console.log('lerna uninstall error');
			return false;
		}
		return true;
	}
	uninstallByYarn(packageName: string) {
		console.log('uninstallByYarn:', packageName);
		if (!this.shell?.checkYarn() || 
			!this.shell?.exec(`yarn remove --cwd ${this.workspaceRoot} ${packageName}`)) {
			return false;
		}
		return true;
	}
	uninstallByNpm(packageName: string) {
		console.log('uninstallByNpm:', packageName);
		if (!this.shell?.checkNpm() ||
			!this.shell?.exec(`npm uninstall --cwd ${this.workspaceRoot} ${packageName}`)) {
			return false;
		}
		return true;
	}
}