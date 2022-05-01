package es.upv.vrain.elp.strass;

import java.util.List;
import java.util.stream.Stream;

import javax.ws.rs.Consumes;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import es.upv.vrain.elp.common.maude.MaudeExecutionResponse;
import es.upv.vrain.elp.common.maude.MaudeInputSanitizer;
import es.upv.vrain.elp.common.maude.MaudeInterpreter;
import es.upv.vrain.elp.common.maude.MaudeScript;
import es.upv.vrain.elp.common.utils.StringUtils;
import es.upv.vrain.elp.strass.dto.Diagnostic;
import es.upv.vrain.elp.strass.dto.ErrorCode;
import es.upv.vrain.elp.strass.dto.FixProgramInputDto;
import es.upv.vrain.elp.strass.dto.HealthSummaryDto;
import es.upv.vrain.elp.strass.dto.ResultAndDiagnosticsDto;

@Path("")
public class StrassService {
	static final MaudeInputSanitizer sanitizer = new MaudeInputSanitizer();
	
	static final String[] maudeCommand =
			Stream.of(Settings.MAUDE_COMMAND, Settings.MAUDE_FILES_TO_LOAD)
			.flatMap(Stream::of)
			.toArray(String[]::new);
	
	@GET @Path("health")
	@Produces(MediaType.APPLICATION_JSON)
	public HealthSummaryDto getHealth() {
		return new HealthSummaryDto(true);
	}
	
	@POST @Path("program/check")
	@Consumes(MediaType.TEXT_PLAIN)
	@Produces(MediaType.APPLICATION_JSON)
	public ResultAndDiagnosticsDto checkProgramValid(
			String program, 
			@QueryParam("useFullMaude") @DefaultValue("false") boolean useFullMaude) 
	{
		MaudeScript script = new MaudeScript(program);
		if (script.hasCommands()) {
			return ResultAndDiagnosticsDto.fromDiagnostics(
					new Diagnostic(ErrorCode.CONTAINS_COMMANDS, "The program cannot contain commands."));
		}
		
		script.appendLine(Settings.MAUDE_DEBUG_ADDENDUM);
		
		if (useFullMaude) {
			script.appendLine("(red true .)");
		} else {
			script.appendLine("red true .");
		}
		
		script.appendLine("quit .");
		
		MaudeExecutionResponse output = runMaude(script);
		ResultAndDiagnosticsDto dto = ResultAndDiagnosticsDto.fromMaudeExecution(output);
		dto.suppressResult();
		return dto;
	}
	
    @POST @Path("program/fix")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response fixProgram(FixProgramInputDto input) {   
    	if (StringUtils.isNullOrEmpty(input.getProgramWithAddendum())) {
    		return Response.status(Response.Status.BAD_REQUEST)
    				.entity(ResultAndDiagnosticsDto.fromDiagnostics(
    						new Diagnostic(ErrorCode.MISSING_REQUIRED_ARGUMENTS, "The program is required.")))
    				.build();
    	}
    	if (StringUtils.isNullOrEmpty(input.getRootModuleName()) || StringUtils.isNullOrEmpty(input.getAddendumModuleName())) {
    		return Response.status(Response.Status.BAD_REQUEST)
    				.entity(ResultAndDiagnosticsDto.fromDiagnostics(
    						new Diagnostic(ErrorCode.MISSING_REQUIRED_ARGUMENTS, "The module names are required.")))
    				.build();
    	}
    	
        MaudeScript script = new MaudeScript(input.getProgramWithAddendum());
		if (script.hasCommands()) {
			return Response.status(Response.Status.BAD_REQUEST)
					.entity(ResultAndDiagnosticsDto.fromDiagnostics(
							new Diagnostic(ErrorCode.CONTAINS_COMMANDS, "The program cannot contain commands.")))
					.build();
		}
		
		String rootModule = sanitizer.qid(input.getRootModuleName());
		String addendumModule = sanitizer.qid(input.getAddendumModuleName());
		String constraints = sanitizer.stringLiteralContent(input.getConstraints());
		String command = String.format(
				"mod STRASS-WS-ADAPTER is protecting STRASS . protecting IO . endm\n"
				+ "erew in STRASS-WS-ADAPTER : print(fix('%s, '%s, \"%s\")) .", 
				rootModule, 
				addendumModule, 
				constraints);
		script.appendLine(command);
		script.appendLine("quit .");
		
		MaudeExecutionResponse output = runMaude(script);
		List<Diagnostic> diagnostics = Diagnostic.fromMaudeExecution(output);
		
		String resultToReturn = output.getBody();
		
		if (resultToReturn.contains("constraintParseFailure")) {
			diagnostics.add(new Diagnostic(ErrorCode.CONSTRAINT_PARSE_FAILURE, "Failed to parse constraints."));
		} else if (!resultToReturn.contains("result Portal: <>")) {
			diagnostics.add(
					new Diagnostic(
							ErrorCode.CORE_CANNOT_COMPLETE_EXECUTION, 
							"Unable to yield a result for your request. Are the input parameters correct?"));
		} else {
			resultToReturn = resultToReturn.substring(
					resultToReturn.indexOf("***"),
					resultToReturn.lastIndexOf("endsm") + "endsm".length());
		}
		
		ResultAndDiagnosticsDto dto = ResultAndDiagnosticsDto.from(resultToReturn, diagnostics);
		dto.suppressResultIfSuccessIs(false);
		return dto.toResponse().build();
    }
    
    private MaudeExecutionResponse runMaude(MaudeScript script) {
		return new MaudeInterpreter(maudeCommand)
				.interpretAndWait(script, Settings.TIMEOUT, Settings.TIMEOUT_UNIT);
    }
}
