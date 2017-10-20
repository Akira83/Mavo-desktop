//This file is responsible handle all graph actions
App.loadGraph = function(){
	
	//Load jointjs graph
	App.graph = new joint.dia.Graph();	

	//Whenever an element is added to the graph
	App.graph.on("add", function(cell){
		if (cell instanceof joint.dia.Link){
			if (App.graph.getCell(cell.get("source").id) instanceof joint.shapes.basic.Actor){

				cell.attr({
					'.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
					'.marker-source': {'d': '0'},
					'.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
				});
				cell.prop("linktype", "actorlink");
				cell.label(0, {attrs: {text: {text: "is-a"}}});
			}
		}

		//Give element a unique default
		cell.attr(".name/text", cell.attr(".name/text") + "_" + App.graph.getElements().length);
		
		//Current satisfaction values for the node
		cell.currentValues = [];
		//Mavo annotations
		cell.mavo = [];
		
		cell.updateSiblings = function(){
			var values = ["satisfied", "partiallysatisfied", "unknown", "conflict", "partiallydenied", "denied", "none"];
			var outLinks = App.graph.getConnectedLinks(this, {outbound:true});
			if(outLinks){
				for(var i = 0; i < outLinks.length; i++){
					var link = outLinks[i];
					var type = link.label(0).attrs.text.text.toUpperCase();
					var source = link.getSourceElement();
					var target = link.getTargetElement();
					
					if(type=="OR"){
						//get all siblings
						var siblingsLinks = App.graph.getConnectedLinks(target, {inbound:true});
						var canSatisfy = 0;
						for(var sl_i = 0; sl_i < siblingsLinks.length; sl_i++){
							var sLink = siblingsLinks[sl_i];
							var sibling = sLink.getSourceElement();
							
							//Get best value of target
							var best = parseInt(App.satvalues[target.currentValues[0]]);
							for(var len = 0; len < target.currentValues.length; len++){
								var numbOfSat = App.satvalues[target.currentValues[len]];							
								if(best < parseInt(numbOfSat))
									best = parseInt(numbOfSat);
							}	
							if(sibling.currentValues.indexOf(values[best]) > -1)
								canSatisfy++;	
						}
						
						//One of the siblings must satisfy the root node
						if(canSatisfy == 1){
							//get all siblings
							var siblingsLinks = App.graph.getConnectedLinks(target, {inbound:true});
							for(var sl_i = 0; sl_i < siblingsLinks.length; sl_i++){
								var sLink = siblingsLinks[sl_i];
								var sibling = sLink.getSourceElement();
								
								//Get best value of target
								var best = parseInt(App.satvalues[target.currentValues[0]]);
								for(var len = 0; len < target.currentValues.length; len++){
									var numbOfSat = App.satvalues[target.currentValues[len]];							
									if(best < parseInt(numbOfSat))
										best = parseInt(numbOfSat);
								}
								
								if(sibling.currentValues.indexOf(values[best]) > -1){
									sibling.currentValues = [];
									sibling.currentValues.push(values[best]);								
								}
							}	
						}
					}else if(type=="AND"){
						//get all siblings
						var siblingsLinks = App.graph.getConnectedLinks(target, {inbound:true});
						var canSatisfy = 0;
						for(var sl_i = 0; sl_i < siblingsLinks.length; sl_i++){
							var sLink = siblingsLinks[sl_i];
							var sibling = sLink.getSourceElement();
							
							//Get worst value
							var worst = parseInt(App.satvalues[target.currentValues[0]]);
							for(var len = 0; len < target.currentValues.length; len++){
								var numbOfSat = App.satvalues[target.currentValues[len]];
								if(worst > parseInt(numbOfSat))
									worst = parseInt(numbOfSat);
							}	
							if(sibling.currentValues.indexOf(values[worst]) > -1)
								canSatisfy++;	
						}
						
						//One of the siblings must satisfy the root node
						if(canSatisfy == 1){
							//get all siblings
							var siblingsLinks = App.graph.getConnectedLinks(target, {inbound:true});
							for(var sl_i = 0; sl_i < siblingsLinks.length; sl_i++){
								var sLink = siblingsLinks[sl_i];
								var sibling = sLink.getSourceElement();
								
								//Get worst value
								var worst = parseInt(App.satvalues[target.currentValues[0]]);
								for(var len = 0; len < target.currentValues.length; len++){
									var numbOfSat = App.satvalues[target.currentValues[len]];
									
									if(worst > parseInt(numbOfSat))
										worst = parseInt(numbOfSat);
								}
								
								if(sibling.currentValues.indexOf(values[worst]) > -1){
									sibling.currentValues = [];
									sibling.currentValues.push(values[worst]);								
								}
							}	
						}
					}	
				}
			}
		}
		
		cell.propagate = function(){
			var values = ["satisfied", "partiallysatisfied", "unknown", "conflict", "partiallydenied", "denied", "none"];

			//get all links (connected nodes)
			var links = App.graph.getConnectedLinks(this);
			//get income links (which element is target)
			var inLinks = App.graph.getConnectedLinks(this, {inbound:true});
			//get outcome links (which element is source)
			var outLinks = App.graph.getConnectedLinks(this, {outbound:true});
			
			if(inLinks.length > 0){
				//BACKWARD PROPAGATION
				//Verify if it has multiple child
				var numberOfChildren = 0;
				
				for(var i = 0; i < inLinks.length; i++){	
					var link = inLinks[i];
					var type = link.label(0).attrs.text.text.toUpperCase();
					var source = link.getSourceElement();
					var target = link.getTargetElement();

					if(type=="AND" || type=="OR"){
						numberOfChildren++;
					}
				}
				
				if(numberOfChildren > 1){
					for(var i = 0; i < inLinks.length; i++){	
						var link = inLinks[i];
						var type = link.label(0).attrs.text.text.toUpperCase();
						var source = link.getSourceElement();
						var target = link.getTargetElement();

						if(type=="OR"){
							//best case scenario
							var worst = parseInt(App.satvalues[target.currentValues[0]]);
							for(var len = 0; len < target.currentValues.length; len++){
								//Get worst value
								var numbOfSat = App.satvalues[target.currentValues[len]];
								
								if(worst > parseInt(numbOfSat))
									worst = parseInt(numbOfSat);
							}
							//Add all possible values for children
							source.currentValues = [];
							for(var index = worst; index < values.length; index++){
								source.currentValues[index] = values[index];
							}		
						}else if(type=="AND"){
							//worst case scenario
							var best = parseInt(App.satvalues[target.currentValues[0]]);
							for(var len = 0; len < target.currentValues.length; len++){
								//Get worst value
								var currentBeingAnalysed = target.currentValues[len];
								var numbOfSat = App.satvalues[target.currentValues[len]];
								
								if(best < parseInt(numbOfSat))
									best = parseInt(numbOfSat);
							}
							//Add all possible values for children
							source.currentValues = [];
							for(var index = best; index > -1; index--){
								source.currentValues[index] = values[index];
							}
						}
						
						source.propagate();
						
					}
				}else{
					var source = link.getSourceElement();
					var target = link.getTargetElement();
					source.currentValues = [];
					
					for(var len = 0; len < target.currentValues.length; len++)
						source.currentValues[len] = target.currentValues[len];

					source.propagate();
				}
			}
			
			//Removing a value from current values
			//var removeItem = "conflict";			
			//cell.currentValues.splice(cell.currentValues.indexOf(removeItem), 1);
			//Verify incomming links and propagate current Values
			
		};
		
		//Send actors to background so elements are placed on top
		if (cell instanceof joint.shapes.basic.Actor){
			cell.toBack();
		}

		App.paper.trigger("cell:pointerup", cell.findView(App.paper));
	});

	//Auto-save the cookie whenever the graph is changed.
	App.graph.on("change", function(){
		//save the graph on a cook when it has changes
		var graphtext = JSON.stringify(App.graph);
		document.cookie = "graph=" + graphtext;
	});

	App.graph.on('change:size', function(cell, size){
		cell.attr(".label/cx", 0.25 * size.width);

		//Calculate point on actor boundary for label (to always remain on boundary)
		var b = size.height;
		var c = -(size.height/2 + (size.height/2) * (size.height/2) * (1 - (-0.75 * size.width/2) * (-0.75 * size.width/2)  / ((size.width/2) * (size.width/2)) ));
		var y_cord = (-b + Math.sqrt(b*b - 4*c)) / 2;

		cell.attr(".label/cy", y_cord);
	});

}

