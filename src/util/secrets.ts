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
