package es.upv.vrain.elp.common.maude;

import java.util.regex.Matcher;

import es.upv.vrain.elp.common.utils.StringUtils;

public class MaudeInputSanitizer {
	public String qid(String string) {
		string = string.replaceAll("\\s", "");				// remove all whitespace
		string = StringUtils.removeDiacritics(string);
		string = string.replaceAll("[^\\x20-\\x7e]", "");	// keep only ASCII alphanumeric
		return string;
	}
	
	public String stringLiteralContent(String string) {
		string = string.replaceAll("\"", "\\\"");	// replace " by \" to prevent Maude command injection
		string = string.replaceAll("\\r?\\n", Matcher.quoteReplacement("\\n"));
		return string;
	}
}
