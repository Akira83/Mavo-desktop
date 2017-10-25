function iStarModel(){
	this.links = [];
	this.actors = [];
	this.nodes = [];
	
	this.setModel = function(graph){
		this.actors = this.getActors(graph);
		this.nodes = this.getNodes(graph);
		this.links = this.getLinks(graph);
	};
	
	this.getModel = function(){
		var iModel = {};
		iModel.actors = this.actors;
		iModel.nodes = this.nodes;
		iModel.links = this.links;
		return iModel;
	}
	
	this.getLinks= function(graph){
		var links = [];
		
		for (var i = 0; i < graph.getLinks().length; i++){			
			var current = graph.getLinks()[i];
			var type = current.label(0).attrs.text.text.toUpperCase()
			var source = "-";
			var target = "-";

			if (current.get("source").id)
				source = graph.getCell(current.get("source").id).prop("elementid");
			if (current.get("target").id)
				target = graph.getCell(current.get("target").id).prop("elementid");
			
			var annotation = "none";
			if(current.attr(".mavo")){
				annotation = current.attr(".mavo")[0];	
			}
			
			var link = new Link(source, target, type, annotation);
			
			links.push(link);
		}
		
		return links;
	}

	this.getActors = function(graph){
		var elements = graph.getElements();
		
		//Help variable to count the length of actors
		var actorCounter = 0;
		//List of actors to be sent to backend inside the InputModel object
		var actorsList = [];
		
		//Select only actors elements
		for (var i = 0; i < elements.length; i++){
			if ((elements[i] instanceof joint.shapes.basic.Actor) || (elements[i] instanceof joint.shapes.basic.Actor2)){
				var actorId = actorCounter.toString();
				//Making that the id has 4 digits
				while (actorId.length < 3){ 
					actorId = "0" + actorId;
					}
				actorId = "a" + actorId;
				//Adding the new id to the UI graph element
				elements[i].prop("elementid", actorId);
				var name = elements[i].attr(".name/text");
				var type = (elements[i].prop("actortype") || "A");
				//Creating the actor object to be sent to backend
				var actor = new Actor(actorId, name, type);
				actorsList.push(actor);
				//iterating counter
				actorCounter++;
			}
		}
		return actorsList;
	}
	
	this.getNodes = function(graph){
		var nodes = [];
		var counter = 0;
		var elements = graph.getElements();
		for (var i = 0; i < elements.length; i++){		
			if (!(elements[i] instanceof joint.shapes.basic.Actor) && !(elements[i] instanceof joint.shapes.basic.Actor2)){
				
				/**
				 * NODE ACTOR ID
				 */
				var actorid = 'none';
				if (elements[i].get("parent")){
					actorid = (graph.getCell(elements[i].get("parent")).prop("elementid") || "-");
				}
				
				/**
				 * NODE ID
				 */
				//Making that the elementId has 4 digits
				var elementID = counter.toString();
				while (elementID.length < 4){ 
					elementID = "0" + elementID;
					}
				//Adding the new id to the UI graph element
				elements[i].prop("elementid", elementID);
				
				/**
				 * NODE TYPE
				 */
				var elementType;
				if (elements[i] instanceof joint.shapes.basic.Goal)
					elementType = "G";
				else if (elements[i] instanceof joint.shapes.basic.Task)
					elementType = "T";
				else if (elements[i] instanceof joint.shapes.basic.Softgoal)
					elementType = "S";
				else if (elements[i] instanceof joint.shapes.basic.Resource)
					elementType = "R";
				else
					elementType = "I";
				
				
				/**
				 * INITIAL VALUE
				 */
			  	var satValue = App.satvalues[elements[i].attr(".satvalue/value")];
			  	
			  	/**
			  	 * NODE NAME
			  	 */
			  	//Getting intentional element name
				var name = elements[i].attr(".name/text").replace(/\n/g, " ");
				
				//Getting mavo annotations
				var annotation = (elements[i].attr(".mavo/text")||"");
								
				var maxsize = (elements[i].attr(".mavo/size") || "1");
				
				/**
				 * CREATING OBJECT
				 */
				var node = new Node(elementID, actorid, name, elementType, annotation, maxsize, satValue);		  	
				nodes.push(node);

				//iterating the counter
				counter++;
			}	  	
		}
		return nodes;
	}
	
}

function Actor(id, name, type){
	this.id = id;
	this.name = name;
	this.type = type;
}

function Node(id, actorId, name, type, annotation, maxsize, satValue){
	this.id = id;
	this.actorId = actorId;
	this.name = name;
	this.type = type;
	this.annotation = annotation;
	this.maxsize = maxsize;
	this.satValue = satValue;
}

function Link(source, target, type, annotation){
	this.source = source;
	this.target = target;
	this.type = type;
	this.annotation = annotation;
}


