import { KotlinFileParser } from "@atomist/antlr/tree/ast/antlr/kotlin/KotlinFileParser";
import { findFileMatches } from "@atomist/automation-client/tree/ast/astUtils";
import { parsePathExpression } from "@atomist/tree-path/path/pathExpressionParser";
import { TreeNode } from "@atomist/tree-path/TreeNode";
import { evaluateExpression } from "@atomist/tree-path/path/expressionEngine";
import { ProjectAsync } from "@atomist/automation-client/project/Project";

export class KotlinSpringBootProjectStructure {

    public static infer(p: ProjectAsync): Promise<KotlinSpringBootProjectStructure> {
        return findFileMatches(p, KotlinFileParser, "src/main/kotlin/**/*.kt",
            "//classDeclaration[//annotation[@value='@SpringBootApplication']]/simpleIdentifier")
            .then(files => {
                if (files.length !== 1) {
                    return undefined;
                }
                else {
                    const f = files[0];
                    // TODO pretty this up with AST is exposed and we have scalar path expressions
                    return KotlinFileParser.toAst(f.file).then(ast => {
                        console.log(`Name is [${f.matches[0].$value}]`);
                        const appClass = f.matches[0].$value;
                        console.log(JSON.stringify(ast));
                        const nodes = evaluateExpression(ast, parsePathExpression("//packageHeader/identifier")) as TreeNode[];
                        const packageName = nodes[0].$value;
                        console.log(`Spring Boot inference: packageName=${packageName}, appClass=${appClass}`);
                        return (packageName && appClass) ?
                            new KotlinSpringBootProjectStructure(packageName, appClass, f.file.path) :
                            null;
                    });
                }
            });

    }

    /**
     * The stem of the application class. Strip "Application" if present.
     */
    public applicationClassStem = this.applicationClass.replace(/Application$/, "");

    /**
     * @param applicationPackage The package with the Spring Boot application class in it.
     * @param applicationClass Name of the application class within the given package
     */
    constructor(public applicationPackage: string, public applicationClass: string, public appFilePath: string) {
    }

}
