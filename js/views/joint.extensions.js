/* *** Code Inconsistent with Rappid Distribution *** 
 * J.Fear - Aug. 2015
 * The following functions differs from the Rappid release. These functions did not exist in the Rappid Library. 
 * 		joint.shapes.basic.Intention: Is the superclass for all added nodes (goals, subgoals, tasks, resources).
 * 		joint.shapes.basic.Goal: Goal node.
 * 		joint.shapes.basic.Task: Task node.
 * 		joint.shapes.basic.Softgoal: Softgoal node.
 * 		joint.shapes.basic.Resource: Resource node.
 * 		joint.dia.Actorlink: Link between actors.
 * 		joint.shapes.basic.Actor: Actor node.
 *
 */ 
joint.shapes.basic.Intention = joint.shapes.basic.Generic.extend({
	type: 'html.Element',
	markup: '<g class="rotatable">' + 
				'<g class="scalable">' + 
					'<rect class="outer"/>' + 
				'</g>' +
				'<text class="mavo"/>' +
				'<text class="name"/>' +
			'</g>',
	defaults: joint.util.deepSupplement({
        type: "basic.Intention",
        size: {
            width: 100,
            height: 60
        },
        attrs: {
            ".outer": {
                width: 100,
                height: 60
            },           
            ".mavo": {
            	'ref-y': '0.75',
            	'ref-x': '0.08',
            	'fill': 'black',
            	'font-size': 16,
            },
            ".name": {
            	'fill': 'black',
            	'ref-y': '0.5',
            	'ref-x': '0.5',
            	'font-size': 10,
            	'x-alignment': 'middle',
            	'y-alignment': 'middle'
            }
        }
    }, joint.dia.Element.prototype.defaults)
});

joint.shapes.basic.Goal = joint.shapes.basic.Intention.extend({
    defaults: joint.util.deepSupplement({
        type: "basic.Goal",
        attrs: {
            ".outer": {
            	rx: 20,
            	ry: 20,
                stroke: 'black',
                fill: '#FFCC66',
            },
            ".satvalue": {
            	'ref-x': '0.8',
            	'ref-y': '0.75'
            },
            ".name": {
            	'text': 'Goal',
            }
        }
    }, joint.shapes.basic.Intention.prototype.defaults)
});

joint.shapes.basic.Task = joint.shapes.basic.Intention.extend({
    markup: '<g class="rotatable">' +
		    	'<g class="scalable">' +
					'<path class="outer"/>' +
				'</g>' +
					'<text class="mavo"/>' +
					'<text class="name"/>' +
				'</g>',
    defaults: joint.util.deepSupplement({
        type: "basic.Task",
        attrs: {
            ".outer": {
            	
            	d: 'M 0 30 L 20 0 L 80 0 L 100 30 L 80 60 L 20 60 z', 
            	fill: '#92E3B1',
            	stroke: 'black',
            	'stroke-width': 1 
            },
            ".mavo": {
            	'ref-y': '0.75',
            	'ref-x': '0.2',
            },
            ".name": {
            	'text': 'Task',
            }
        }
    }, joint.shapes.basic.Intention.prototype.defaults)
});

joint.shapes.basic.Softgoal = joint.shapes.basic.Intention.extend({
    markup: '<g class="rotatable">' +
    			'<g class="scalable">' +
					'<path class="outer"/>' +
				'</g>' +
					'<text class="mavo"/>' +
				'<text class="name"/>' +
			'</g>',
    defaults: joint.util.deepSupplement({
        type: "basic.Softgoal",
        attrs: {
            ".outer": {
            	d: 'M 0 20 Q 5 0 45 5 Q 55 10 65 5 Q 95 0 100 15 L 100 30 Q 100 50 80 50 L 75, 50 Q 66 50 55 47 Q 45 45 35 47 Q 25 50 15 50 L 10 50 Q 0 45 0 25 z',
                stroke: 'black',
                fill: '#FF984F',
            },
            ".mavo": {
            	'ref-y': '0.75',
            	'ref-x': '0.2',
            },
            ".name": {
            	'text': 'Quality',
            }
        }
    }, joint.shapes.basic.Intention.prototype.defaults)
});

