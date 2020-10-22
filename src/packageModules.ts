
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface PackageData {
	name: string;
	version: string;
	[index:string]: any;
}

export class PackageModules implements vscode.TreeDataProvider<PackageItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<PackageItem | undefined> = new vscode.EventEmitter<PackageItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<PackageItem | undefined> = this._onDidChangeTreeData.event;

    workspaceRoot: string;
	// usercenter: string;
	currentPanel: vscode.WebviewPanel | undefined;

    constructor(context: vscode.ExtensionContext) {
		const workspaceRoot: string = vscode.workspace.rootPath || '';
		this.workspaceRoot = workspaceRoot;
		// this.usercenter = path.resolve(workspaceRoot, '..', 'usercenter');
	}
	refresh(): void {
		console.log('---refresh----');
		this._onDidChangeTreeData.fire(undefined);
	}
    
    getTreeItem(element?: any): vscode.TreeItem | Thenable<vscode.TreeItem> {
		// throw new Error('Method not implemented.');
		// element.collapsibleState = vscode.TreeItemCollapsibleState.None;
		console.log("===getTreeItem===");
        return element;
    }
    getChildren(element?: any): vscode.ProviderResult<any[]> {
		console.log("===getChildren===");

		// throw new Error('Method not implemented.');
		// const packages = this.processModulesName(fs.readdirSync(path.resolve(this.usercenter, 'packages')));
		const packages = this.processModulesName(fs.readdirSync(path.resolve(this.workspaceRoot, 'packages')));

		const packageDatas = this.processModules(packages);
		return Promise.resolve(
			packageDatas.map(packageData => 
				new PackageItem(
					packageData.dirname, 
					packageData.version, 
					vscode.TreeItemCollapsibleState.None
				)
			)
		);
	}
	processModules(packages: any[]): PackageData[] {
		return packages.map(name => {
			// const packageJsonPath = path.resolve(this.usercenter, 'packages', name, 'package.json');
			const packageJsonPath = path.resolve(this.workspaceRoot, 'packages', name, 'package.json');
			if (!fs.existsSync(packageJsonPath)) {
				return null;
			}
			return Object.assign({}, { dirname: name }, require(packageJsonPath));
		}).filter(e => e);
	}
	processModulesName(packages: any[]): any[] {
		// 获取配置筛选模块
		const config = { ignoreModule: ['demo'] };
		return packages.filter(e => !config.ignoreModule.includes(e));
	}
	menuCommandManager(node: PackageItem,type: string) {
		switch (type) {
			case 'publishModules':
				this.publishModules(node.label);
				break;
			case 'buildModules':
				this.buildModules(node.label);
				break;
			case 'removeModules':
				this.removeModules(node.label);
				break;
			default:
				break;
		}
	}
	publishModules(moduleName: string) {
		console.log('====publishModules===', moduleName);
	}
	buildModules(moduleName: string) {
		console.log('====buildModules===', moduleName);
	}
	removeModules(moduleName: string) {
		console.log('====removeModules===', moduleName);
	}
}
export class PackageItem extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		private readonly version: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);

		this.tooltip = `${this.label}-${this.version}`;
		this.description = this.version;
	}

	iconPath = {
		light: path.join(__filename, '..', 'images', 'dep.svg'),
		dark: path.join(__filename, '..', 'images', 'dep.svg')
	};

	contextValue = 'dependency';
}