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

import { UniversalSeed } from "@atomist/automation-client/operations/generate/UniversalSeed";
import { Microgrammar } from "@atomist/microgrammar/Microgrammar";
import { Project } from "@atomist/automation-client/project/Project";
import { doWithAtMostOneMatch } from "@atomist/automation-client/project/util/parseUtils";
import { HandlerContext } from "@atomist/automation-client/Handlers";
import {
    ProjectEditor,
    successfulEdit,
} from "@atomist/automation-client/operations/edit/projectEditor";

/**
 * Abstract generator command to create a new Ndde.JS automation client repo
 */
export abstract class AbstractNewAutomation extends UniversalSeed {

    public projectEditor(ctx: HandlerContext, params: this): ProjectEditor {
        const owner = this.targetOwner.toLowerCase();
        const repo = this.targetRepo.toLowerCase();
        return (p: Project, context: HandlerContext, params?: this) => {
            return doWithAtMostOneMatch<{ name: string },
                Project>(p,"package.json", packageJsonNameGrammar, m => {
                m.name = `@${owner}/${repo}`;
            })
            .then(p => doWithAtMostOneMatch<{ name: string, owner: string },
                Project>(p, "package.json", packageJsonUrlGrammar, m => {
                m.name = repo;
                m.owner = owner;
            }))
            .then(p => doWithAtMostOneMatch<{ name: string, owner: string },
                Project>(p, "package.json", packageJsonHomepageGrammar, m => {
                m.name = repo;
                m.owner = owner;
            }))
            .then(p => doWithAtMostOneMatch<{ name: string, owner: string },
                Project>(p, "package.json", packageJsonIssuesGrammar, m => {
                m.name = repo;
                m.owner = owner;
            }))
            .then(successfulEdit);
        };
    }
}

// "name": "@atomist/automation-client-samples",
const packageJsonNameGrammar = Microgrammar.fromString<{ name: string }>(
    '"name": "${name}"', {
        name: /[^"]+/,
    });

// "url": "https://github.com/atomist-blogs/spring5-kotlin.git"
const packageJsonUrlGrammar = Microgrammar.fromString<{ name: string, owner: string }>(
    '"url": "https://github.com/${owner}/${name}.git"', {
        owner: /[a-zA-z_-]+/,
        name: /[a-zA-z_-]+/,
    });

// "homepage": "https://github.com/atomist-blogs/spring5-kotlin#readme"
const packageJsonHomepageGrammar = Microgrammar.fromString<{ name: string, owner: string }>(
    '"homepage": "https://github.com/${owner}/${name}#readme"', {
        owner: /[a-zA-z_-]+/,
        name: /[a-zA-z_-]+/,
    });

// "url": "https://github.com/atomist-blogs/spring5-kotlin/issues"
const packageJsonIssuesGrammar = Microgrammar.fromString<{ name: string, owner: string }>(
    '"url": "https://github.com/${owner}/${name}/issues"', {
        owner: /[a-zA-z_-]+/,
        name: /[a-zA-z_-]+/,
    });