joint.shapes.basic.Resource = joint.shapes.basic.Intention.extend({
	defaults: joint.util.deepSupplement({
		type: "basic.Resource",
		attrs: {
            ".outer": {
                stroke: 'black',
                fill: '#92C2FE',
            },
            ".name": {
            	'text': 'Resource',
            }
        }
	}, joint.shapes.basic.Intention.prototype.defaults)
});

joint.dia.Actorlink = joint.dia.Link.extend({
	defaults: joint.util.deepSupplement({
		type: 'Actorlink',
	})
})

joint.shapes.basic.Actor = joint.shapes.basic.Generic.extend({
    markup: '<g class="scalable"><circle class = "outer"/></g><circle class="label"/><path class="line"/><text class = "name"/>',
    defaults: joint.util.deepSupplement({
        type: "basic.Actor",
        size: {
            width: 120,
            height: 120
        },
        attrs: {
            ".label": {
            	r: 30,
            	cx: 30,
            	cy: 30,
            	fill: '#FFFFA4',
            	stroke: '#000000'
            },
            ".outer": {
            	r: 60,
            	cx: 60,
            	cy: 60,
            	fill: '#CCFFCC',
            	stroke: '#000000',
            	'stroke-dasharray': '5 2'
            },
            ".name": {
            	'text': 'Actor',
            	'fill': 'black',
            	'ref-y': '0.5',
            	'ref-x': '0.5',
            	'ref': '.label',
            	'font-size': 10,
            	'x-alignment': 'middle',
            	'y-alignment': 'middle'
            },
            ".line": {
            }
        }
    }, joint.dia.Element.prototype.defaults)
});
// This is an actor without boundary
joint.shapes.basic.Actor2 = joint.shapes.basic.Generic.extend({
    markup: '<g class="scalable"><circle class = "outer"/></g><path class="line"/><text class = "name"/>',
    defaults: joint.util.deepSupplement({
        type: "basic.Actor2",
        size: {
            width: 80,
            height: 80
        },
        attrs: {
            ".outer": {
                r: 60,
                cx: 60,
                cy: 60,
                fill: '#FFFFA4',
                stroke: '#000000'
            },
            ".name": {
                'text': 'Actor',
                'fill': 'black',
                'ref-y': '0.5',
                'ref-x': '0.5',
                'font-size': 10,
                'x-alignment': 'middle',
                'y-alignment': 'middle'
            },
            ".line": {
            }
        }
    }, joint.dia.Element.prototype.defaults)
});

//HTML to elements
joint.shapes.basic.IntentionView = joint.dia.ElementView.extend({

    template: [
        '<div class="html-element">',
        '<button class="satisfy-set" id="satisfied">S</button>',
        '<button class="satisfy-set" id="psatisfied">PS</button>',
        '<button class="satisfy-set" id="unknow">?</button>',
        '<button class="satisfy-set" id="conflict">X</button>',
        '<button class="satisfy-set" id="pdenied">PD</button>',
        '<button class="satisfy-set" id="denied">D</button>',
        '</div>'
    ].join(''),

    initialize: function() {
        _.bindAll(this, 'updateBox');
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);

        this.$box = $(_.template(this.template)());
        // Prevent paper from handling pointerdown.
        this.$box.find('.satisfy-set').on('mousedown click', function(evt) {
            evt.stopPropagation();
        });
        this.$box.find('.satisfy-set').on('click', _.bind(function(){alert("teste")}));
        this.updateBox();
    },
    render: function() {
        joint.dia.ElementView.prototype.render.apply(this, arguments);
        this.paper.$el.prepend(this.$box);
        this.updateBox();
        return this;
    },
    updateBox: function() {
        // Set the position and dimension of the box so that it covers the JointJS element.
        var bbox = this.model.getBBox();
        // Example of updating the HTML with a data stored in the cell model.
        this.$box.find('label').text(this.model.get('label'));
        this.$box.find('span').text(this.model.get('select'));
        this.$box.css({
            width: bbox.width,
            height: bbox.height,
            left: bbox.x,
            top: bbox.y,
            transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)'
        });
    },
    removeBox: function(evt) {
        this.$box.remove();
    }
});









