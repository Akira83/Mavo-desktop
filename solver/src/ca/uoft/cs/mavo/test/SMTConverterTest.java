package ca.uoft.cs.mavo.test;

import ca.uoft.cs.mavo.IStarConverter;
import ca.uoft.cs.mavo.SMTConverter;
import ca.uoft.cs.mavo.pojo.IStarModel;

public class SMTConverterTest {

	public static void main(String[] args) {
		String filePath = "../models/";
		String inputFile = "model.json";
		String outputFile = "model.smt2";
		
		try {
			IStarConverter iStarConverter = new IStarConverter();
			IStarModel iStarModel = iStarConverter.getModelFromJson(filePath+inputFile);
			
			SMTConverter converter = new SMTConverter();
			StringBuilder sb = new StringBuilder();
			
			converter.convertNodes(iStarModel, sb);
			System.out.println("Test 1:\n" + sb.toString());
			sb.setLength(0);
						
			converter.convertLinks(iStarModel, sb);
			System.out.println("Test 2:\n" + sb.toString());
			sb.setLength(0);

			converter.printValNodes(iStarModel, sb);
			System.out.println("Test 3:\n" + sb.toString());
			sb.setLength(0);

			converter.convertModel2SMT(iStarModel, sb);
			System.out.println("Test 4:\n" + sb.toString());
			sb.setLength(0);
			
			converter.convert(filePath+outputFile, iStarModel);			
			System.out.println("Test 5: Check file ../models/model.smt2");
			
		}catch (Exception e) {
			throw new RuntimeException("Test error: " + e.getMessage());
		}
		
		
	}
	
}
