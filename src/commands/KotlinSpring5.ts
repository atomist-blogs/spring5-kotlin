import { curry } from "@typed/curry";

import { JavaSeed } from "@atomist/automation-client/operations/generate/java/JavaSeed";
import { Project } from "@atomist/automation-client/project/Project";
import { updatePom } from "@atomist/automation-client/operations/generate/java/updatePom";
import { CommandHandler } from "@atomist/automation-client/decorators";
import { doWithFiles } from "@atomist/automation-client/project/util/projectUtils";
import { AllKotlinFiles, inferFromKotlinSource } from "./kotlinUtils";
import { SpringBootProjectStructure } from "@atomist/automation-client/operations/generate/java/SpringBootProjectStructure";
import { movePackage } from "@atomist/automation-client/operations/generate/java/javaProjectUtils";

/**
 * Generator for Kotlin Spring boot apps.
 * Inherits parameters regarding packages etc.
 */
@CommandHandler("Kotlin Spring 5 generator", "edit kotlin")
export class KotlinSpring5 extends JavaSeed {

    public manipulate(project: Project): Promise<Project> {
        const smartArtifactId = (this.artifactId === "${projectName}") ? project.name : this.artifactId;
        return updatePom(project, smartArtifactId, this.groupId, this.version, this.description)
            .then(curry(doMovePackage)(this.rootPackage))
            .then(structure => this.renameApp(project, structure));
    }

    private renameApp(project: Project, structure: SpringBootProjectStructure): Promise<Project> {
        return doWithFiles(project, AllKotlinFiles, f =>
            f.replaceAll("x", "y")
        );
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