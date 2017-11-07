package ca.uoft.cs.mavo;

import java.util.ArrayList;

import ca.uoft.cs.mavo.pojo.IStarLink;
import ca.uoft.cs.mavo.pojo.IStarModel;
import ca.uoft.cs.mavo.pojo.IStarNode;
import ca.uoft.cs.util.FileUtils;

public class SMTConverter {

	public void convert(String smtFilePath, IStarModel iStarModel) {
		StringBuilder sb = new StringBuilder();
		convertModel2SMT(iStarModel, sb);
		FileUtils.createFile(sb.toString(), smtFilePath);	
	}

	/**
	 * Create a string with the SMT2 representation of the model
	 * @param inputModel
	 * Model received from frontend
	 * @param sb
	 * variable to receive the SMT2 generated
	 */
	public void convertModel2SMT(IStarModel inputModel, StringBuilder sb) {
		convertNodes(inputModel, sb);
		convertLinks(inputModel, sb);
		//Adding check-sat statement
		sb.append(SMT.checkSat());
		//Print the values for each node
		printValNodes(inputModel, sb);
	}
	
	public void convertNodes(IStarModel inputModel, StringBuilder sb) {
		sb.append(";Converting Elements\n\n");
		
		//Converting nodes into int const
		for(IStarNode iStarNode : inputModel.getNodes()) {
			
			//If the node is annotated with 'S' create mode nodes of same type
			for(String annotation : iStarNode.getAnnotation()) {
				if(annotation.equals("S")) {
					for(int i = 1; i <= Integer.parseInt(iStarNode.getMaxsize()); i++) {
						sb.append(SMT.constInt("n"+i+iStarNode.getId()));		
					}
				}				
			}
			
			sb.append(";Element: " + iStarNode.getName() + "\n");
			sb.append(SMT.constInt("n"+iStarNode.getId()));
			sb.append("\n");
		}
		
		//Setting initial values if they exist
		for(IStarNode iStarNode : inputModel.getNodes()) {
			if(iStarNode.getSatValue().length != 0) {
				sb.append(";Initial Values for " + iStarNode.getName() + "\n");
				ArrayList<String> initValues = new ArrayList<>();
				for(String initValue : iStarNode.getSatValue()) {
					switch (initValue) {
					case "denied":
						initValue = SatValues.FD;
						break;
					case "partiallydenied":
						initValue = SatValues.PD;
						break;
					case "partiallysatisfied":
						initValue = SatValues.PS;
						break;
					case "satisfied":
						initValue = SatValues.PS;
						break;
					}
					initValues.add(SMT.equal("n"+iStarNode.getId(), initValue));
				}
				sb.append(SMT.assertion(SMT.or(initValues)));
			}
		}

		//Defining range of values
		sb.append(";Adding value range\n");
		for(IStarNode iStarNode : inputModel.getNodes()) {	
			sb.append(SMT.assertion(
					SMT.and(
							SMT.lessEqual("n"+iStarNode.getId(), SatValues.FD),
							SMT.greatEqual("n"+iStarNode.getId(), SatValues.FS)
					)));
		}
	}
	
