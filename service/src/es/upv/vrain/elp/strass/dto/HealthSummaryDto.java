package es.upv.vrain.elp.strass.dto;

public class HealthSummaryDto {
	final boolean healthy;

	public HealthSummaryDto(boolean healthy) {
		this.healthy = healthy;
	}

	public boolean isHealthy() {
		return healthy;
	}
}
