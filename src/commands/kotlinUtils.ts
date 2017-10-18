import { KotlinFileParser } from "@atomist/antlr/tree/ast/antlr/kotlin/KotlinFileParser";
import { logger } from "@atomist/automation-client/internal/util/logger";
import {
    SpringBootProjectStructure,
} from "@atomist/automation-client/operations/generate/java/SpringBootProjectStructure";
import { ProjectAsync } from "@atomist/automation-client/project/Project";
import { findFileMatches } from "@atomist/automation-client/tree/ast/astUtils";
import { evaluateScalarValue } from "@atomist/tree-path/path/expressionEngine";

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
            } else {
                const f = files[0];
                const appClass = f.matches[0].$value;
                // Use the AST from the matching file to extract the package
                const packageName = evaluateScalarValue(f.fileNode, "//packageHeader/identifier");
                logger.info(`Spring Boot inference: packageName=${packageName}, appClass=${appClass}`);
                return (packageName && appClass) ?
                    new SpringBootProjectStructure(packageName, appClass, f.file) :
                    undefined;
            }
        });
}
