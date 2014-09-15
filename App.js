Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items:{ html:'<a href="https://help.rallydev.com/apps/2.0rc3/doc/">App SDK 2.0rc3 Docs</a>'},
    launch: function() {
        var rComboBox = Ext.create('Rally.ui.combobox.ReleaseComboBox',{
   		listeners:{
   			ready: function(combobox){
   				this._getData(combobox.getRecord());
   			},
   			select: function(combobox){
   				this._getData(combobox.getRecord());
   			},
   			scope: this 
   		}
   	});
   	this.add(rComboBox);
    },
    
    _getData: function(release){
        var projectRef = this.getContext().getProject()._ref;
        var releaseStartDate = release.get('ReleaseStartDate');
        var releaseStartDateISO = Rally.util.DateTime.toIsoString(releaseStartDate,true);
        var releaseDate = release.get('ReleaseDate');
        var releaseDateISO = Rally.util.DateTime.toIsoString(releaseDate,true);
        
        this._filters = [
                    {
                        property : 'CreationDate',
                        operator : '>=',
                        value : releaseStartDateISO
                    },
                    {
                        property : 'CreationDate',
                        operator : '<=',
                        value : releaseDateISO
                    },
                    {
                        property : 'Project',
                        value: projectRef
                    }
            ];
        var myStoreConfig = {
            model: 'Defect',
            remoteSort: false,
            fetch: ['Name','State','CreationDate','Requirement', 'FormattedID', 'ObjectID', 'Project'],
            filters: this._filters,
        }
        this._updateGrid(myStoreConfig);
     },
     _updateGrid: function(myStore){
   	if(this._myGrid === undefined){
   		this._createGrid(myStore);
   	}
        else{
	    this._myGrid.store.clearFilter(true);
	    this._myGrid.store.filter(this._filters);
   	}
   },
   
    _createGrid: function(myStore){
        var that = this;
        that._projectOid = Rally.util.Ref.getOidFromRef(this.getContext().getProject()._ref);
        console.log(that._projectOid);
   	this._myGrid = Ext.create('Rally.ui.grid.Grid', {
            title: 'Defects created during Release',
            storeConfig: myStore,
            enableEditing: false,
            showRowActionsColumn: false,
            columnCfgs: [
                {text: 'FormattedID', dataIndex: 'FormattedID'},
                {text: 'Name', dataIndex: 'Name',
                    renderer: function(val, meta, record) {
                        console.log(record.get('ObjectID'));
                        return '<a href="https://rally1.rallydev.com/#/' + that._projectOid + '/detail/defect/' + record.get('ObjectID') + '" target="_blank">' + record.get('Name') + '</a>';
                }
                },
                {text: 'CreationDate', dataIndex: 'CreationDate'},
                {text: 'State', dataIndex: 'State'},
                {text: 'Requirement', dataIndex: 'Requirement',
                    renderer: function(val, meta, record) {
                        if(record.get('Requirement')){
                            return '<a href="https://rally1.rallydev.com/#/' + record.get('Requirement').Project.ObjectID + '/detail/userstory/' + record.get('Requirement').ObjectID + '" target="_blank">' + record.get('Requirement').FormattedID + '</a>';
                        }
                        else{
                            return 'None'
                        }
                        
                    }
                }
                
            ],
            height: 400
   	});
   	this.add(this._myGrid);
   }
});