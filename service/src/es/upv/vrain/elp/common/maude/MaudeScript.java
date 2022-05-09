package es.upv.vrain.elp.common.maude;

import java.util.Arrays;

public class MaudeScript {
	static final String LINE_TERMINATOR = "\n";
	
	StringBuilder source;
	
	Boolean hasCommands = null;
	boolean isNormalized = false;
	
	public MaudeScript(String source) {
		this.source = new StringBuilder(source);
	}
	
	public String getNormalizedSource() {
		if (!isNormalized) {
			normalize();
		}
		
		return source.toString();
	}

	public String[] getNormalizedLines() {
		String[] lines = getNormalizedSource().split(LINE_TERMINATOR);
		for (int i = 0; i < lines.length; i++) {
			lines[i] = lines[i].trim();
		}
		return lines;
	}
	
	public boolean hasCommands() {
		if (hasCommands == null) {
			boolean actualComputation = Arrays.stream(getNormalizedLines())
					.anyMatch(line -> {
						String firstToken = line.split(" ", 2)[0];
						return Constants.COMMANDS.contains(firstToken);
					});
			hasCommands = actualComputation;
		}
		
		return hasCommands;
	}
	
	public void append(String additionalSource) {
		source.append(additionalSource);
		hasCommands = null;
		isNormalized = false;
	}
	
	public void appendLine(String additionalSource) {
		append(LINE_TERMINATOR + additionalSource);
	}
	
	public void normalize() {
		String asString = source.toString();
		source.setLength(0);
		source.append(internalNormalize(asString));
		isNormalized = true;
	}
	
	private String internalNormalize(String source) {
		source = source.replaceAll("\\r?\\n", LINE_TERMINATOR);
		source += "\n";
		return source;
	}
}
