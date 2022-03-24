package es.upv.vrain.elp.strass.dto;

import java.util.ArrayList;
import java.util.List;

import es.upv.vrain.elp.common.maude.MaudeExecutionResponse;
import es.upv.vrain.elp.common.maude.MaudeExecutionResponse.ServiceControlledError;
import es.upv.vrain.elp.strass.Settings;

public class Diagnostic {
	public enum Severity {
		Advisory,
		Error
	}
	
	public static List<Diagnostic> fromMaudeExecution(MaudeExecutionResponse result) {
		List<Diagnostic> diagnostics = new ArrayList<>();
		
		for (String advisory : result.getAdvisories()) {
			if (diagnostics.size() > Settings.DIAGNOSTICS_LIMIT) break;
			diagnostics.add(new Diagnostic(ErrorCode.MAUDE_PROVIDED_DIAGNOSTIC, Severity.Advisory, advisory));
		}
		
		for (String warning : result.getWarnings()) {
			if (diagnostics.size() > Settings.DIAGNOSTICS_LIMIT) break;
			diagnostics.add(new Diagnostic(ErrorCode.MAUDE_PROVIDED_DIAGNOSTIC, Severity.Error, warning));
		}
		
		for (ServiceControlledError error : result.getServiceErrors()) {
			if (diagnostics.size() > Settings.DIAGNOSTICS_LIMIT) break;
			
			ErrorCode code;
			String message = null;
			switch (error) {
			case TIMED_OUT: 
				code = ErrorCode.TIMED_OUT;
				message = "The time limit has been exceeded: " 
						+ Settings.TIMEOUT + " " + Settings.TIMEOUT_UNIT.name().toLowerCase();
				break;
			case NATIVE_EXECUTION_ERROR: 
				code = ErrorCode.NATIVE_EXECUTION_ERROR; 
				message = "Could not spawn a Maude process, or it did not exit successfully.";
				break;
			default: throw new RuntimeException("Unreachable: invalid enumeration value");
			}
			
			diagnostics.add(new Diagnostic(code, Severity.Error, message));
		}
		
		return diagnostics;
	}
	
	final ErrorCode errorCode;
	final Diagnostic.Severity severity;
	final String text;
	
	public Diagnostic(ErrorCode code) {
		this(code, Severity.Error, null);
	}
	
	public Diagnostic(ErrorCode code, Diagnostic.Severity severity) {
		this(code, severity, null);
	}
	
	public Diagnostic(ErrorCode code, String text) {
		this(code, Severity.Error, text);
	}
	
	public Diagnostic(ErrorCode errorCode, Diagnostic.Severity severity, String text) {
		this.errorCode = errorCode;
		this.severity = severity;
		this.text = text;
	}

	public Diagnostic.Severity getSeverity() {
		return severity;
	}

	public ErrorCode getErrorCode() {
		return errorCode;
	}

	public String getText() {
		return text;
	}
}