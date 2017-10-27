//------
//EVENTS
//------

var MainMenu = {};

  MainMenu.btnUndo = function(){
	  App.commandManager.undo();
  };
  
  MainMenu.btnRedo = function(){
	  App.commandManager.redo();
  };
  
  MainMenu.btnClearAll = function(){
	App.graph.clear();
  };
  
  MainMenu.btnClearElabel = function(){
	var elements = App.graph.getElements();
	for (var i = 0; i < elements.length; i++){
		elements[i].removeAttr(".satvalue/d");
		elements[i].attr(".mavo/text", " ");
		var cellView  = elements[i].findView(App.paper);
		App.elementInspector.render(cellView);
		App.elementInspector.$('#init-sat-value').val("none");
		App.elementInspector.updateHTML(null);
	}
  };
  
  MainMenu.btnSave = function() {
	var save_win = window.open("Please enter a name for your file. \nIt will be saved in your Downloads folder. \n.json will be added as the file extension.", "<file name>");
	if (save_win){
		var fileName = "model.json";
		App.download(fileName, JSON.stringify(App.graph.toJSON()));
	}
	save_win.close();
  };
  
  MainMenu.btnLoad = function(){
	// Get the modal
	  var modal = document.getElementById('open-window');
	  modal.style.display = "block";
	// Get the <span> element that closes the modal
	  var span = document.getElementsByClassName("close")[0];
	  span.onclick = function() {
		  modal.style.display = "none";
	  }
	 
  };
  
  MainMenu.btnZoomIn = function() {
	  App.paperScroller.zoom(0.2, { max: 3 });
  };
  
  MainMenu.btnZoomOut = function() {
	  App.paperScroller.zoom(-0.2, { min: 0.2 });
  };
  
  MainMenu.btnSVG = function() {
	  App.paper.openAsSVG();
  };
  
  MainMenu.btnFntUp = function(){
	var max_font = 20;
	var elements = App.graph.getElements();
	for (var i = 0; i < elements.length; i++){
		if (elements[i].attr(".name/font-size") < max_font){
			elements[i].attr(".name/font-size", elements[i].attr(".name/font-size") + 1);
		}
	}
  };
  
  MainMenu.btnFntDown = function(){
	var min_font = 6;
	var elements = App.graph.getElements();
	for (var i = 0; i < elements.length; i++){
		if (elements[i].attr(".name/font-size") > min_font){
			elements[i].attr(".name/font-size", elements[i].attr(".name/font-size") - 1);
		}
	}
  };
  
  MainMenu.btnFnt = function(){
	var elements = App.graph.getElements();
	for (var i = 0; i < elements.length; i++){
		elements[i].attr(".name/font-size", 10);
	}
  };
  
  MainMenu.btnDoc = function(){
	  window.open("https://arxiv.org/pdf/1605.07767v3.pdf");
  };
  
  MainMenu.runAnalysis = function(){
	  var fs = require('fs');
	  var model = new iStarModel();
	  model.setModel(App.graph);
	  
	  var filename = "model.json"
	  
	  fs.writeFile("./models/"+filename, JSON.stringify(model.getModel(), null, "\t"), function(err) {
	      if(err) {
	          return console.log(err);
	      }
	  });	  

  }
