import { fetchAs } from "../fetch";
import { rootUrl } from "../../stores/context";

export namespace Strass {
    let baseUrl: string;
    rootUrl.subscribe(value => baseUrl = value + "/api");

    export interface ResultAndDiagnostics {
        success: boolean,
        diagnostics: Diagnostic[],
        result: string | null
    }
    
    export interface Diagnostic {
        errorCode: ErrorCode,
        severity: DiagnosticSeverity,
        text: string
    }
    
    export enum DiagnosticSeverity {
        Advisory = "Advisory",
        Error = "Error"
    }

    export enum ErrorCode {
        ContainsCommands = "CONTAINS_COMMANDS",
        MissingRequiredArguments = "MISSING_REQUIRED_ARGUMENT",
        TimedOut = "TIMED_OUT",
        NativeExecutionError = "NATIVE_EXECUTION_ERROR",
        MaudeProvidedDiagnostic = "MAUDE_PROVIDED_DIAGNOSTIC",
        CoreCannotCompleteExecution = "CORE_CANNOT_COMPLETE_EXECUTION",
        ConstraintParseFailure = "CONSTRAINT_PARSE_FAILURE"
    }

    export async function checkProgram(program: string): Promise<ResultAndDiagnostics> {
        return await fetchAs(baseUrl + `/program/check`, {
            method: "POST",
            headers: {
                "content-type": "text/plain"
            },
            body: program
        });
    }

    export interface FixPayload {
        programWithAddendum: string,
        rootModuleName: string,
        addendumModuleName: string,
        constraints: string
    }

    export async function fixProgram(payload: FixPayload): Promise<ResultAndDiagnostics> {
        return await fetchAs(baseUrl + `/program/fix`, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(payload)
        });
    }
}