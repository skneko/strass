import { editor, MarkerSeverity } from "monaco-editor";
import { Strass } from ".";

export function convertToMonacoMarkerData(diagnostic: Strass.Diagnostic, model: editor.ITextModel, lineOffset = 0): editor.IMarkerData | null {
    const match = diagnostic.text.replace(/[\r\n]+/g, " ").match(/line (\d+)(?:\s+\((?:f|o|s)?mod (\S+)\))?\s*: (.*)/);
    if (match) {
        let line = Number(match[1]) + lineOffset;
        // let module = match[2];
        const message = match[3];
        const severity = diagnostic.severity;

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