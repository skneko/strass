package es.upv.vrain.elp.common.interop;

public class NativeProcessResult {
	String output;
	String errorOutput;
	
	public NativeProcessResult(String output, String errorOutput) {
		this.output = output;
		this.errorOutput = errorOutput;
	}

	public String getOutput() {
		return output;
	}

	public String getErrorOutput() {
		return errorOutput;
	}
}
