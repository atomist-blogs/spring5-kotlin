import { curry } from '@typed/curry';

import { JavaSeed } from "@atomist/automation-client/operations/generate/java/JavaSeed";
import { Project } from "@atomist/automation-client/project/Project";
import { KotlinSpringBootProjectStructure } from "./KotlinSpringBootStructure";
import { AllKotlinFiles, movePackage } from "./kotlinProjectUtils";
import { updatePom } from "@atomist/automation-client/operations/generate/java/updatePom";
import { CommandHandler } from "@atomist/automation-client/decorators";
import { doWithFiles } from "@atomist/automation-client/project/util/projectUtils";

/**
 * Generator for Kotlin Spring boot apps
 */
@CommandHandler("Kotlin Spring 5 generator", "edit kotlin")
export class KotlinSpring5 extends JavaSeed {

    public manipulate(project: Project): Promise<Project> {
        const smartArtifactId = (this.artifactId === "${projectName}") ? project.name : this.artifactId;
        return updatePom(project, smartArtifactId, this.groupId, this.version, this.description)
            .then(curry(doMovePackage)(this.rootPackage))
            .then(structure => this.renameApp(project, structure));
    }

    private doMovePackage(project: Project): Promise<KotlinSpringBootProjectStructure> {
        const rootPackage = this.rootPackage;
        return KotlinSpringBootProjectStructure.infer(project)
            .then(structure =>
                structure ?
                    movePackage(project, structure.applicationPackage, rootPackage)
                        .then(files => structure) :
                    undefined);
    }

    private renameApp(project: Project, structure: KotlinSpringBootProjectStructure): Promise<Project> {
        return doWithFiles(project, AllKotlinFiles, f =>
            f.replaceAll("x", "y")
        );
    }

}


function doMovePackage(rootPackage: string, project: Project): Promise<KotlinSpringBootProjectStructure> {
return KotlinSpringBootProjectStructure.infer(project)
    .then(structure =>
        structure ?
            movePackage(project, structure.applicationPackage, rootPackage)
                .then(files => structure) :
            undefined);
}