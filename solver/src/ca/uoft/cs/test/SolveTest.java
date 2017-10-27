package ca.uoft.cs.test;

import java.io.FileReader;
import com.google.gson.Gson;
import ca.uoft.cs.mavo.InputFile;

/**
 * SolveModelTest 
 * This class is the main app class called in the backend.
 * It is responsible to get the json model file produced in the frontend and process into the model used in the backend.
 * Then it executes all analysis creating a output file that has the json analysed file to be send back to the frontend.
 *
 */
public class SolveTest {
	
	/**
	 * This method is responsible to execute all steps to generate the analysis file.
	 * @param args
	 * As parameters it receives the name of the file to be created.
	 */
	public static void main(String[] args) {

		//This is the default filePath to be executed if no file is pass through parameters
		String filePath;
		filePath = "temp/"; 				
		String inputFile = "default.json";
				
		try {
			//creating the backend model to be analysed
			InputFile inputModel = getModelFromJson(filePath + inputFile);
			
			//Analyse the model
			SMTSolver solver = new SMTSolver();
			solver.solveModel(inputModel);		
	
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
	private static InputFile getModelFromJson(String filePath) {
		try{
		Gson gson = new Gson();		
		InputFile inputFile = gson.fromJson(new FileReader(filePath), InputFile.class);
		return inputFile;
		}catch(Exception e){
			throw new RuntimeException("Error in getModelFromJson() method: /n" + e.getMessage());
		}
	}
}