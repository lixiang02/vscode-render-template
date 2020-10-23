import * as vscode from 'vscode';
import * as path from 'path';
import { ShellContainer } from './shell';

interface ConfigType {
    testconfig: string;
    mainModuleName: string;
}

export class BaseUtil {
    workspaceRoot: string;
    config: ConfigType;
    shell: ShellContainer;
    constructor() {
        // this.workspaceRoot = path.resolve(vscode.workspace.rootPath as string, '..', 'platform') || '';
        this.workspaceRoot = vscode.workspace.rootPath || '';
        this.config = vscode.workspace.getConfiguration('mcf') as unknown as ConfigType;
        console.log("conf:", JSON.stringify(this.config, null, 2));
        this.shell = new ShellContainer();
    }

    showErrorMessage(text: string) {
        vscode.window.showErrorMessage(text);
    }
    showInfoMessage(text: string) {
        vscode.window.showInformationMessage(text);
    }
}