package es.upv.vrain.elp.strass.dto;

import java.util.Arrays;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;

import es.upv.vrain.elp.common.maude.MaudeExecutionResponse;
import es.upv.vrain.elp.strass.Settings;

public class ResultAndDiagnosticsDto {
	final boolean success;
	String result;
	final Set<Diagnostic> diagnostics;
	
	public static ResultAndDiagnosticsDto fromDiagnostics(Diagnostic... diagnostics) {
		return from(null, Arrays.asList(diagnostics));
	}
	
	public static ResultAndDiagnosticsDto fromDiagnostics(Collection<Diagnostic> diagnostics) {
		return from(null, diagnostics);
	}
	
	public static ResultAndDiagnosticsDto fromDiagnostics(String result, Diagnostic... diagnostics) {
		return from(result, Arrays.asList(diagnostics));
	}
	
	public static ResultAndDiagnosticsDto from(String result, Collection<Diagnostic> diagnostics) {
		boolean containsErrors = diagnostics.stream().anyMatch(diagnostic -> diagnostic.getSeverity() == Diagnostic.Severity.Error);
		Set<Diagnostic> diagnosticSet = diagnostics.stream().collect(Collectors.toSet());
		
		return new ResultAndDiagnosticsDto(!containsErrors, result, diagnosticSet);
	}
	
	public static ResultAndDiagnosticsDto fromMaudeExecution(MaudeExecutionResponse result) {
		return from(result.getBody(), Diagnostic.fromMaudeExecution(result));
	}

	public ResultAndDiagnosticsDto(boolean success, String result, Set<Diagnostic> diagnostics) {
		this.success = success;
		this.result = result;
		this.diagnostics = diagnostics;
	}
	
	public void suppressResult() {
		result = null;
	}
	
	public void suppressResultIfSuccessIs(boolean expected) {
		if (success == expected) {
			result = null;
		}
	}

	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}

	public boolean isSuccess() {
		return success;
	}

	public Set<Diagnostic> getDiagnostics() {
		return diagnostics;
	}
	
	public ResponseBuilder toResponse() {
		boolean isServerFault = diagnostics.stream()
				.anyMatch(diagnostic -> Settings.SERVER_SIDE_ERRORS.contains(diagnostic.getErrorCode()));
		
		Response.Status status;
		if (isServerFault) {
			status = Response.Status.INTERNAL_SERVER_ERROR;
		} else if (!success) {
			status = Response.Status.BAD_REQUEST;
		} else {
			status = Response.Status.OK;
		}
		
		return Response.status(status).entity(this);
	}
}
