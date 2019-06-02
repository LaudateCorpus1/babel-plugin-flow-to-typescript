import { InterfaceDeclaration } from '@babel/types';
import { NodePath } from '@babel/traverse';

import { convert_interface_declaration } from '../converters/convert_interface_declaration';

export function InterfaceDeclaration(path: NodePath<InterfaceDeclaration>) {
  path.replaceWith(convert_interface_declaration(path));
}
