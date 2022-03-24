package es.upv.vrain.elp.strass;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import es.upv.vrain.elp.strass.dto.ErrorCode;

public class Settings {
	public static final String[] MAUDE_COMMAND = new String[] { "maude", "-no-advise", "-no-banner", "-no-wrap", "-no-tecla", "-batch" };
	public static final String[] MAUDE_FILES_TO_LOAD = new String[] { "~/elp/strass/core/src/main.maude", "~/elp/strass/core/src/io.maude" };
	
	public static final long TIMEOUT = 1;
	public static final TimeUnit TIMEOUT_UNIT = TimeUnit.MINUTES;
	
	public static final int DIAGNOSTICS_LIMIT = 30;
	
	public static final String MAUDE_DEBUG_ADDENDUM = "set print format off .\nset print conceal on .\nprint conceal fmod_is_sorts_.____endfm .\nprint conceal mod_is_sorts_._____endm .";

	public static final Set<ErrorCode> SERVER_SIDE_ERRORS = new HashSet<>(Arrays.asList(
			ErrorCode.NATIVE_EXECUTION_ERROR));
}
