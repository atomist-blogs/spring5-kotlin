import { KotlinFileParser } from "@atomist/antlr/tree/ast/antlr/kotlin/KotlinFileParser";
import { findFileMatches } from "@atomist/automation-client/tree/ast/astUtils";
import { evaluateScalarValue } from "@atomist/tree-path/path/expressionEngine";
import { ProjectAsync } from "@atomist/automation-client/project/Project";
import { SpringBootProjectStructure } from "@atomist/automation-client/operations/generate/java/SpringBootProjectStructure";

export const AllKotlinFiles = "src/**/kotlin/**/*.kt";

export const KotlinSourceFiles = "src/main/kotlin/**/*.kt";

/**
 * Infer the Spring Boot structure of a Kotlin project, looking for a Kotlin
 * class annotated with @SpringBootApplication
 * @param {ProjectAsync} p
 * @return {Promise<SpringBootProjectStructure>}
 */
export function inferFromKotlinSource(p: ProjectAsync): Promise<SpringBootProjectStructure> {
    // Run a path expression against the Kotlin ANTLR grammar
    return findFileMatches(p, KotlinFileParser, KotlinSourceFiles,
        "//classDeclaration[//annotation[@value='@SpringBootApplication']]/simpleIdentifier")
        .then(files => {
            if (files.length !== 1) {
                return undefined;
            }
            else {
                const f = files[0];
                const appClass = f.matches[0].$value;
                // Use the AST from the matching file to extract the package
                const packageName = evaluateScalarValue(f.fileNode, "//packageHeader/identifier");
                console.log(`Spring Boot inference: packageName=${packageName}, appClass=${appClass}`);
                return (packageName && appClass) ?
                    new SpringBootProjectStructure(packageName, appClass, f.file) :
                    null;
            }
        });
}