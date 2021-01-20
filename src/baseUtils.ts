import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ShellContainer } from './shell';

interface ConfigType {
    testconfig: string;
    mainModuleName: string;
    ignoreModule: Array<string>;
}

export class BaseUtil {
    config: ConfigType;
    shell: ShellContainer;
    workspaceRoot: string;
    workspaceProject: string = '';
    projectPackages: Array<string> = [];
    mainModuleName: string = '';
    constructor() {
        // this.workspaceRoot = path.resolve(vscode.workspace.rootPath as string, '../../', 'react/gitlab/soc-platform') || '';
        this.workspaceRoot = vscode.workspace.rootPath || (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.path) || '';
        console.log('workspaceRoot:', this.workspaceRoot);
        this.config = vscode.workspace.getConfiguration('mcf') as unknown as ConfigType;
        console.log("conf:", JSON.stringify(this.config, null, 2));
        this.shell = new ShellContainer();
        this.setProjectWorkspace();
        this.setMainModule();
    }

    protected setMainModule() {
        this.mainModuleName = this.config?.mainModuleName || this. getModuleNameByPackagesApp() || '';
    }

    protected getModuleNameByPackagesApp() {
        const mainModule = 'app';
        const workspaceProjects = fs.readdirSync(this.workspaceProject);
        if (!workspaceProjects.includes(mainModule)) {
            return null;
        }
        try {
            const mainModulePackage = require(path.resolve(this.workspaceProject, mainModule, 'package.json'));
            if (!mainModulePackage || !mainModulePackage.name) { return null; }
            return mainModulePackage.name;
        } catch (error) {
            return null;
        }
    }

    protected setProjectWorkspace() {
        if (!this.checkProjectUseLerna()) {
            this.showErrorMessage('当前项目不存在 lerna.json 文件');
            return;
        }
        const lernaJson = require(path.resolve(this.workspaceRoot, 'lerna.json'));
        if (!lernaJson || 
            typeof lernaJson !== 'object' || 
            !lernaJson.packages ||
            !Array.isArray(lernaJson.packages) || 
            !lernaJson.packages.length) {
            
            this.showErrorMessage('当前项目 lerna.json 文件 不存在可以利用的 packages 字段');
            return;
        }
        this.projectPackages = lernaJson.packages
            .map((e: string) => e.replace(/\*$/, ''))
            .filter((e: any) => e);

        if (!this.projectPackages.length) {
            this.showErrorMessage(`当前项目 lerna.json 文件 不存在可以利用的 packages 字段: ${JSON.stringify(lernaJson.packages, null, 2)}`);
        }
        this.workspaceProject = path.resolve(this.workspaceRoot, this.projectPackages[0]);
    }

    showErrorMessage(text: string, errorMessage?: string) {
        vscode.window.showErrorMessage(`${text} error Message: ${errorMessage || ''}`);
    }
    showInfoMessage(text: string) {
        vscode.window.showInformationMessage(text);
    }
    checkProjectUseLerna() {
		if (this.workspaceRoot 
			&& fs.existsSync(path.resolve(this.workspaceRoot, 'lerna.json'))) {
			return true;
		}
		return false;
	}
}