import {
    eventStore,
    setEventStore,
} from "@atomist/automation-client/globals";
import {
    EventFired,
    HandlerContext,
    HandlerResult,
} from "@atomist/automation-client/Handlers";
import { CommandInvocation } from "@atomist/automation-client/internal/invoker/Payload";
import {
    CommandIncoming,
    EventIncoming,
} from "@atomist/automation-client/internal/transport/RequestProcessor";
import * as nsp from "@atomist/automation-client/internal/util/cls";
import { logger } from "@atomist/automation-client/internal/util/logger";
import {
    AutomationEventListener,
    AutomationEventListenerSupport,
} from "@atomist/automation-client/server/AutomationEventListener";
import { EventStore } from "@atomist/automation-client/spi/event/EventStore";
import * as appRoot from "app-root-path";
import { createLogger } from "logzio-nodejs";

/* tslint:disable */
const logzioWinstonTransport = require("winston-logzio");
const _assign = require("lodash.assign");
const pj = require(`${appRoot}/package.json`);
/* tslint:enable */

let logzio: any;

function initLogzioLogging(options: LogzioOptions) {

    const logzioOptions = {
        token: options.token,
        level: "debug",
        type: "automation-client",
        protocol: "https",
        bufferSize: 10,
        extraFields: {
            "service": pj.name,
            "artifact": pj.name,
            "version": pj.version,
            "environment": options.environmentId,
            "application-id": options.applicationId,
        },
    };
    // create the logzio event logger
    logzio = createLogger(logzioOptions);

    logzioWinstonTransport.prototype.log = function(level, msg, meta, callback) {

        if (typeof msg !== "string" && typeof msg !== "object") {
            msg = { message: this.safeToString(msg) };
        } else if (typeof msg === "string") {
            msg = { message: msg };
        }

        if (meta instanceof Error) {
            meta = { error: meta.stack || meta.toString() };
        }

        if (nsp && nsp.get()) {
            _assign(msg, {
                level,
                "meta": meta,
                "operation-name": nsp.get().operation,
                "artifact": nsp.get().name,
                "version": nsp.get().version,
                "team-id": nsp.get().teamId,
                "team-name": nsp.get().teamName,
                "correlation-id": nsp.get().correlationId,
                "invocation-id": nsp.get().invocationId,
            });
        } else {
            _assign(msg, {
                level,
                meta,
            });
        }

        this.logzioLogger.log(msg);

        callback(null, true);
    };

    // create the winston logging adapter
    (logger as any).add(logzioWinstonTransport, logzioOptions);

}

export class LogzioAutomationEventListener extends AutomationEventListenerSupport
    implements AutomationEventListener {

    constructor(options: LogzioOptions) {
        super();
        initLogzioLogging(options);
        const es = new LogzioForwardingEventStore();
    }

    public commandStarting(payload: CommandInvocation, ctx: HandlerContext) {
        nsp.init().set("logzio.start", new Date().getTime());
        this.sendEvent("CommandHandler", "operation", "command-handler",
            payload.name, "starting");
    }

    public commandSuccessful(payload: CommandInvocation, ctx: HandlerContext, result: HandlerResult) {
        this.sendEvent("CommandHandler", "operation", "command-handler",
            payload.name, "successful", result);

    }

    public commandFailed(payload: CommandInvocation, ctx: HandlerContext, err: any) {
        this.sendEvent("CommandHandler", "operation", "command-handler",
            payload.name, "failed", err);
    }

    public eventStarting(payload: EventFired<any>, ctx: HandlerContext) {
        nsp.init().set("logzio.start", new Date().getTime());
        this.sendEvent("EventHandler", "operation", "event-handler",
            payload.extensions.operationName, "starting");
    }

    public eventSuccessful(payload: EventFired<any>, ctx: HandlerContext, result: HandlerResult[]) {
        this.sendEvent("EventHandler", "operation", "event-handler",
            payload.extensions.operationName, "successful", result);
    }

    public eventFailed(payload: EventFired<any>, ctx: HandlerContext, err: any) {
        this.sendEvent("EventHandler", "operation", "event-handler",
            payload.extensions.operationName, "failed", err);
    }

    private sendEvent(identifier: string, eventType: string, type: string, name: string, status: string, err?: any) {
        const start = +nsp.init().get("logzio.start");
        const data: any = {
            "operation-type": type,
            "operation-name": name,
            "artifact": nsp.get().name,
            "version": nsp.get().version,
            "team-id": nsp.get().teamId,
            "team-name": nsp.get().teamName,
            "event-type": eventType,
            "level": status === "failed" ? "error" : "info",
            status,
            "execution-time": new Date().getTime() - start,
            "correlation-id": nsp.get().correlationId,
            "invocation-id": nsp.get().invocationId,
            "message": `${identifier} ${name} invocation ${status} for ${nsp.get().teamName} (${nsp.get().teamId})`,
        };
        if (err) {
            if (status === "failed") {
                data.stacktrace = JSON.stringify(err);
            } else if (status === "successful") {
                data.result = JSON.stringify(err);
            }
        }
        if (logzio) {
            logzio.log(data);
        }
    }
}

export class LogzioForwardingEventStore implements EventStore {

    constructor(private delegate: EventStore = eventStore()) {
        // Switch out the event store so that we can send commands, events etc to logzio.
        setEventStore(this);
    }

    public recordEvent(event: EventIncoming): string {
        this.sendEvent("Incoming event subscription", "event", event);
        return this.delegate.recordEvent(event);
    }

    public recordCommand(command: CommandIncoming): string {
        this.sendEvent("Incoming command", "request", command);
        return this.delegate.recordCommand(command);
    }

    public recordMessage(id: string, message: any): string {
        this.sendEvent("Outgoing message", "message", message);
        return this.delegate.recordMessage(id, message);
    }

    public events(from?: number): any[] {
        return this.delegate.events(from);
    }

    public eventSeries(): [number[], number[]] {
        return this.delegate.eventSeries();
    }

    public commands(from?: number): any[] {
        return this.delegate.commands(from);
    }

    public commandSeries(): [number[], number[]] {
        return this.delegate.commandSeries();
    }

    public messages(from?: number): any[] {
        return this.delegate.messages(from);
    }

    private sendEvent(identifier: string, type: string, payload: any) {
        const data = {
            "operation-name": nsp.get().operation,
            "artifact": nsp.get().name,
            "version": nsp.get().version,
            "team-id": nsp.get().teamId,
            "team-name": nsp.get().teamName,
            "event-type": type,
            "level": "info",
            "correlation-id": nsp.get().correlationId,
            "invocation-id": nsp.get().invocationId,
            "message": `${identifier} of ${nsp.get().operation} for ${nsp.get().teamName} (${nsp.get().teamId})`,
            "payload": JSON.stringify(payload),
        };
        if (logzio) {
            logzio.log(data);
        }
    }
}

export interface LogzioOptions {

    token: string;
    environmentId: string;
    applicationId: string;

}
