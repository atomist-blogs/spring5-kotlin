import { CommandHandler } from "@atomist/automation-client/decorators";
import { movePackage } from "@atomist/automation-client/operations/generate/java/javaProjectUtils";
import { JavaSeed } from "@atomist/automation-client/operations/generate/java/JavaSeed";
import { SpringBootProjectStructure, } from "@atomist/automation-client/operations/generate/java/SpringBootProjectStructure";
import { updatePom } from "@atomist/automation-client/operations/generate/java/updatePom";
import { Project } from "@atomist/automation-client/project/Project";
import { doWithFiles } from "@atomist/automation-client/project/util/projectUtils";
import { camelize } from "tslint/lib/utils";
import { AllKotlinFiles, inferFromKotlinSource } from "./kotlinUtils";
import { HandlerContext } from "@atomist/automation-client/HandlerContext";
import { ProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { chainEditors } from "@atomist/automation-client/operations/edit/projectEditorOps";

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

    public projectEditor(ctx: HandlerContext, params: this): ProjectEditor<any> {
        return chainEditors(
            super.projectEditor(ctx, params),
            (project: Project) => manipulate(project, params),
        );
    }

}

function manipulate(project: Project, params: KotlinSpring5): Promise<Project> {
    let appName = camelize(params.artifactId);
    appName = appName.charAt(0).toUpperCase() + appName.substr(1);
    const smartArtifactId = (params.artifactId === "${projectName}") ? project.name : params.artifactId;
    return updatePom(project, smartArtifactId, params.groupId, params.version, params.description)
        .then(p => doMovePackage(p, params.rootPackage))
        .then(structure => renameApp(project, structure, appName));
}

function doMovePackage(project: Project, rootPackage: string): Promise<SpringBootProjectStructure> {
    return inferFromKotlinSource(project)
        .then(structure =>
            structure ?
                movePackage(project, structure.applicationPackage, rootPackage, AllKotlinFiles)
                    .then(files => structure) :
                undefined);
}

function renameApp(project: Project, structure: SpringBootProjectStructure, appName: string): Promise<Project> {
    return doWithFiles(project, AllKotlinFiles, f =>
        f.replaceAll(structure.applicationClassStem, appName),
    ).then(p => p.moveFile(structure.appClassFile.path,
        structure.appClassFile.path.replace(structure.applicationClassStem, appName)));
}
