import { Flow, isIdentifier, Program, TSTypeReference, Comment, tsTypeOperator, isTSTypeOperator } from '@babel/types';
import { NodePath, Node } from '@babel/traverse';
import helperTypes from '../helper_types';
import { PluginPass } from '../types';
import { warnOnlyOnce } from '../util';
import { replaceWith } from '../utils/replaceWith';

const isCommentFlowPragma = (comment: Comment) => ['@flow', '@flow strict'].includes(comment.value.trim());

export default {
  enter(path: NodePath<Program>) {
    const [firstNode] = path.node.body;

    if (firstNode && firstNode.leadingComments && firstNode.leadingComments.length) {
      const commentIndex = firstNode.leadingComments.findIndex(isCommentFlowPragma);
      if (commentIndex !== -1) {
        (path.get(`body.0.leadingComments.${commentIndex}`) as NodePath<Node>).remove();
      }
    }
    // @ts-ignore recast support
    if (firstNode && firstNode.comments && firstNode.comments.length) {
      // @ts-ignore recast support
      const commentIndex = firstNode.comments.findIndex(isCommentFlowPragma);
      if (commentIndex !== -1) {
        // @ts-ignore recast support
        firstNode.comments.splice(commentIndex, 1);
      }
    }
  },
  exit(this: PluginPass, path: NodePath<Program>) {
    path.traverse({
      /* istanbul ignore next */
      Flow(path: NodePath<Flow>) {
        throw path.buildCodeFrameError('not converted flow node: ' + path.node.type);
      },
    });

    const usedHelperTypes = new Set<keyof typeof helperTypes>();
    const {typeofImports} = this;
    path.traverse({
      TSTypeReference(typeReferencePath: NodePath<TSTypeReference>) {
        const node = typeReferencePath.node;
        if (isIdentifier(node.typeName)) {
          const name = node.typeName.name;
          if (name === '$Call') {
            if (node.typeParameters) {
              if (node.typeParameters.params.length === 1) {
                node.typeName.name = 'ReturnType';
              } else if (node.typeParameters.params.length === 2) {
                node.typeName.name = '$Call1';
                usedHelperTypes.add('$Call1');
              } else if (node.typeParameters.params.length === 3) {
                node.typeName.name = '$Call2';
                usedHelperTypes.add('$Call2');
              } else if (node.typeParameters.params.length === 4) {
                node.typeName.name = '$Call3';
                usedHelperTypes.add('$Call3');
              } else if (node.typeParameters.params.length === 5) {
                node.typeName.name = '$Call4';
                usedHelperTypes.add('$Call4');
              } else if (node.typeParameters.params.length === 6) {
                node.typeName.name = '$Call5';
                usedHelperTypes.add('$Call5');
              } else {
                warnOnlyOnce(
                  '$Call utility type is used with more then 6 type parameters - this is crazy, do not want to fix',
                );
              }
            }
          } else if (name in helperTypes) {
            usedHelperTypes.add(name as keyof typeof helperTypes);
          } else if (typeofImports.has(name)) {
            const parent = typeReferencePath.parent;
            const isParentTypeof = isTSTypeOperator(parent) && parent.operator === 'typeof';
            if (!isParentTypeof) {
              const typeOp = tsTypeOperator(node);
              typeOp.operator = 'typeof';
              replaceWith(typeReferencePath, typeOp);
            }
          }
        }
      },
    });

    const body = path.get('body') as NodePath[];
    const imports = body.filter(st => st.isImportDeclaration());
    let after: NodePath;
    if (imports.length > 0) {
      after = imports[imports.length - 1];
    }
    usedHelperTypes.forEach(helperName => {
      if (after) after.insertAfter(helperTypes[helperName]);
      else body[0].insertBefore(helperTypes[helperName]);
    });
  },
};
