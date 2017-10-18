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

import { runCommand } from "@atomist/automation-client/internal/util/commandLine";
import { HandlerResult } from "@atomist/automation-client/HandlerResult";
import { TestGenerator } from "./KotlinSpring5EndToEndTest";
import { Project } from "@atomist/automation-client/project/Project";
import { GishPath, GishProject } from "./springBootStructureInferenceTest";

describe("Kotlin Spring5 generator", () => {

    it("edits project and verifies package", done => {
        edit(GishProject).then(p => {
            done();
        }).catch(done);
    });

    function edit(p: Project): Promise<Project> {
        const kgen = new TestGenerator();
        kgen.artifactId = "my-custom";
        kgen.groupId = "atomist";
        kgen.rootPackage = "com.the.smiths";
        return kgen.manipulate(p)
            .then(p => {
                assert(!p.findFileSync(GishPath));
                const f = p.findFileSync("src/main/kotlin/com/the/smiths/Gish.kt");
                assert(f);
                //assert(f.getContentSync().includes("MyCustomApplication"));
                return p;
            });
    }

    function verify(hr: HandlerResult): Promise<any> {
        console.log("verification");
        return runCommand("mvn compile", {cwd: (hr as any).baseDir})
    }

});

