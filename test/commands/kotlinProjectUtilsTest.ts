import "mocha";
import * as assert from "power-assert";
import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import { KotlinSpringBootProjectStructure } from "../../src/commands/KotlinSpringBootStructure";
import { movePackage } from "../../src/commands/kotlinProjectUtils";

describe("kotlinProjectUtils", () => {

    it("moves files", done => {
        const path = "src/main/kotlin/com/smashing/pumpkins/Gish.kt";
        const p = InMemoryProject.of(
            {
                path: path,
                content: kotlinSource,
            },
        );
        KotlinSpringBootProjectStructure.infer(p).then(structure => {
            assert(structure.applicationPackage === "com.smashing.pumpkins");
            assert(structure.appFilePath === path);
            movePackage(p, structure.applicationPackage, "com.the.smiths")
                .then(_ => {
                    assert(!p.findFileSync(path));
                    const newFile = p.findFileSync("src/main/kotlin/com/the/smiths/Gish.kt");
                    assert(!!newFile);
                    done();
                });
        }).catch(done);
    });

});

const kotlinSource =
    `package com.smashing.pumpkins

@SpringBootApplication
class GishApplication {
}

`;
