
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { BaseUtil } from './baseUtils';
import { PackageManage } from './packageManage';

interface PackageData {
	name: string;
	version: string;
	[index:string]: any;
}

export class PackageModules extends BaseUtil implements vscode.TreeDataProvider<PackageItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<PackageItem | undefined> = new vscode.EventEmitter<PackageItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<PackageItem | undefined> = this._onDidChangeTreeData.event;
	packageManage?: PackageManage;
    constructor(packageManage?: PackageManage) {
		super();
		this.packageManage = packageManage;
	}
	refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}
    
    getTreeItem(element?: any): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: any): vscode.ProviderResult<any[]> {
		if (!this.checkProjectUseLerna()) {
			return [];
		}
		const packages = this.processModulesName();

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
			const packageJsonPath = path.resolve(this.workspaceRoot, this.projectPackages[0], name, 'package.json');
			if (!fs.existsSync(packageJsonPath)) {
				return null;
			}
			return Object.assign({}, { dirname: name }, require(packageJsonPath));
		}).filter(e => e);
	}
	processModulesName(): any[] {
		const packagePath = path.resolve(this.workspaceRoot, this.projectPackages[0]);
		const packagesFolders = fs.readdirSync(packagePath);

		// 获取配置筛选模块
		const config = { ignoreModule: ['demo'] };
		if (this.config?.ignoreModule && this.config?.ignoreModule && Array.isArray(this.config?.ignoreModule)) {
			config.ignoreModule = config.ignoreModule.concat(this.config?.ignoreModule);
		}
		return packagesFolders.filter(e => !config.ignoreModule.includes(e));
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
		this.packageManage?.publishPackage(moduleName);
	}
	buildModules(moduleName: string) {
		this.packageManage?.buildPackage(moduleName);
	}
	removeModules(moduleName: string) {
		this.packageManage?.removePackage(moduleName);
		this.refresh();
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