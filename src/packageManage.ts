import { BaseUtil } from './baseUtils';
import { WebViewContainer, messageType } from './webview';
import * as path from 'path';

export class PackageManage extends BaseUtil {
	webview?: WebViewContainer;
    constructor(webview?: WebViewContainer) {
		super();
		this.webview = webview;
	}

    installPackage(packageName: any) {
		if (packageName === 'disable') {
			packageName = '@mcfed/cra-render';
		}
		this.webview?.sendMessage(messageType.installStatus, 'loading');
		if (this.installByLerna(packageName)) {
			this.webview?.sendMessage(messageType.installStatus, 'success');
			this.showInfoMessage(`安装模块成功`);
			return;
		}
		this.webview?.sendMessage(messageType.installStatus, 'fail');
		this.showErrorMessage(`安装模块 ${packageName} 失败`, this.shell?.execResultErrorMessage);
	}
	protected installByLerna(packageName: string) {
		console.log('installByLerna:', packageName);
		if (!this.shell?.checkLerna() || 
			!( 
				this.shell?.cd(this.workspaceRoot) && 
				this.shell?.exec(`lerna add ${packageName} --scope=${this.config.mainModuleName}`)
			 )
		) {
			return false;
		}
		return true;
	}

	uninstallPackage(packageName:string) {
		// 移除主包的模块
		console.log("uninstallPackage:", packageName);
		if (packageName === 'disable') {
			packageName = '@mcfed/cra-render';
		}

		this.webview?.sendMessage(messageType.uninstallStatus, 'loading');
		if (this.uninstallByLerna(packageName)) {
			this.webview?.sendMessage(messageType.uninstallStatus, 'success');
			this.showInfoMessage(`卸载模块成功`);
			return;
		}
		this.webview?.sendMessage(messageType.uninstallStatus, 'fail');
		this.showErrorMessage(`卸载模块 ${packageName} 失败`, this.shell?.execResultErrorMessage);
	}
	protected uninstallByLerna(packageName: string) {
		console.log('uninstallByLerna:', packageName);

		if (!this.shell?.checkLerna() ||
			!this.shell?.checkYarn() || 
			!(
				this.shell?.cd(this.workspaceRoot) && 
				this.shell?.exec(`lerna exec yarn remove ${packageName} --scope=${this.config.mainModuleName}`)
			)
		) {
	
			console.log('lerna uninstall error');
			return false;
		}
		return true;
	}

	buildPackage(packageName: string) {
		console.log("buildPackage:", packageName);
		if (this.buildPackageByYarn(packageName)) {
			this.showInfoMessage(`构建模块成功`);
			return;
		}
		this.showErrorMessage(`构建模块失败`, this.shell?.execResultErrorMessage);
	}
	protected buildPackageByYarn(packageName: string) {
		if (!this.shell?.checkYarn() ||
			!(
				this.shell?.cd(path.resolve(this.workspaceProject, packageName)) &&
				this.shell?.exec('yarn && yarn build')
			)
		) {
				console.log('yarn build error', packageName);
				return false;
		}
		return true;
	}

	publishPackage(packageName: string) {
		console.log("publishPackage:", packageName);
		if (this.publishPackageByYarn(packageName)) {
			this.showInfoMessage(`发布模块成功`);
			return;
		}
		this.showErrorMessage(`发布模块失败`, this.shell?.execResultErrorMessage);
	}
	protected publishPackageByYarn(packageName: string) {
		if (!this.shell?.checkYarn() ||
			!(
				this.shell?.cd(path.resolve(this.workspaceProject, packageName)) &&
				this.shell?.exec('yarn && yarn publish')
			)
		) {
				console.log('yarn publish error', packageName);
				return false;
		}
		return true;
	}
	removePackage(packageName: string) {
		console.log("removePackage:", packageName);
		this.shell?.rm(path.resolve(this.workspaceProject, packageName));
		this.showInfoMessage(`移除模块成功`);
	}
}