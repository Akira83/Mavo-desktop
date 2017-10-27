package ca.uoft.cs.mavo;

import java.io.FileReader;

import com.google.gson.Gson;

import ca.uoft.cs.mavo.pojo.IStarModel;

/**
 * SolveModelTest 
 * This class is the main app class called in the backend.
 * It is responsible to get the json model file produced in the frontend and process into the model used in the backend.
 * Then it executes all analysis creating a output file that has the json analysed file to be send back to the frontend.
 *
 */
public class SolveModel {
	
	public static boolean DEVELOP = true;
	
	public static void main(String[] args) {
		String filePath = "../models/";
		String inputFile = "model.json";
		String smtFile = "model.smt2";
		String outputFile = "result.json";		
		
		try {
			//creating the backend model to be analysed
			IStarModel iStarModel = getModelFromJson(filePath + inputFile);
			
			SMTConverter smtConverter = new SMTConverter();
			smtConverter.convert(filePath + smtFile, iStarModel);
			
			//Analyse the model
			Z3Solver solver = new Z3Solver();
			solver.solveModel(filePath + smtFile, filePath + outputFile);
			
		} catch (Exception e) {
			throw new RuntimeException(e.getMessage());
		} 
	}

	/**
	 * This method converts the model file sent by the frontend into the ModelSpecPojo in order to be analysed
	 * @param filePath
	 * Path to the file with the frontend models
	 * @return
	 * ModelSpecPojo backend model
	 */
	private static IStarModel getModelFromJson(String filePath) {
		try{
		Gson gson = new Gson();		
		IStarModel iStarModel = gson.fromJson(new FileReader(filePath), IStarModel.class);
		return iStarModel;
		}catch(Exception e){
			throw new RuntimeException("Error in getModelFromJson() method: /n" + e.getMessage());
		}
	}
}