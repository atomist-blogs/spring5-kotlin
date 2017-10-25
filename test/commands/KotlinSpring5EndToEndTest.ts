/*
 * Copyright © 2017 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import "mocha";
import * as assert from "power-assert";

import { ActionResult, successOn } from "@atomist/automation-client/action/ActionResult";
import { runCommand } from "@atomist/automation-client/action/cli/commandLine";
import { HandlerResult } from "@atomist/automation-client/HandlerResult";
import { Project } from "@atomist/automation-client/project/Project";
import { KotlinSpring5 } from "../../src/commands/KotlinSpring5";
import { GishPath } from "./springBootStructureInferenceTest";

describe("Kotlin Spring5 generator end to end", () => {

    it("edits and persists", done => {
        generate().then(_ => {
            done();
        }).catch(done);
    }).timeout(200000);

    function generate(): Promise<any> {
        const kgen = new TestGenerator();
        kgen.artifactId = "my-custom";
        kgen.groupId = "atomist";
        kgen.rootPackage = "com.the.smiths";
        return kgen.handle(null, kgen)
            .then(hr => {
                    return verify(kgen.created);
                },
            );
    }

});

function verify(p: Project) {
    assert(!p.findFileSync(GishPath));
    const f = p.findFileSync("src/main/kotlin/com/the/smiths/MyCustomApplication.kt");
    assert(f);
    const content = f.getContentSync();
    assert(content.includes("class MyCustom"));
}

function compile(hr: HandlerResult): Promise<any> {
    return runCommand("mvn compile", {cwd: (hr as any).baseDir});
}

export class TestGenerator extends KotlinSpring5 {

    public created: Project;

    constructor() {
        super();
        this.githubToken = process.env.GITHUB_TOKEN;
    }

    protected initAndSetRemote(p: Project, params: this): Promise<ActionResult<Project>> {
        this.created = p;
        return Promise.resolve(successOn(p));
    }
}
