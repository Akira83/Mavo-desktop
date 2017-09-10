const {Menu} = require('electron')
const electron = require('electron')
const app = electron.app

const template = [
	{
		label: 'File',
		submenu: [
			{
				label: 'New Model',
				role:'new',
				click: function() {
                    console.log('New Model');
                }
			},
			{
				label: 'Save Model',
				role:'save',
				click:function() {
                    console.log('Save Model');
                }
			},
			{
				label: 'Open Model',
				role:'open',
				click:function() {
                    console.log('Open Model');
                }
			}
		]
	},
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo'
      },
      {
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      },
      {
        role: 'delete'
      },
      {
        role: 'selectall'
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
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('http://electron.atom.io') }
      }
    ]
  }
]


const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)