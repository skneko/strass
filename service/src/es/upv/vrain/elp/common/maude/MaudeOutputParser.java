package es.upv.vrain.elp.common.maude;

import java.util.Collections;
import java.util.HashSet;
import java.util.Scanner;
import java.util.Set;

import es.upv.vrain.elp.common.interop.NativeProcessResult;

public class MaudeOutputParser {
	final NativeProcessResult result;

	String body;
	Set<String> advisories = new HashSet<>();
	Set<String> warnings = new HashSet<>();

	boolean hasParsed = false;

	public MaudeOutputParser(final NativeProcessResult result) {
		this.result = result;
	}

	public MaudeExecutionResponse parse() {
		if (!hasParsed) {
			parseBody(result.getOutput());
			parseDiagnostics(result.getErrorOutput());

			hasParsed = true;
		}

		return new MaudeExecutionResponse(warnings.isEmpty(), body, advisories, warnings, Collections.emptySet());
	}

	private void parseBody(final String output) {
		body = output;
		body = body.replaceAll("[\\r\\n]+", "\n");
		body = removeSuffixIfPossible("Bye.\n", output);
	}

	private void parseDiagnostics(final String errorOutput) {
		Scanner errorReader = new Scanner(errorOutput);

		String accumulatedText = null;
		boolean accumulatedIsWarning = false;
		while (errorReader.hasNextLine()) {
			final String line = errorReader.nextLine();
			final boolean isAdvisory = line.startsWith(Constants.ADVISORY_PREFIX);
			final boolean isWarning = line.startsWith(Constants.WARNING_PREFIX);
			final boolean isBeginning = isAdvisory || isWarning;

			if (isBeginning && accumulatedText != null) {
				if (accumulatedIsWarning) {
					warnings.add(accumulatedText);
				} else {
					advisories.add(accumulatedText);
				}

				accumulatedText = null;
			}

			if (isAdvisory) {
				String prefixedWithSourceLocation = removePrefixIfPossible(Constants.ADVISORY_PREFIX, line);
				String header = removePrefixIfPossible(Constants.SOURCE_LOCATION_PREFIX, prefixedWithSourceLocation);

				accumulatedText = header;
				accumulatedIsWarning = false;
			} else if (isWarning) {
				String prefixedWithSourceLocation = removePrefixIfPossible(Constants.WARNING_PREFIX, line);
				String header = removePrefixIfPossible(Constants.SOURCE_LOCATION_PREFIX, prefixedWithSourceLocation);

				accumulatedText = header;
				accumulatedIsWarning = true;
			} else {
				accumulatedText += "\n" + line;
			}
		}

		if (accumulatedText != null) {
			if (accumulatedIsWarning) {
				warnings.add(accumulatedText);
			} else {
				advisories.add(accumulatedText);
			}
		}

		errorReader.close();
	}

	private String removePrefixIfPossible(String prefix, String text) {
		if (text != null && prefix != null && text.startsWith(prefix)) {
			return text.substring(prefix.length());
		} else {
			return text;
		}
	}

	private String removeSuffixIfPossible(String suffix, String text) {
		if (text != null && suffix != null && text.endsWith(suffix)) {
			return text.substring(0, text.length() - suffix.length());
		} else {
			return text;
		}
	}
}
