//Class for the Link properties tab that appears when link settings are clicked.

var LinkInspector = Backbone.View.extend({

  className: 'link-inspector',

  refinementtemplate: [
    '<label id="title">Refinement Relationship</label>',
    '<br>', 
    '<select class="sublink-type">',
      '<option value=and>And-Decomposition</option>',
      '<option value=or>Or-Decomposition (Means-end)</option>',
    '</select>',
    '<label id="title">May Annotation</label>',
    '<input id="mavo" type="checkbox" value="M">',
    '<br>'
  ].join(''),
  neededbytemplate: [
    '<label id="title">NeededBy Relationship</label>',
    '<br>',
    '<label id="title">May Annotation</label>',
    '<input id="mavo" type="checkbox" value="M">',
    '<br>'
  ].join(''),
  contributiontemplate: [
    '<label id="title">Contribution Relationship</label>',
    '<br>',
    '<select class="sublink-type">',
      '<option value=makes>Makes</option>',
      '<option value=breaks>Breaks</option>',
      '<option value=helps>Helps</option>',
      '<option value=hurts>Hurts</option>',
    '</select>',
    '<label id="title">May Annotation</label>',
    '<input id="mavo" type="checkbox" value="M">', 
    '<br>'
  ].join(''),
  qualificationtemplate: [
    '<label id="title">Qualification Relationship</label>',
    '<br>',
    '<label id="title">May Annotation</label>',
    '<input id="mavo" type="checkbox" value="M">',
  ].join(''),
  dependencytemplate: [
    '<label id="title">Dependency</label>',
    '<br>',
    '<label id="title">May Annotation</label>',
    '<input id="mavo" type="checkbox" value="M">',
    '<br>'
  ].join(''),
  errortemplate: [
    '<label id="title">Error</label>',
    '<br>',
    '<div> This is usually caused by 3 possible reasons:  </div>',
    '<ul> <li> Link is not connected to both source and target node </li> <li> You are connecting from resource to goal </li> <li> You are connecting from resource to resource </li>',
    '</div>',
    '<br>'
  ].join(''),
  actortemplate: [
      '<label> Actor Association Link </label> <br>',
      '<select class="sublink-type">',
        '<option value="is-a">is-a</option>',
        '<option value="participates-in">participates-in</option>',
      '</select><br>'].join(''),

  events: {
    'change .sublink-type': 'updateCell',
    'change #mavo': 'addMavoAnnotation',
  },

  //Method to create the Link Inspector using the template.
  render: function(cellView, linktype) {
    this._cellView = cellView;
    var cell = this._cellView.model;

    // Choose template based on linktype: Contribution, refinement, error, neededby, qualification, actor or dependency
    switch(linktype){
      case 'Contribution':
        this.$el.html(_.template(this.contributiontemplate)());
        break;
      case 'Refinement':
        this.$el.html(_.template(this.refinementtemplate)());
        break;
      case 'Qualification':
        this.$el.html(_.template(this.qualificationtemplate)());
        break;
      case 'NeededBy':
        this.$el.html(_.template(this.neededbytemplate)());
        break;
      case 'Actor':
        this.$el.html(_.template(this.actortemplate)());
        break;
      case 'Dependency':
        this.$el.html(_.template(this.dependencytemplate)());
        break;
      default:
        this.$el.html(_.template(this.errortemplate)());
    }

    // already intialized previously
    if (cell.prop("sublink-type")){
      var val = cell.prop("sublink-type").split("|");
      this.$('.sublink-type').val(val[0]);
	  
      if(val[0] == 'and'){
    	  cell.label(0 ,{position: 0.5, attrs: {text: {text: 'and'}}});			
	  }else if(val[0] == 'or'){
		  cell.label(0 ,{position: 0.5, attrs: {text: {text: 'or'}}});
	  }
    }
    
    if(cell.attr(".mavo")=="M"){
    	this.$('#mavo').attr("checked",true);
    }

    cell.on('remove', function() {
      this.$el.html('');
    }, this);

  },

  //Whenever something is changed in the inspector, make the corresponding change to the link in the model.
  updateCell: function() {
    var link = this._cellView.model;
    link.prop("sublink-type", this.$('.sublink-type').val());
    var linktype = link.attr(".link-type");
    if (linktype == "Refinement"){
	  //Select all refinement links from the target
  	  var target = link.getTargetElement();
  	  //Get all incoming links links
  	  var links_inbound = App.graph.getConnectedLinks(target, {inbound: true});
  	    links_inbound.forEach(function(inLink){
	  	  if(inLink.attr(".link-type") == "Refinement"){
	  		  	inLink.prop("sublink-type", this.$('.sublink-type').val());
  		        if (inLink.prop("sublink-type") == 'and'){
  		        	inLink.attr({
  		            '.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
  		            '.marker-source': {'d': 'M 0 0'},
  		            '.marker-target': {stroke: '#000000', 'stroke-width': 1, "d": 'M 10 0 L 10 10 M 10 5 L 0 5' }
  		          });
  		        	inLink.label(0 ,{position: 0.5, attrs: {text: {text: 'and'}}});
  		        
  		        }else if (inLink.prop("sublink-type") == 'or'){
  		        	inLink.attr({
  		            '.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
  		            '.marker-source': {'d': 'M 0 0'},
  		            '.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 z'}
  		          });
  		        	inLink.label(0 ,{position: 0.5, attrs: {text: {text: 'or'}}});
  		        }
  		        else {
  		          console.log('Error, this should not happen');
  		        }  		  
	  	  }

	  });
    }

    else if (linktype == "Contribution"){
      link.attr({
        '.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
        '.marker-source': {'d': 'M 0 0'},
        '.marker-target': {stroke: '#000000', "d": 'M 12 -3 L 5 5 L 12 13 M 5 5 L 30 5'}
      });
      link.label(0 ,{position: 0.5, attrs: {text: {text: link.prop("sublink-type")}}});
    }
    else if (linktype == "NeededBy"){
      link.attr({
          '.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
          '.marker-source': {'d': 'M 0 0'},
          '.marker-target': {stroke: '#000000', "d": 'M-4,0a4,4 0 1,0 8,0a4,4 0 1,0 -8,0'}
        });
    }
    else if (linktype == "Qualification"){
      link.attr({
        '.connection': {stroke: '#000000', 'stroke-dasharray': '5 2'},
        '.marker-source': {'d': 'M 0 0'},
        '.marker-target': {'d': 'M 0 0'},
      });
      link.label(0 ,{position: 0.5, attrs: {text: {text: 'qualification'}}});

    }
    else if (linktype == "Dependency"){
	    link.attr({
	      '.connection': {stroke: '#000000', 'stroke-dasharray': '5 2'},
		  '.marker-source': {'d': 'M 0 0'},
		  '.marker-target': {stroke: '#000000', 'stroke-width': 1, "d": 'M 10 0 L 10 10 M 10 5 L 0 5' },
	    });
	    link.label(0 ,{position: 0.5, attrs: {text: {text: 'Dependecy'}}});
    }
    else{
      link.attr({
        '.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
        '.marker-source': {'d': 'M 0 0'},
        '.marker-target': {stroke: '#000000', "d": 'M 12 -3 L 5 5 L 12 13 M 5 5 L 30 5'}
      });
      link.label(0 ,{position: 0.5, attrs: {text: {text: link.prop("sublink-type")}}});
    }
    
  },
  addMavoAnnotation : function(){
	  var link = this._cellView.model;
	  if(this.$('#mavo')[0].checked){		  
		  link.attr(".mavo","M");
	  }
  },
  clear: function(){
    this.$el.html('');
  }
});

