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

import { CommandHandler } from "@atomist/automation-client/decorators";
import { AbstractNewAutomation } from "./AbstractNewAutomation";

@CommandHandler("Generate a new command-handler sample project", "generate command-handler-sample")
export class CommandHandlerSampleGenerator extends AbstractNewAutomation {

    constructor() {
        super();
        this.sourceOwner = "atomist-blogs";
        this.sourceRepo = "sof-command";
    }
}
