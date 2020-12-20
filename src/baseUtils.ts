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
    constructor() {
        // this.workspaceRoot = path.resolve(vscode.workspace.rootPath as string, '..', 'platform') || '';
        this.workspaceRoot = vscode.workspace.rootPath || '';
        this.config = vscode.workspace.getConfiguration('mcf') as unknown as ConfigType;
        console.log("conf:", JSON.stringify(this.config, null, 2));
        this.shell = new ShellContainer();
        this.getProjectWorkspace();
    }

    protected getProjectWorkspace() {
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