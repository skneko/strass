package es.upv.vrain.elp.common.utils;

import java.text.Normalizer;

public class StringUtils {
	public static boolean isNullOrEmpty(String string) {
		return string == null || string.trim().isEmpty();
	}
	
	public static String removeDiacritics(String string) {
		return Normalizer.normalize(string, Normalizer.Form.NFD).replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
	}
}
