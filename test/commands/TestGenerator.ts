/**
 * Generator that overrides to disable git init and push
 */
import { ActionResult, successOn } from "@atomist/automation-client/action/ActionResult";
import { Project } from "@atomist/automation-client/project/Project";
import { KotlinSpring5 } from "../../src/commands/KotlinSpring5";
import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";

export class TestGenerator extends KotlinSpring5 {

    public created: LocalProject;

    constructor() {
        super();
        // We need a real GitHub token
        this.githubToken = process.env.GITHUB_TOKEN;
    }

    protected initAndSetRemote(p: Project, params: this): Promise<ActionResult<Project>> {
        this.created = p as LocalProject;
        return Promise.resolve(successOn(p));
    }
}