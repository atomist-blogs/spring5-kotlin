import "mocha";
import * as assert from "power-assert";
import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import { AllKotlinFiles, inferFromKotlinSource } from "../../src/commands/kotlinUtils";
import { movePackage } from "@atomist/automation-client/operations/generate/java/javaProjectUtils";

describe("package move", () => {

    it("moves files", done => {
        const path = "src/main/kotlin/com/smashing/pumpkins/Gish.kt";
        const p = InMemoryProject.of(
            {
                path: path,
                content: kotlinSource,
            },
        );
        inferFromKotlinSource(p).then(structure => {
            assert(structure.applicationPackage === "com.smashing.pumpkins");
            assert(structure.appClassFile.path === path);
            movePackage(p, structure.applicationPackage, "com.the.smiths", AllKotlinFiles)
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
