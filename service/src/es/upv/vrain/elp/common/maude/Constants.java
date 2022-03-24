package es.upv.vrain.elp.common.maude;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

public class Constants {
	public static final Set<String> COMMANDS = Arrays.stream(new String[] {
			"break",
			"cd", "pushd", "popd", "pwd", "ls",
			"continue",
			"debug",
			"eof",
			"erew", "erewrite",
			"frew", "frewrite",
			"in",
			"load",
			"loop",
			"match", "xmatch",
			"parse",
			"print",
			"quit",
			"red", "reduce",
			"rew", "rewrite",
			"search",
			"select",
			"set",
			"show",
			"trace",
			"unify"
	}).collect(Collectors.toSet());
	
	public static final String WARNING_PREFIX = "Warning: ";
	public static final String ADVISORY_PREFIX = "Advisory: ";
	public static final String SOURCE_LOCATION_PREFIX = "<standard input>, ";
}
