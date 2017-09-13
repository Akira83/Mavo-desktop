//Class for the element properties tab that appears when an element is clicked 

var ElementInspector = Backbone.View.extend({
	
  className: 'element-inspector',

  template: [
      '<label>Node name</label>',
      '<textarea id="elementName" class="cell-attrs-text"></textarea>',
      '<label>Initial Value</label>',
      '<input type="checkbox" class="sat-values" id="satisfied" value="satisfied">Satisfied<br>',
      '<input type="checkbox" class="sat-values" id="partiallysatisfied" value="partiallysatisfied">Partially Satisfied<br>',
      '<input type="checkbox" class="sat-values" id="unknown" value="unknown">Unknown<br>',
      '<input type="checkbox" class="sat-values" id="conflict" value="conflict">Conflict<br>',
      '<input type="checkbox" class="sat-values" id="partiallydenied" value="partiallydenied">Partially Denied<br>',
      '<input type="checkbox" class="sat-values" id="denied" value="denied">Denied<br>',
      '<br>',
      '<label>MAVO Annotations</label>',
      '<input type="checkbox" class="mavo" id="set" value="S">Set<br>',
      '<input type="checkbox" class="mavo" id="may" value="M">May<br>',
      '<input type="checkbox" class="mavo" id="var" value="V">Variable<br>',
	  '</div>',
  ].join(''),
  
  actor_template: [
    '<label>Actor name</label>',
    '<textarea id="elementName" class="cell-attrs-text" maxlength=100></textarea>',
    '<label> Actor type </label>',
    '<select id="actorType" class="actor-type">',
      '<option value=A> Actor </option>',
      '<option value=G> Agent </option>',
      '<option value=R> Role </option>',
    '</select>'
	].join(''),	

  events: {
	'keyup #elementName': 'changeName',
	'change .sat-values' : 'updateSatValues',	 
    'change .mavo':'updateMavo',
    'change #actorType': 'actorType'
  },
  
  //Initializing Element Inspector using the template.
  render: function(cellView) {
    this._cellView = cellView;
    var cell = this._cellView.model;

    // Render actor template if actor or actor2
    if (cell instanceof joint.shapes.basic.Actor || cell instanceof joint.shapes.basic.Actor2){
      this.$el.html(_.template(this.actor_template)());
      this.$('#elementName').val(cell.attr(".name/text") || '');
      this.$('#actorType').val(cell.prop("actortype") || "A")
      return
    }else{
      this.$el.html(_.template(this.template)());
    }

    cell.on('remove', function() {
        this.$el.html('');
    }, this);
    
    // Load initial value
    this.$('#elementName').val(cell.attr(".name/text") || '');
    
    //Initial Satisfaction values
    this.$('.sat-values').each(function(){
    	if(cell.currentValues.indexOf($(this).val()) > -1){
    		$(this).prop('checked', true);
    	}
    })
     
    //Initial MAVO annotations
    this.$('.mavo').each(function(){
    	if(cell.mavo.indexOf($(this).val()) > -1){
    		$(this).prop('checked', true);
    	}
    })
    	
  },
  changeName: function(event){
	var ENTER_KEY = 13;
    //Prevent the ENTER key from being recorded when naming nodes.
	if (event.which === ENTER_KEY){
		event.preventDefault();
    }

    var cell = this._cellView.model;
    var text = this.$('#elementName').val()
    // Do not allow special characters in names, replace them with spaces.
    text = text.replace(/[^\w\n]/g, ' ');
    cell.attr({ '.name': { text: text } });

  },
  updateSatValues: function(){
	  var cell = this._cellView.model;
	  this.$('.sat-values').each(function(){
		  if($(this).prop('checked')){
			  if(cell.currentValues.indexOf($(this).val()) == -1){
				  cell.currentValues.push($(this).val());
			  }
		  }else{
			  if(cell.currentValues.indexOf($(this).val()) > -1){
				var removeItem = $(this).val();			
				cell.currentValues.splice(cell.currentValues.indexOf(removeItem), 1);
			  }
		  }
	  })
	  cell.propagate();
	  cell.updateSiblings();
  },
  updateMavo: function(){
	  var cell = this._cellView.model;
	  this.$('.mavo').each(function(){
		  if($(this).prop('checked')){
			  if(cell.mavo.indexOf($(this).val()) == -1){
				  cell.mavo.push($(this).val());
			  }
		  }else{
			  if(cell.mavo.indexOf($(this).val()) > -1){
				var removeItem = $(this).val();			
				cell.mavo.splice(cell.mavo.indexOf(removeItem), 1);
			  }
		  }
	  })
  },  
  actorType: function(){
	  var cell = this._cellView.model;
	    // Cease operation if selected is Actor
	  	if (cell instanceof joint.shapes.basic.Actor){ 
	    	cell.prop("actortype", this.$('#actorType').val());
	    	if (cell.prop("actortype") == 'G'){
	    		cell.attr({ '.line':
	    					{'ref': '.label',
	            			 'ref-x': 0,
	            			 'ref-y': 0.08,
	            			 'd': 'M 5 10 L 55 10',
	            			 'stroke-width': 1,
	            			 'stroke': 'black'}});
	    	}else if (cell.prop("actortype") == 'R'){
	    		cell.attr({ '.line':
	    					{'ref': '.label',
	            			 'ref-x': 0,
	            			 'ref-y': 0.6,
	            			 'd': 'M 5 10 Q 30 20 55 10 Q 30 20 5 10' ,
	            			 'stroke-width': 1,
	            			 'stroke': 'black'}});
	    	}else {
	    		cell.attr({'.line': {'stroke-width': 0}});
	    	}
	    	return;
	  	}
	    // Cease operation if selected is Actor2
	    if (cell instanceof joint.shapes.basic.Actor2){ 
	      cell.prop("actortype", this.$('#actorType').val());
	      if (cell.prop("actortype") == 'G'){
	        cell.attr({ '.line':
	              {
	                   'ref-x': 0,
	                   'ref-y': 0.08,
	                   'd': 'M 10 10 L 70 10',
	                   'stroke-width': 1,
	                   'stroke': 'black'}});
	      }else if (cell.prop("actortype") == 'R'){
	        cell.attr({ '.line':
	              {
	                   'ref-x': 0,
	                   'ref-y': 0.6,
	                   'd': 'M 5 10 Q 30 20 75 10 Q 30 20 5 10' ,
	                   'stroke-width': 1,
	                   'stroke': 'black'}});
	      }else {
	        cell.attr({'.line': {'stroke-width': 0}});
	      }
	      return;
	    }
  },
  clear: function(){
    this.$el.html('');
  }
});

