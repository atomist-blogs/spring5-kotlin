import {
    CommandHandler,
    HandlerContext,
    Tags,
} from "@atomist/automation-client/Handlers";
import {
    ProjectEditor,
    successfulEdit,
} from "@atomist/automation-client/operations/edit/projectEditor";
import { movePackage } from "@atomist/automation-client/operations/generate/java/javaProjectUtils";
import { JavaSeed } from "@atomist/automation-client/operations/generate/java/JavaSeed";
import {
    SpringBootProjectStructure,
} from "@atomist/automation-client/operations/generate/java/SpringBootProjectStructure";
import { updatePom } from "@atomist/automation-client/operations/generate/java/updatePom";
import { Project } from "@atomist/automation-client/project/Project";
import { doWithFiles } from "@atomist/automation-client/project/util/projectUtils";
import { camelize } from "tslint/lib/utils";
import {
    AllKotlinFiles,
    inferFromKotlinSource,
} from "./kotlinUtils";

const DefaultSourceOwner = "johnsonr";
const DefaultSourceRepo = "flux-flix-service";

/**
 * Generator for Kotlin Spring boot apps.
 * Inherits parameters regarding packages etc.
 */
@CommandHandler("Kotlin Spring 5 generator", "generate spring-boot kotlin")
@Tags("java", "spring", "kotlin", "generator")
export class KotlinSpring5 extends JavaSeed {

    constructor() {
        super();
        // Initialize parameters
        this.sourceOwner = DefaultSourceOwner;
        this.sourceRepo = DefaultSourceRepo;

    }

    public projectEditor(ctx: HandlerContext, params: this): ProjectEditor<this> {
        return transformSeed;
    }

}

const transformSeed: ProjectEditor = (project: Project, ctx: HandlerContext, params: KotlinSpring5) => {
    const smartArtifactId = (params.artifactId === "${projectName}") ? project.name : params.artifactId;
    let appName = camelize(smartArtifactId);
    appName = appName.charAt(0).toUpperCase() + appName.substr(1);
    return updatePom(project, smartArtifactId, params.groupId, params.version, params.description)
        .then(inferFromKotlinSource)
        .then(structure =>
            !!structure ?
                renameAppClass(project, structure, appName)
                    .then(p =>
                        movePackage(p, structure.applicationPackage, params.rootPackage, AllKotlinFiles)) :
                project)
        .then(successfulEdit);
};

function renameAppClass(project: Project,
                        structure: SpringBootProjectStructure,
                        appName: string): Promise<Project> {
    return doWithFiles(project, AllKotlinFiles, file =>
        file.replaceAll(structure.applicationClassStem, appName)
            .then(f => f.path.includes(structure.applicationClassStem) ?
                f.setPath(f.path.replace(structure.applicationClassStem, appName)) :
                f,
            ),
    );
}
