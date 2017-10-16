import { Project } from "@atomist/automation-client/project/Project";
import { logger } from "@atomist/automation-client/internal/util/logger";
import { doWithFiles } from "@atomist/automation-client/project/util/projectUtils";

export const AllKotlinFiles = "src/**/kotlin/**/*.kt";

export const KotlinSourceFiles = "src/main/kotlin/**/*.kt";

/**
 * Move files from one Kotlin package to another.
 *
 * @param project      project whose files should be moved
 * @param oldPackage   name of package to move from
 * @param newPackage   name of package to move to
 */
export function movePackage(project: Project, oldPackage: string, newPackage: string): Promise<Project> {
    const pathToReplace = packageToPath(oldPackage);
    const newPath = packageToPath(newPackage);
    logger.info("Replacing path [%s] with [%s], package [%s] with [%s]",
        pathToReplace, newPath, oldPackage, newPackage);
    // Select test tree as well as src tree
    return doWithFiles(project, AllKotlinFiles, f => {
        f.recordReplaceAll(oldPackage, newPackage)
            .recordSetPath(f.path.replace(pathToReplace, newPath));
    });

}

/**
 * Convert a Java package (with dots) to a source path
 * @param pkg package
 * @return {string}
 */
export function packageToPath(pkg: string): string {
    return pkg.replace(/\./g, "/");
}
