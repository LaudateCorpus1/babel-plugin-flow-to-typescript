import { ImportDeclaration, ImportSpecifier, ImportDefaultSpecifier, isIdentifier } from '@babel/types';
import { NodePath } from '@babel/traverse';
import { PluginPass } from '../types';

function getImportLocal(path: NodePath<ImportDefaultSpecifier | ImportSpecifier>): string {
  const local = path.node.local;
  if (!isIdentifier(local)) {
    throw path.buildCodeFrameError('unhandled import syntax');
  }
  return local.name;
}

export function ImportDeclaration(this: PluginPass, path: NodePath<ImportDeclaration>) {
  if (path.node.importKind === 'typeof') {
    const addTypeofImport = (innerPath: NodePath<ImportDefaultSpecifier | ImportSpecifier>) => {
      this.typeofImports.add(getImportLocal(innerPath));
    }

    path.traverse({
      ImportDefaultSpecifier: addTypeofImport,
      ImportSpecifier: addTypeofImport,
    });
  }

  path.node.importKind = null;
}

export function ImportSpecifier(this: PluginPass, path: NodePath<ImportSpecifier>) {
  if (path.node.importKind === 'typeof') {
    this.typeofImports.add(getImportLocal(path));
  }

  path.node.importKind = null;
}
