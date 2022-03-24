package es.upv.vrain.elp.common.maude;

import java.io.IOException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import es.upv.vrain.elp.common.interop.NativeProcess;
import es.upv.vrain.elp.common.interop.NativeProcessResult;
import es.upv.vrain.elp.common.maude.MaudeExecutionResponse.ServiceControlledError;

public class MaudeInterpreter extends NativeProcess {
	public MaudeInterpreter(String... command) {
		super(command);
	}
	
	public MaudeExecutionResponse interpretAndWait(MaudeScript script, long timeout, TimeUnit timeoutUnit) {
		return interpretRawAndWait(script.getNormalizedSource(), timeout, timeoutUnit);
	}

	public MaudeExecutionResponse interpretRawAndWait(String script, long timeout, TimeUnit timeoutUnit) {
		try {
			System.out.println("Launching Maude process:\n" + script);
			NativeProcessResult rawResponse = startAndWait(script, timeout, timeoutUnit);
			System.out.println("Returned:\n" + rawResponse.getOutput() + "\n---\n" + rawResponse.getErrorOutput());
			
			return new MaudeOutputParser(rawResponse).parse();
		} catch (TimeoutException _e) {
			return MaudeExecutionResponse.fromServiceErrors(ServiceControlledError.TIMED_OUT);
		} catch (IOException | InterruptedException _e) {
			return MaudeExecutionResponse.fromServiceErrors(ServiceControlledError.NATIVE_EXECUTION_ERROR);
		}
	}
}
