package ca.uoft.cs.mavo.test;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import ca.uoft.cs.mavo.IStarConverter;
import ca.uoft.cs.mavo.pojo.IStarModel;

public class IStarConverterTest {

	public static void main(String[] args) {
		String filePath = "../models/";
		String inputFile = "model.json";
		
		IStarConverter iStarConverter = new IStarConverter();
		try {
			Gson gson = new GsonBuilder().setPrettyPrinting().create();
			IStarModel iStarModel = iStarConverter.getModelFromJson(filePath+inputFile);
			System.out.println(gson.toJson(iStarModel).toString());
		}catch (Exception e) {
			throw new RuntimeException("Test error: " + e.getMessage());
		}
	}
	
}
