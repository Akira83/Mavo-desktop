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
	private void convertModel2SMT(IStarModel inputModel, StringBuilder sb) {
		convertingNodes(inputModel, sb);
		linkPropagation(inputModel, sb);
		//Adding check-sat statement
		sb.append(SMT.checkSat());
		//Print the values for each node
		printValNodes(inputModel, sb);
	}
	
	private void convertingNodes(IStarModel inputModel, StringBuilder sb) {
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
			sb.append(SMT.constInt("n"+iStarNode.getId()));
			
			//Setting initial values if they exist
			if(iStarNode.getSatValue().length != 0) {
				ArrayList<String> initValues = new ArrayList<>();
				for(String initValue : iStarNode.getSatValue()) {
					initValues.add(SMT.equal("n"+iStarNode.getId(), initValue));
				}
				sb.append(SMT.assertion(SMT.or(initValues)));
			}
			
			//Defining range of values
			sb.append(";Adding node value range\n");
			sb.append(SMT.assertion(
					SMT.and(
							SMT.lessEqual("n"+iStarNode.getId(), SatValues.FD),
							SMT.greatEqual("n"+iStarNode.getId(), SatValues.FS)
					)));
			
		}
	}
	
	private void linkPropagation(IStarModel inputModel, StringBuilder sb) {
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
								case "QUALIFICATION":
									//IT WAS DECIDE THAT THIS LINK HAS NO PROPAGATION
									//prop.add(SMT.greatEqual("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
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
							sb.append(";Node same values\n");
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
								case "QUALIFICATION":
									//IT WAS DECIDE THAT THIS LINK HAS NO PROPAGATION
									//prop.add(SMT.greatEqual("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
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
							sb.append(";Node same values\n");
							sb.append(SMT.assertion(SMT.or(sameValue)));							
						}
						break;
					//TARGET QUALITY (SOFTGOAL)
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
								terms.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.UNK),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.UNK)
									));
								terms.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.CONF),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.CONF)
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
								terms1.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.UNK),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.UNK)
									));
								terms1.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.CONF),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.CONF)
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
								terms2.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.UNK),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.UNK)
									));
								terms2.add(
										SMT.and(
										SMT.equal("n"+sameTargetLink.getSource(), SatValues.CONF),
										SMT.equal("n"+sameTargetLink.getTarget(), SatValues.CONF)
									));
								contributionLinks.add(SMT.or(terms2));
								break;
							case "DEPENDENCY":
								prop.add(SMT.equal("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
								break;
							}
						}
						
						String output = "";
						String assumeConflict = "";
						if(contributionLinks.size() > 1) {
							 output = output + SMT.and(contributionLinks);
							//Assume that it can be conflict
							assumeConflict = SMT.equal("n"+linkTarget, SatValues.CONF);

						}else {
							output = contributionLinks.get(0);
						}
						sb.append(";Link propagation \n");
						sameValue.add(output);
						if(!assumeConflict.equals(""))
							sameValue.add(assumeConflict);
						sb.append(SMT.assertion(SMT.or(sameValue)));
						break;
					 
					//RESOURCE
					case "R":
						prop.clear();
						//Refinement, qualification, neededby propagation
						for(IStarLink sameTargetLink: sameTargetLinks) {
							if(!sameTargetLink.getType().equals("QUALIFICATION")) {
								switch (sameTargetLink.getType()) {
								case "QUALIFICATION":
									//IT WAS DECIDE THAT THIS LINK HAS NO PROPAGATION
									//prop.add(SMT.greatEqual("n"+sameTargetLink.getTarget(), "n"+sameTargetLink.getSource()));
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
							sb.append(";Node same values\n");
							sb.append(SMT.assertion(SMT.or(sameValue)));							
						}						
						break;
					}
				}
			}		
		}
	}

	private void printValNodes(IStarModel inputModel, StringBuilder sb) {
		sb.append(";Print values for each node\n");
		for(IStarNode node : inputModel.getNodes()) {
			sb.append(SMT.echo("n"+node.getId()));
			sb.append("\n");
			sb.append(SMT.eval("n"+node.getId()));
			sb.append("\n");
		}
	}
	
}