	public void convertLinks(IStarModel inputModel, StringBuilder sb) {
		ArrayList<String> prop = new ArrayList<>();
		ArrayList<String> sameValue = new ArrayList<>();
		ArrayList<IStarLink> sameTargetLinks = new ArrayList<>();
		
		for(IStarLink iStarLink : inputModel.getLinks()) {
			if(!iStarLink.getAdded()) {
				iStarLink.setAdded(true);
				//Getting links with the same target
				sameTargetLinks.clear();
				sameValue.clear();
				String targetProp = "";
				sameTargetLinks.add(iStarLink);
				String linkTarget = iStarLink.getTarget();
				for(IStarLink iStarLink2 : inputModel.getLinks()) {
					if(!iStarLink.equals(iStarLink2) && linkTarget.equals(iStarLink2.getTarget())) {
						iStarLink2.setAdded(true);
						sameTargetLinks.add(iStarLink2);
					}
				}
			
				IStarNode targetNode = IStarNode.getLink(iStarLink.getTarget(), inputModel.getNodes());
				if(targetNode!=null) {
					//Type of propagation
					switch (targetNode.getType()) {
					//GOAL TARGET
					case "G":
						prop.clear();
						//Refinement and qualification propagation
						for(IStarLink sameTargetLink: sameTargetLinks) {
							if(!sameTargetLink.getType().equals("QUALIFICATION")) {
								switch (sameTargetLink.getType()) {
								case "AND":
									prop.add(SMT.greatEqual("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
									break;
								case "OR":
									prop.add(SMT.lessEqual("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
									break;
								case "DEPENDENCY":
									prop.add(SMT.equal("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
									break;
								}	
								//The target node has to have the same value of one source node
								sameValue.add(SMT.equal("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));	
							}
						}
						targetProp = SMT.and(prop);
						sb.append(";Link propagation\n");
						sb.append(SMT.assertion(targetProp));
						if(!sameValue.isEmpty()) {
							sb.append(";Target equal one of its children\n");
							sb.append(SMT.assertion(SMT.or(sameValue)));							
						}
						break;
					//TASK TARGET
					case "T":
						prop.clear();
						//Refinement, qualification, neededby propagation
						for(IStarLink sameTargetLink: sameTargetLinks) {
							if(!sameTargetLink.getType().equals("QUALIFICATION")) {
								switch (sameTargetLink.getType()) {
								case "AND":
									prop.add(SMT.greatEqual("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
									break;
								case "OR":
									prop.add(SMT.lessEqual("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
									break;
								case "NEEDEDBY":
									prop.add(SMT.greatEqual("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
									break;
								case "DEPENDENCY":
									prop.add(SMT.equal("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
									break;
								}
	
								//The target node has to have the same value of one source node
								sameValue.add(SMT.equal("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
							}
						}
						targetProp = SMT.and(prop);
						sb.append(";Link propagation\n");
						sb.append(SMT.assertion(targetProp));
						if(!sameValue.isEmpty()) {
							sb.append(";Target equal one of its children\n");
							sb.append(SMT.assertion(SMT.or(sameValue)));							
						}
						break;
					//QUALITY (SOFTGOAL) TARGET 
					case "S":
						ArrayList<String> contributionLinks = new ArrayList<>();
						for(IStarLink sameTargetLink: sameTargetLinks) {
						//Contribuition propagation
							switch (sameTargetLink.getType()) {
							case "MAKES":
								contributionLinks.add(SMT.equal("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
								break;
							case "HELPS":
								ArrayList<String> terms = new ArrayList<>();
								terms.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.FS),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PS)
									));
								terms.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.PS),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PS)
									));
								terms.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.PD),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PD)
									));
								terms.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.FD),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PD)
									));
								contributionLinks.add(SMT.or(terms));
								break;
							case "HURTS":
								ArrayList<String> terms1 = new ArrayList<>();
								terms1.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.FS),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PD)
									));
								terms1.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.PS),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PD)
									));
								terms1.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.PD),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PD)
									));
								terms1.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.FD),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PD)
									));
								contributionLinks.add(SMT.or(terms1));
								break;
							case "BREAKS":
								ArrayList<String> terms2 = new ArrayList<>();
								terms2.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.FS),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.FD)
									));
								terms2.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.PS),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PD)
									));
								terms2.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.PD),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PS)
									));
								terms2.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.FD),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.PS)
									));
								contributionLinks.add(SMT.or(terms2));
								break;
							case "DEPENDENCY":
								prop.add(SMT.equal("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
								break;
							}
						}
						
						String output = "";
						if(contributionLinks.size() > 1) {
							 output = output + SMT.and(contributionLinks);
						}else {
							output = contributionLinks.get(0);
						}
						sb.append(";Link propagation \n");
						sameValue.add(output);
						
						sb.append(SMT.assertion(SMT.or(sameValue)));
						break;
					 
					//RESOURCE TARGET
					case "R":
						prop.clear();
						//Refinement, qualification, neededby propagation
						for(IStarLink sameTargetLink: sameTargetLinks) {
							if(!sameTargetLink.getType().equals("QUALIFICATION")) {
								switch (sameTargetLink.getType()) {
								case "DEPENDENCY":
									prop.add(SMT.equal("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
									break;
								}
								//The target node has to have the same value of one source node
								sameValue.add(SMT.equal("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
							}
						}
						targetProp = SMT.and(prop);
						sb.append(";Link propagation\n");
						sb.append(SMT.assertion(targetProp));
						if(!sameValue.isEmpty()) {
							sb.append(";Target equal one of its children\n");
							sb.append(SMT.assertion(SMT.or(sameValue)));							
						}						
						break;
					}
				}
			}		
		}
	}

	public void printValNodes(IStarModel inputModel, StringBuilder sb) {
		sb.append(";Print values for each node\n");
		for(IStarNode node : inputModel.getNodes()) {
			sb.append(SMT.echo("n"+node.getId()));
			sb.append("\n");
			sb.append(SMT.eval("n"+node.getId()));
			sb.append("\n");
		}
	}
	
}
