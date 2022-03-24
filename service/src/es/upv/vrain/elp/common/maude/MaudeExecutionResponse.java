package es.upv.vrain.elp.common.maude;

import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

public class MaudeExecutionResponse {
	public enum ServiceControlledError {
		TIMED_OUT,
		NATIVE_EXECUTION_ERROR
	}
	
	public static final MaudeExecutionResponse ok(String body) {
		return new MaudeExecutionResponse(true, body, Collections.emptySet(), Collections.emptySet(), Collections.emptySet());
	}
	
	public static final MaudeExecutionResponse fromServiceErrors(ServiceControlledError... serviceErrors) {
		Set<ServiceControlledError> serviceErrorsSet = Arrays.stream(serviceErrors).collect(Collectors.toSet());
		return new MaudeExecutionResponse(false, null, Collections.emptySet(), Collections.emptySet(), serviceErrorsSet);
	}
	
	boolean success;
	String body;
	Set<String> advisories;
	Set<String> warnings;
	Set<ServiceControlledError> serviceErrors;

	public MaudeExecutionResponse(boolean success, String body, Set<String> advisories, Set<String> warnings,
			Set<ServiceControlledError> serviceErrors) {
		this.success = success;
		this.body = body;
		this.advisories = advisories;
		this.warnings = warnings;
		this.serviceErrors = serviceErrors;
	}

	public boolean isSuccess() {
		return success;
	}

	public String getBody() {
		return body;
	}

	public Set<String> getAdvisories() {
		return advisories;
	}

	public Set<String> getWarnings() {
		return warnings;
	}

	public Set<ServiceControlledError> getServiceErrors() {
		return serviceErrors;
	}
}
