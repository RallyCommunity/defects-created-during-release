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
        var project = this.getContext().getProject();
        var projectRef = project._ref;
        var releaseStartDate = release.get('ReleaseStartDate');
        var releaseStartDateISO = Rally.util.DateTime.toIsoString(releaseStartDate,true);
        var releaseDate = release.get('ReleaseDate');
        var releaseDateISO = Rally.util.DateTime.toIsoString(releaseDate,true);
        
        var myStore = Ext.create('Rally.data.wsapi.Store',{
            model: 'Defect',
            autoLoad:true,
            fetch: ['Name','State','CreationDate'],
            filters:[
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
            ],
            listeners: {
                    load: function(store,records,success){
                            console.log("loaded %i records", records.length);
                            this._updateGrid(myStore);
                    },
                    scope:this
            }
    });
     },
     _updateGrid: function(myStore){
   	if(this._myGrid === undefined){
   		this._createGrid(myStore);
   	}
   	else{
   		this._myGrid.reconfigure(myStore);
   	}
   },
   
    _createGrid: function(myStore){
        var that = this;
        that._projectOid = Rally.util.Ref.getOidFromRef(this.getContext().getProject()._ref);
        console.log(that._projectOid);
   	this._myGrid = Ext.create('Ext.grid.Panel', {
            title: 'Defects created during Release',
            store: myStore,
            columns: [
                {text: 'Name', dataIndex: 'Name', flex: 1,
                    renderer: function(val, meta, record) {
                        console.log(record.get('ObjectID'));
                        return '<a href="https://rally1.rallydev.com/#/' + that._projectOid + '/detail/defect/' + record.get('ObjectID') + '" target="_blank">' + record.get('Name') + '</a>';
                }
                },
                {text: 'CreationDate', dataIndex: 'CreationDate', flex: 2},
                {text: 'State', dataIndex: 'State', flex: 2}
            ],
            height: 400
   	});
   	this.add(this._myGrid);
   }
});