import { editor, MarkerSeverity } from "monaco-editor";
import { Strass } from ".";

export function convertToMonacoMarkerData(diagnostic: Strass.Diagnostic, model: editor.ITextModel): editor.IMarkerData | null {
    let match = diagnostic.text.replace(/[\r\n]+/g, " ").match(/line (\d+)(?:\s+\((?:f|o|s)?mod (\S+)\))?\s*: (.*)/);
    if (match) {
        let line = Number(match[1]);
        // let module = match[2];
        let message = match[3];
        let severity = diagnostic.severity;

        if (line > model.getLineCount()) {
            line = model.getLineCount();
        }
    
        return {
            startLineNumber: line,
            startColumn: model.getLineFirstNonWhitespaceColumn(line),
            endLineNumber: line,
            endColumn: model.getLineLastNonWhitespaceColumn(line),
            severity: convertSeverity(severity),
            message
        };
    } else {
        return null;
    }
}

function convertSeverity(severity: Strass.DiagnosticSeverity): MarkerSeverity {
    switch (severity) {
        case Strass.DiagnosticSeverity.Error:
            return MarkerSeverity.Error;
        case Strass.DiagnosticSeverity.Advisory:
            return MarkerSeverity.Warning;
    }
}