import { BabelPluginPass } from './types/babel_plugin_pass';
import { Node } from '@babel/types';

export interface PluginOptions {
  isJSX: boolean;
}

export interface PluginPass extends BabelPluginPass<PluginOptions> {
  set(key: 'isModuleDeclaration', value: boolean): void;
  get(key: 'isModuleDeclaration'): boolean;
}

export interface BaseNode {
  leadingComments: Node["leadingComments"];
  innerComments: Node["innerComments"];
  trailingComments: Node["trailingComments"];
  start: Node["start"];
  end: Node["end"];
  loc: Node["loc"];
  type: Node["type"];
}
