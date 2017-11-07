package ca.uoft.cs.mavo;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import ca.uoft.cs.mavo.pojo.IStarModel;
import ca.uoft.cs.mavo.pojo.NodeOutput;
import ca.uoft.cs.mavo.pojo.OutputModel;
import ca.uoft.cs.util.FileUtils;
import ca.uoft.cs.util.ShellCommand;

public class Z3Solver {
		
	public void solveModel(String smtFile, String outputFile) {
		//Create SMT file
		StringBuilder sb = new StringBuilder();
		OutputModel outputModel = new OutputModel();
		
		int solutionNumber = 0;
		FileUtils.createFile(sb.toString(), smtFile);
		String[] analysisResult = executeSMT2File(smtFile).split("\n");
		if(analysisResult[0].equals("sat")) {
			do {
				System.out.println("Finding solution... #" + solutionNumber++);
				//Add models to object to be sent to frontend
				result2OutputModel(analysisResult, outputModel);
				//Deny last values in the SMT2 file to be executed again
				ArrayList<String> pastValues = new ArrayList<>();
				
				for(int i = 1; i < analysisResult.length; i++) {
					if(!analysisResult[i].contains("sat")) {
						if(analysisResult[i].contains("n")) {
							String nodeId = analysisResult[i].replace("\"", "");
							pastValues.add((SMT.equal(nodeId, analysisResult[++i])));
						}
					}
				}
				String notSolution = SMT.assertion(SMT.not(SMT.and(pastValues)));
				
				try {
				List<String> newLines = new ArrayList<>();
				for (String line : Files.readAllLines(Paths.get(smtFile), StandardCharsets.UTF_8)) {
				    if (line.contains("(check-sat)")) {
				       newLines.add(line.replace("(check-sat)", notSolution + "\n(check-sat)"));
				    } else {
				       newLines.add(line);
				    }
				}
				Files.write(Paths.get(smtFile), newLines, StandardCharsets.UTF_8);
				}catch (Exception e) {
					throw new RuntimeException("Error in getting all sat values" + e);
				}
				analysisResult = executeSMT2File(smtFile).split("\n");
			}while(analysisResult[0].equals("sat"));
		}else {
			outputModel.setIsSat("unsat");
		}			
		convertAnalysis2JSON(outputModel, outputFile);
	}

	private void convertAnalysis2JSON(OutputModel outputModel, String analysisPath) {
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		FileUtils.createFile(gson.toJson(outputModel), analysisPath);
	}

	private void result2OutputModel(String[] analysisResult, OutputModel outputModel) {
		if(outputModel.getNodesList().isEmpty()) {
			//Executing for the first time
			for(int i = 1; i < analysisResult.length; i++) {
				if(!analysisResult[i].contains("sat")) {
					if(analysisResult[i].contains("n")) {
						NodeOutput node = new NodeOutput();
						String nodeId = analysisResult[i].replace("\"", "");
						nodeId = nodeId.replace("n","");
						node.setNodeId(nodeId);
						node.addSatValue(analysisResult[++i]);
						outputModel.getNodesList().add(node);
					}
				}
			}
		}else {
			//Adding new sat models
			int nodeIndex = 0;
			for(int i = 1; i < analysisResult.length; i++) {
				if(!analysisResult[i].contains("sat")) {
					if(!analysisResult[i].contains("n")) {
						outputModel.getNodesList().get(nodeIndex++).addSatValue(analysisResult[i]);
					}
				}
			}	
		}
	}

	private String executeSMT2File(String smtFilePath) {
		String z3Path;
		if(Main.DEVELOP) {
			z3Path = "z3";			
		}else {
			z3Path = "/u/marcel/z3-4.5.0-x64-ubuntu-14.04/bin/z3";
		}
		String options = " -smt2 ";
		String command = z3Path + options + smtFilePath;
		
		String output = ShellCommand.executeCommand(command);
		
		return output;
		
	}

}
