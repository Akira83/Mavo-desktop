const {Menu, BrowserWindow} = require('electron')
const electron = require('electron')
const app = electron.app

//Calling render javascritp
let window = BrowserWindow.getFocusedWindow()
let contents = window.webContents

const template = [
	{
		label: 'File',
		submenu: [
			{
				label: 'New Model',
				click: function() {
		        	contents.executeJavaScript('MainMenu.btnClearAll()');
                }
			},
			{
				label: 'Save Model',
				click:function() {
		        	contents.executeJavaScript('MainMenu.btnSave()');
                }
			},
			{
				label: 'Open Model',
				click:function() {
		        	contents.executeJavaScript('MainMenu.btnLoad()');
                }
			}
		]
	},
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        click:function(){
        	contents.executeJavaScript('MainMenu.btnUndo()');
        }
      },
      {
        label: 'Redo',
        click:function(){
        	contents.executeJavaScript('MainMenu.btnRedo()');
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Clear model',
        click: function(){
        	contents.executeJavaScript('App.graph.clear()');
        }
      },
      {
        label: 'Clear all labels',
        click: function(){
        	contents.executeJavaScript('MainMenu.btnClearAll()');
        }
      },
      {
        label: 'Clear all values',
        click: function(){
        	contents.executeJavaScript('MainMenu.btnClearElabel()');
        }
      },
      {
          type: 'separator'
      },
      {
    	  label: 'Increase font',
    	  click: function(){
          	contents.executeJavaScript('MainMenu.btnFntUp()');
    	  }
      },
      {
    	  label: 'Decrease font',
    	  click: function(){
          	contents.executeJavaScript('MainMenu.btnFntDown()');
    	  }
      },
      {
    	  label: 'Default font',
    	  click: function(){
          	contents.executeJavaScript('MainMenu.btnFnt()');
    	  }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload()
        }
      },
      {
	      label: 'Toggle Developer Tools',
	      accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
	      click (item, focusedWindow) {
	        if (focusedWindow) focusedWindow.webContents.toggleDevTools()
	      }
      },
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      },
      {
    	  label: 'View SVG',
    	  click: function(){
    		  contents.executeJavaScript('MainMenu.btnSVG()');
    	  }
      }
      
    ]
  },
  {
	  label: 'Analysis',
	  submenu: [
		  {
			  label: 'Run Analysis',
			  click () {
				  contents.executeJavaScript('MainMenu.runAnalysis()');
			  }
		  },
	  ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { 
        	require('electron').shell.openExternal('https://arxiv.org/pdf/1605.07767v3.pdf') 
    	}
      },
      {
          label: 'Legend',
          click () { 
        	  var url = require('url')
        	  var path = require('path')
        	  
        	   winlegend = new BrowserWindow({width: 800, height: 600})
        	   winlegend.loadURL(url.format ({
        	      pathname: path.join(__dirname, 'legend.html'),
        	      protocol: 'file:',
        	      slashes: true
        	   }))
      	}
      },
    ]
  }
]


const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)