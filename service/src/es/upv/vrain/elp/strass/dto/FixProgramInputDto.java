package es.upv.vrain.elp.strass.dto;

import com.owlike.genson.annotation.JsonProperty;

public class FixProgramInputDto {
	final String programWithAddendum;
	final String rootModuleName;
	final String addendumModuleName;
	final String constraints;
	
	public FixProgramInputDto(
			@JsonProperty("programWithAddendum") String programWithAddendum,
			@JsonProperty("rootModuleName") String rootModuleName,
			@JsonProperty("addendumModuleName") String addendumModuleName,
			@JsonProperty("constraints") String constraints) {
		this.programWithAddendum = programWithAddendum;
		this.rootModuleName = rootModuleName;
		this.addendumModuleName = addendumModuleName;
		this.constraints = constraints;
	}

	public String getProgramWithAddendum() {
		return programWithAddendum;
	}

	public String getRootModuleName() {
		return rootModuleName;
	}

	public String getAddendumModuleName() {
		return addendumModuleName;
	}

	public String getConstraints() {
		return constraints;
	}
}
