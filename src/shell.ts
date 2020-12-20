import * as vscode from 'vscode';
import * as shell from 'shelljs';

export class ShellContainer{
	execResultErrorMessage?: string;
    constructor() {
        this.setShellNodeDependence();
    }
    protected setShellNodeDependence() {
		if (shell?.which('node')?.toString()) {
			shell.config.execPath = shell?.which('node')?.toString();
		} else {
			vscode.window.showErrorMessage('未发现node.js环境');
		}
    }
    checkYarn() {
		if (!shell.which('yarn')) {
			vscode.window.showErrorMessage('not found yarn command');
			return false;
		}
		return true;
	}
	checkNpm() {
		if (!shell.which('npm')) {
			vscode.window.showErrorMessage('not found npm command');
			return false;
		}
		return true;
	}
	checkLerna() {
		if (!shell.which('lerna')) {
			vscode.window.showErrorMessage('not found lerna command');
			return false;
		}
		return true;
    }
    exec(command: string) {
		const execResult = shell.exec(command);
		if (execResult.code !== 0) {
			this.execResultErrorMessage = execResult;
			return false;
		}
		this.execResultErrorMessage = '';
		return true;
	}
 	cd (dir: string | undefined) {
		return shell.cd(dir);
	}
	rm (dir: string) {
		return shell.rm('-rf', dir);
	}
}