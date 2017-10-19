import { curry } from "@typed/curry";

import { CommandHandler } from "@atomist/automation-client/decorators";
import { movePackage } from "@atomist/automation-client/operations/generate/java/javaProjectUtils";
import { JavaSeed } from "@atomist/automation-client/operations/generate/java/JavaSeed";
import {
    SpringBootProjectStructure,
} from "@atomist/automation-client/operations/generate/java/SpringBootProjectStructure";
import { updatePom } from "@atomist/automation-client/operations/generate/java/updatePom";
import { Project } from "@atomist/automation-client/project/Project";
import { doWithFiles } from "@atomist/automation-client/project/util/projectUtils";
import { camelize } from "tslint/lib/utils";
import { AllKotlinFiles, inferFromKotlinSource } from "./kotlinUtils";

const DefaultSourceOwner = "johnsonr";
const DefaultSourceRepo = "flux-flix-service";

/**
 * Generator for Kotlin Spring boot apps.
 * Inherits parameters regarding packages etc.
 */
@CommandHandler("Kotlin Spring 5 generator", "generate spring kotlin")
export class KotlinSpring5 extends JavaSeed {

    constructor() {
        super();
        this.sourceOwner = DefaultSourceOwner;
        this.sourceRepo = DefaultSourceRepo;
    }

    public manipulate(project: Project): Promise<Project> {
        let appName = camelize(this.artifactId);
        appName = appName.charAt(0).toUpperCase() + appName.substr(1);
        const smartArtifactId = (this.artifactId === "${projectName}") ? project.name : this.artifactId;
        return updatePom(project, smartArtifactId, this.groupId, this.version, this.description)
            .then(curry(doMovePackage)(this.rootPackage))
            .then(structure => renameApp(project, structure, appName));
    }

}

function doMovePackage(rootPackage: string, project: Project): Promise<SpringBootProjectStructure> {
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
