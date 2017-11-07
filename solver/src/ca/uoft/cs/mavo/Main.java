package ca.uoft.cs.mavo;

import ca.uoft.cs.mavo.pojo.IStarModel;

/**
 * SolveModelTest 
 * This class is the main app class called in the backend.
 * It is responsible to get the json model file produced in the frontend and process into the model used in the backend.
 * Then it executes all analysis creating a output file that has the json analysed file to be send back to the frontend.
 *
 */
public class Main {
	
	public static boolean DEVELOP = true;
	
	public static void main(String[] args) {
		String filePath = "../models/";
		String inputFile = "model.json";
		String smtFile = "model.smt2";
		String outputFile = "result.json";		
		
		try {
			IStarConverter iStarConverter = new IStarConverter();
			IStarModel iStarModel = iStarConverter.getModelFromJson(filePath + inputFile);
			
			SMTConverter smtConverter = new SMTConverter();
			smtConverter.convert(filePath + smtFile, iStarModel);
			
			Z3Solver solver = new Z3Solver();
			solver.solveModel(filePath + smtFile, filePath + outputFile);
			
		} catch (Exception e) {
			throw new RuntimeException(e.getMessage());
		} 
	}

}