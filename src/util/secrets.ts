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

import * as cfenv from "cfenv";
import * as _ from "lodash";

export const appEnv = cfenv.getAppEnv();

export const secrets = {
    github: appEnv.getServiceCreds("github-token"),
    dashboard: appEnv.getServiceCreds("dashboard-credentials"),
    logzio: appEnv.getServiceCreds("logzio-credentials"),
    oauth: appEnv.getServiceCreds("generator-github-oauth"),
};

/**
 * Obtain a secret value from the environment
 * @param {string} path
 * @param {string} defaultValue
 * @returns {string}
 */
export function secret(path: string, defaultValue?: string): string {
    return _.get(secrets, path, defaultValue);
}
