
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PackageModules, PackageItem } from './packageModules';
import { PackageManage } from './packageManage';
import { WebViewContainer } from './webview';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const rootPath: string = vscode.workspace.rootPath || '';
	console.log('Congratulations, your extension "demo" is now active!', rootPath);

	const packageModulesProvider = new PackageModules(new PackageManage());
	if (!packageModulesProvider.checkProjectUseLerna()) { return ; }
	vscode.window.registerTreeDataProvider('mcfedMenuViewModule', packageModulesProvider);

	vscode.commands.registerCommand('mcfedMenuViewModule.createModule', createCreateModuleView);
	vscode.commands.registerCommand('mcfedMenuViewModule.refreshEntry', () => packageModulesProvider.refresh());
	vscode.commands.registerCommand('mcfedMenuViewModule.showMainView', createMainView);

	vscode.commands.registerCommand('mcfedMenuViewModule.publishModules', (node: PackageItem) => packageModulesProvider.menuCommandManager(node, 'publishModules'));
	vscode.commands.registerCommand('mcfedMenuViewModule.buildModules', (node: PackageItem) => packageModulesProvider.menuCommandManager(node, 'buildModules'));
	vscode.commands.registerCommand('mcfedMenuViewModule.removeModules', (node: PackageItem) => packageModulesProvider.menuCommandManager(node, 'removeModules'));

	createMainView();

	function createMainView() {
		const mainViewPanel = new WebViewContainer(context);
		if (!mainViewPanel.checkProjectUseLerna()) { return; }
		mainViewPanel.setHtml(mainViewPanel.getPackageModulesViewContentForFile());
		mainViewPanel.setPath('/packages');
		mainViewPanel.createView();
		return mainViewPanel;
	}
	function createCreateModuleView() {
		const createModuleViewPanel = new WebViewContainer(context, packageModulesProvider);
		if (!createModuleViewPanel.checkProjectUseLerna()) { return; }
		createModuleViewPanel.setHtml(createModuleViewPanel.getCreateModuleViewContentForFile());
		createModuleViewPanel.setPath('/modulecreate');
		createModuleViewPanel.createView();
		return createModuleViewPanel;
	}
}



// 
// this method is called when your extension is deactivated
export function deactivate() {}
