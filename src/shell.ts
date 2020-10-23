import * as vscode from 'vscode';
import * as shell from 'shelljs';

export class ShellContainer{
    constructor() {
        this.setShellNodeDependence();
    }
    setShellNodeDependence() {
		if (shell?.which('node')?.toString()) {
			shell.config.execPath = shell?.which('node')?.toString();
		} else {
			vscode.window.showErrorMessage('not found node command');
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
		if (shell.exec(command).code !== 0) {
			return false;
		}
		return true;
	}
 	cd (dir: string | undefined) {
		return shell.cd(dir);
	}
}