package ca.uoft.cs.mavo;

import java.io.FileReader;

import com.google.gson.Gson;

import ca.uoft.cs.mavo.pojo.IStarModel;

public class IStarConverter {


	/**
	 * This method converts the model file sent by the frontend into the ModelSpecPojo in order to be analysed
	 * @param filePath
	 * Path to the file with the frontend models
	 * @return
	 * ModelSpecPojo backend model
	 */
	public IStarModel getModelFromJson(String filePath) {
		try{
		Gson gson = new Gson();		
		IStarModel iStarModel = gson.fromJson(new FileReader(filePath), IStarModel.class);
		return iStarModel;
		}catch(Exception e){
			throw new RuntimeException("Error in getModelFromJson() method: /n" + e.getMessage());
		}
	}
	
}
