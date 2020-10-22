
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PackageModules, PackageItem } from './packageModules';
import { WebViewContainer } from './webview';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const rootPath: string = vscode.workspace.rootPath || '';
	console.log('Congratulations, your extension "demo" is now active!', rootPath);

	const packageModulesProvider = new PackageModules(context);
	vscode.window.registerTreeDataProvider('mcfedMenuViewModule', packageModulesProvider);

	vscode.commands.registerCommand('mcfedMenuViewModule.createModule', createCreateModuleView);
	vscode.commands.registerCommand('mcfedMenuViewModule.refreshEntry', () => packageModulesProvider.refresh());
	vscode.commands.registerCommand('mcfedMenuViewModule.showMainView', createMainView);

	vscode.commands.registerCommand('mcfedMenuViewModule.publishModules', (node: PackageItem) => packageModulesProvider.menuCommandManager(node, 'publishModules'));
	vscode.commands.registerCommand('mcfedMenuViewModule.buildModules', (node: PackageItem) => packageModulesProvider.menuCommandManager(node, 'buildModules'));
	vscode.commands.registerCommand('mcfedMenuViewModule.removeModules', (node: PackageItem) => packageModulesProvider.menuCommandManager(node, 'removeModules'));

	createMainView();
	 
	const conf = vscode.workspace.getConfiguration('mcf');
	console.log("conf:", JSON.stringify(conf, null, 2));

	function createMainView() {
		const mainViewPanel = new WebViewContainer(context);
		mainViewPanel.setHtml(mainViewPanel.getPackageModulesViewContentForFile());
		mainViewPanel.setPath('/packages');
		mainViewPanel.createView();
	}
	function createCreateModuleView() {
		const createModuleViewPanel = new WebViewContainer(context, packageModulesProvider);
		createModuleViewPanel.setHtml(createModuleViewPanel.getCreateModuleViewContentForFile());
		createModuleViewPanel.setPath('/modulecreate');
		createModuleViewPanel.createView();
	}
}



// 
// this method is called when your extension is deactivated
export function deactivate() {}
