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

import { guid } from "@atomist/automation-client/internal/util/string";
import { SpringBootSeed } from "@atomist/automation-client/operations/generate/java/SpringBootSeed";
import * as appRoot from "app-root-path";
import { CommandHandlerSampleGenerator } from "./commands/CommandHandlerSampleGenerator";
import { EventHandlerSampleGenerator } from "./commands/EventHandlerSampleGenerator";
import { KotlinSpring5 } from "./commands/KotlinSpring5";
import {
    LogzioAutomationEventListener,
    LogzioOptions,
} from "./util/logzio";
import {
    appEnv,
    secret,
} from "./util/secrets";

// tslint:disable-next-line:no-var-requires
const pj = require(`${appRoot.path}/package.json`);

const token = secret("github.token", process.env.GITHUB_TOKEN);

const authEnabled = !appEnv.isLocal;

const logzioOptions: LogzioOptions = {
    applicationId: appEnv.app ? `cf.${appEnv.app.application_id}` : guid(),
    environmentId: appEnv.app ? `cf.${appEnv.app.space_name}` : "local",
    token: secret("logzio.token", process.env.LOGZIO_TOKEN),
};

export const configuration = {
    name: pj.name,
    version: pj.version,
    teamIds: process.env.NODE_ENV !== "production" ? ["T095SFFBK"] : null,
    groups: process.env.NODE_ENV === "production" ? ["all"] : null,
    commands: [
        KotlinSpring5,
        SpringBootSeed,
        CommandHandlerSampleGenerator,
        EventHandlerSampleGenerator,
    ],
    token,
    listeners: logzioOptions.token ? [new LogzioAutomationEventListener(logzioOptions)] : [],
    http: {
        enabled: true,
        forceSecure: process.env.NODE_ENV === "production",
        auth: {
            basic: {
                enabled: process.env.NODE_ENV === "staging",
                username: secret("dashboard.user"),
                password: secret("dashboard.password"),
            },
            bearer: {
                enabled: process.env.NODE_ENV === "staging",
                token,
            },
            github: {
                enabled: authEnabled && process.env.NODE_ENV === "production",
                clientId: secret("oauth.clientId"),
                clientSecret: secret("oauth.clientSecret"),
                callbackUrl: secret("oauth.callbackUrl"),
                adminOrg: "atomisthq",
            },
        },
    },
};
