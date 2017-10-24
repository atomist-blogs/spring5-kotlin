import { CommandHandler } from "@atomist/automation-client/decorators";
import {
    AllJavaFiles, movePackage,
    packageToPath
} from "@atomist/automation-client/operations/generate/java/javaProjectUtils";
import { JavaSeed } from "@atomist/automation-client/operations/generate/java/JavaSeed";
import { SpringBootProjectStructure, } from "@atomist/automation-client/operations/generate/java/SpringBootProjectStructure";
import { updatePom } from "@atomist/automation-client/operations/generate/java/updatePom";
import { Project, ProjectAsync } from "@atomist/automation-client/project/Project";
import { doWithFiles, saveFromFiles } from "@atomist/automation-client/project/util/projectUtils";
import { camelize } from "tslint/lib/utils";
import { AllKotlinFiles, inferFromKotlinSource } from "./kotlinUtils";
import { HandlerContext } from "@atomist/automation-client/HandlerContext";
import { ProjectEditor, successfulEdit } from "@atomist/automation-client/operations/edit/projectEditor";
import { chainEditors } from "@atomist/automation-client/operations/edit/projectEditorOps";
import { logger } from "@atomist/automation-client/internal/util/logger";
import { AllFiles } from "@atomist/automation-client/project/fileGlobs";

const DefaultSourceOwner = "johnsonr";
const DefaultSourceRepo = "flux-flix-service";

/**
 * Generator for Kotlin Spring boot apps.
 * Inherits parameters regarding packages etc.
 */
@CommandHandler("Kotlin Spring 5 generator", "Generate a new spring Kotlin project")
export class KotlinSpring5 extends JavaSeed {

    constructor() {
        super();
        // Initialize parameters
        this.sourceOwner = DefaultSourceOwner;
        this.sourceRepo = DefaultSourceRepo;
    }

    public projectEditor(ctx: HandlerContext, params: this): ProjectEditor {
        // return chainEditors(
        //     super.projectEditor(ctx, params),
        //     diagnosticDump("BEFORE transform seed"),
        //     (project: Project) => transformSeed(project, params),
        //     diagnosticDump("after TRANSFORM seed")
        // );
        return  (project: Project) => transformSeed(project, params)
            .then(successfulEdit);
    }

}

function transformSeed(project: Project, params: KotlinSpring5): Promise<Project> {
    let appName = camelize(params.artifactId);
    appName = appName.charAt(0).toUpperCase() + appName.substr(1);
    const smartArtifactId = (params.artifactId === "${projectName}") ? project.name : params.artifactId;
    return updatePom(project, smartArtifactId, params.groupId, params.version, params.description)
        .then(inferFromKotlinSource)
        .then(structure =>
            !!structure ?
                renameAppClass(project, structure, appName)
                    .then(p =>
                        movePackage(p, structure.applicationPackage, params.rootPackage, AllKotlinFiles)) :
                project)
        .then(diagnosticDump("after ALL"));
}

function renameAppClass(project: Project, structure: SpringBootProjectStructure, appName: string): Promise<Project> {
    return doWithFiles(project, AllKotlinFiles, f =>
        f.replaceAll(structure.applicationClassStem, appName)
            .then(f => f.path.includes(structure.applicationClassStem) ?
                f.setPath(f.path.replace(structure.applicationClassStem, appName)) :
                f
            )
    )
        .then(diagnosticDump(`AFTER replace all ${structure.applicationClassStem} using new app name ${appName}`));
}

const Separator = "-------------------";

/**
 * Use as a diagnostic step in an editor change.
 */
function diagnosticDump(stepName: string, globPattern: string = AllFiles): (project: Project) => Promise<Project> {
    return project => saveFromFiles(project, globPattern, f => f.path)
        .then(paths => console.log(`${Separator}\nProject name ${project.name}: step=${stepName}]n${paths.join(",")}\n${Separator}`))
        .then(() => project);
}


// export function movePackage<P extends ProjectAsync>(project: P, oldPackage: string, newPackage: string,
//                                                     globPattern: string = AllJavaFiles): Promise<P> {
//     const pathToReplace = packageToPath(oldPackage);
//     const newPath = packageToPath(newPackage);
//     logger.info("Replacing path [%s] with [%s], package [%s] with [%s]",
//         pathToReplace, newPath, oldPackage, newPackage);
//     return doWithFiles(project, globPattern, f => {
//         f.replaceAll(oldPackage, newPackage)
//             .then(f => f.setPath(f.path.replace(pathToReplace, newPath)));
//     });
// }