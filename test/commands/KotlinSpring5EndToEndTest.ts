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

import { HandlerResult } from "@atomist/automation-client/HandlerResult";
import { runCommand } from "@atomist/automation-client/internal/util/commandLine";
import "mocha";
import { KotlinSpring5 } from "../../src/commands/KotlinSpring5";

describe("Kotlin Spring5 generator end to end", () => {

    // TODO fix this
    it.skip("edits and persists", done => {
        generate().then(_ => {
            done();
        }).catch(done);
    }); // .timeout(200000);

    function generate(): Promise<any> {
        const kgen = new TestGenerator();
        kgen.artifactId = "k5";
        kgen.groupId = "atomist";
        kgen.rootPackage = "com.the.smiths";
        return kgen.handle(null).then(verify);
    }

    function verify(hr: HandlerResult): Promise<any> {
        return runCommand("mvn compile", {cwd: (hr as any).baseDir});
    }

});

export class TestGenerator extends KotlinSpring5 {

    constructor() {
        super();
        this.githubToken = process.env.GITHUB_TOKEN;
        this.local = true;
    }
}
