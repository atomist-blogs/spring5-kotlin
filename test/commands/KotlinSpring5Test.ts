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

import { HandlerResult } from "@atomist/automation-client/HandlerResult";
import { Project } from "@atomist/automation-client/project/Project";
import { TestGenerator } from "./KotlinSpring5EndToEndTest";
import { GishPath, GishProject } from "./springBootStructureInferenceTest";
import { runCommand } from "@atomist/automation-client/action/cli/commandLine";

describe("Kotlin Spring5 generator", () => {

    it("edits project and verifies package", done => {
        edit(GishProject).then(p => {
            done();
        }).catch(done);
    });

    function edit(project: Project): Promise<Project> {
        const kgen = new TestGenerator();
        kgen.artifactId = "my-custom";
        kgen.groupId = "atomist";
        kgen.rootPackage = "com.the.smiths";
        return kgen.projectEditor(null)(project, null, null)
            .then(hr => {
                verify(project);
                return project;
            });
    }

});

export function verify(p: Project) {
    assert(!p.findFileSync(GishPath));
    const f = p.findFileSync("src/main/kotlin/com/the/smiths/MyCustom.kt");
    assert(f);
    const content = f.getContentSync();
    assert(content.includes("class MyCustom"));
    console.log("Verification ok");
}


function compile(hr: HandlerResult): Promise<any> {
    return runCommand("mvn compile", {cwd: (hr as any).baseDir});
}