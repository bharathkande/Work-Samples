import Context = require("sas/dm/commons/context/Context");
import SharedProperties = require("sas/dm/fsadmin/util/SharedProperties");
import Server = require("sas/dm/fsadmin/model/Server");
import Action = require("sas/dm/commons/util/Action");
import MenuAction = require("sas/dm/commons/util/MenuAction");
import BindingUtils = require("sas/dm/commons/util/binding/BindingUtils");
import Unbindable = require("sas/dm/commons/util/binding/Unbindable");
import HomeTreeItemAwarePM = require("sas/dm/fsadmin/view/base/HomeTreeItemAwarePM");
import HomeTreeItem = require("sas/dm/fsadmin/model/HomeTreeItem");
import ResourceModel = sap.ui.model.resource.ResourceModel;
import Event = sap.ui.base.Event;
import ErrorResponse = require("sas/dm/commons/model/ErrorResponse");
import FedServerConnection = require("sas/dm/fsadmin/model/FedServerConnection");
import MasterController = require("sas/dm/fsadmin/controller/MasterController");

class ServerSummaryPM extends HomeTreeItemAwarePM {

    private _resourceBundle:JQuerySAPUtilResourceBundle;
    private _server:Server;
    private _initialized:boolean;
    private _newServiceAction:MenuAction;
    private _pauseAction:MenuAction;
    private _isConnectedWatcher:Unbindable;
    private _serverStateWatcher:Unbindable;
    private _serverConnectionWatcher:Unbindable;
    private _connectedUser:string;

    public static readonly EVT_NEWDATASERVICE:string="onNewDataService";
    public static readonly EVT_ONPAUSECONNECTION:string="onPauseConnection";

    constructor(){
        super();
        this._initialized = false;
        const resourceModel:ResourceModel = <ResourceModel> sap.ui.getCore().getModel(SharedProperties.I18N_MODEL_NAME);
        this._resourceBundle = resourceModel.getResourceBundle();
    }

    protected onSetContext(value:Context):void {
        super.onSetContext(value);
        if(this.getMasterController() != null){
            this.initialize();
        }
    }

    private initialize():void {
        if(!this._initialized) {
            this._newServiceAction = new MenuAction(this._resourceBundle.getText("server.view.newservice.menuitem.label"), $.proxy(this.onNewService, this),
                sas.icons.OBJECTTYPES.DATASOURCE_OBJ, this._resourceBundle.getText("server.view.newservice.button.tip.label"), false, false);
            this._pauseAction = new MenuAction(this._resourceBundle.getText("server.view.pause.menuitem.label"), $.proxy(this.onPause, this),
                sas.icons.HC.PAUSE, this._resourceBundle.getText("server.view.pause.button.tip.label"), true, false);
        }
        if(this.server != null){
            this.updateActionStates();
            this.buildActionList();
        }
    }

    protected onSetHomeTreeItem(value:HomeTreeItem):void{
        this.server = <Server>value;
    }

    public get server():Server {
        return this._server;
    }

    public set server(value:Server) {
        this._server = value;

        this.unbind();
        if (value != null) {
            this._isConnectedWatcher = BindingUtils.handlePropertyChange(value, "isConnected", $.proxy(this.onIsConnectedChange, this), true);
            this._serverStateWatcher = BindingUtils.handlePropertyChange(value, "serverState", $.proxy(this.onServerStateChange, this), true);
            this._serverConnectionWatcher = BindingUtils.handlePropertyChange(value, "connection", $.proxy(this.onServerConnectionChange, this), true);
        }
        this.buildActionList();
    }

    private buildActionList():void {
        if (this._server == null || this._initialized !== true) {
            return;
        }

        let actions:Array<Action> = [];
        actions.push(this._newServiceAction);
        actions.push(this._pauseAction);

        let subActions:Array<Action> = [];
        subActions.push(this._newServiceAction);
        subActions.push(this._pauseAction);

        let overflowAction:MenuAction = new MenuAction(null, null, sas.icons.HC.OVERFLOW);
        overflowAction.subActions = subActions;
        actions.push(overflowAction);

        this._server.actions = actions;
    }

    public getMasterController():MasterController {
        return super.getMasterController();
    }

    public get connectedUser():string {
        return this._connectedUser;
    }

    public set connectedUser(value:string) {
        this._connectedUser = value;
    }

    private onIsConnectedChange(newValue:boolean, oldValue:boolean):void {
        this.updateActionStates();
    }

    private onServerStateChange(newValue:string, oldValue:string):void {
        this.updateActionStates();
    }

    private onServerConnectionChange(newValue:FedServerConnection, oldValue:FedServerConnection):void {
        this.updateActionStates();
    }

    private onNewService():void {
        this.fireEvent(ServerSummaryPM.EVT_NEWDATASERVICE);
    }

    private onPause(event:Event):void {
         this.fireEvent(ServerSummaryPM.EVT_ONPAUSECONNECTION);
    }

    //mid tier call for Pause action
    public onPauseServer():void {
        this.getMasterController().pauseServer(this._server.connection.serverConnectionId, $.proxy(this.onPauseSuccess, this),$.proxy(this.onPauseError, this));
    }

    // mid tier pause success callback
    private onPauseSuccess(response: string):void {
        this._server.serverState = response;
        this._pauseAction.isVisible = false;
    }

    //mid tier pause error callback
    private onPauseError(error: ErrorResponse):void {
        let errorTitle:string = this._resourceBundle.getText("server.view.pause.error.dialog.title");
        let errorText:string = this._resourceBundle.getText("server.view.pause.error.dialog.msg");
        let errorDetailText:string = error.message;
        this.showErrorMessageDialog(errorTitle, errorText, errorDetailText);
    }

    private updateActionStates():void {
        // when the view is first initialized, the server property can have been set prior to the
        // onContextChange being fired, so do a check here to see if initialization has already happened.
        if(this.server == null || this._initialized !== true){
            return;
        }

        if (!this._server.isConnected) {
            this._newServiceAction.isEnabled = false;
            this._pauseAction.isEnabled = false;
            this._pauseAction.isVisible = true;
            return;
        }

        this._newServiceAction.isEnabled = true;

        if (this.server.connection && !this.server.connection.isAdministratable) {
            this._pauseAction.isVisible = false;
            return;
        }

        const serverState:string = this._server.serverState;
        this._pauseAction.isEnabled = (serverState == SharedProperties.SERVER_STATE_STARTPENDING || serverState == SharedProperties.SERVER_STATE_RUNNING);
        this._pauseAction.isVisible = (serverState == SharedProperties.SERVER_STATE_STARTPENDING || serverState == SharedProperties.SERVER_STATE_RUNNING);
    }

    private unbind():void {
        BindingUtils.unbind(this._isConnectedWatcher);
        BindingUtils.unbind(this._serverStateWatcher);
        BindingUtils.unbind(this._serverConnectionWatcher);
    }

    public destroy():void{
        this.unbind();
        this._initialized = false;
        super.destroy();
    }
}

export = ServerSummaryPM;