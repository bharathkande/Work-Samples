import ServerSummaryPM = require("sas/dm/fsadmin/view/ServerSummaryPM");
import Action = require("sas/dm/commons/util/Action");
import BindingUtils = require("sas/dm/commons/util/binding/BindingUtils");
import Unbindable = require("sas/dm/commons/util/binding/Unbindable");
import FSAdminViewControllerBase = require("sas/dm/fsadmin/view/base/FSAdminViewControllerBase");
import DataServicesWizardComponent = require("sas/dm/fsadmin/view/wizard/DataServicesWizardComponent");
import Model = sap.ui.model.Model;
import Event = sap.ui.base.Event;
import ResponsiveToolbar = sas.hc.m.ResponsiveToolbar;
import ToolbarSpacer = sas.hc.m.ToolbarSpacer;
import ActionButton = require("sas/dm/commons/components/ActionButton");
import MenuAction = require("sas/dm/commons/util/MenuAction");
import ActionListMenu = require("sas/dm/commons/components/m/ActionListMenu");
import MenuButton = sas.hc.m.MenuButton;
import ErrorResponse = require("sas/dm/commons/model/ErrorResponse");

class ServerSummaryViewController extends FSAdminViewControllerBase {
    private _isConnectedWatcher:Unbindable;
    private _actionsWatcher:Unbindable;
    private static URL_KEY:string = "fsUrl";
    private static CONNSTR_KEY:string = "constring";
    
    protected onModelChange(model:Model, oldModel:Model, name?:string) {
        if (name == null) {
            this.unbind();
            this._isConnectedWatcher = BindingUtils.handlePropertyChange(model, "server/isConnected", $.proxy(this.onIsConnectedChange, this));
            this._actionsWatcher = BindingUtils.handlePropertyAndArrayChange(model, "server/actions", $.proxy(this.onActionsChange, this), true);
            this.getPMController().attachEvent(ServerSummaryPM.EVT_NEWDATASERVICE, null, this.onNewDataService, this);
        }
    }

    private onIsConnectedChange(newValue:boolean, oldValue:boolean):void {
        // Check configuration issue
    }

    private getPMController():ServerSummaryPM {
        return <ServerSummaryPM> this.getModelController();
    }

    private onActionsChange(index:number, removes:Array<Action>, adds:Array<Action>):void {
        let toolbar:ResponsiveToolbar = <ResponsiveToolbar> this.byId("serverToolbar");
        if (toolbar == null) {
            return;
        }
        if(toolbar.getContent() != null) {
            toolbar.removeAllContent();
        }
        let newValue:Array<Action> = null;
        if(this.getPMController().server != null){
            newValue = this.getPMController().server.actions;
        }
        if (newValue == null || newValue.length == 0) {
            return;
        }

        toolbar.addContent(new ToolbarSpacer());
        for (let i:number = 0; i < newValue.length; i++) {
            let action:MenuAction = <MenuAction> newValue[i];
            if (action.icon === sas.icons.HC.OVERFLOW) {
                let menu:ActionListMenu = new ActionListMenu();
                menu.setActionList(action.subActions);
                let menuButton:MenuButton = new MenuButton({icon: sas.icons.HC.OVERFLOW});
                menuButton.setMenu(menu);
                toolbar.addContent(menuButton);
            }
            else {
                let button:ActionButton = new ActionButton();
                button.setAction(action);
                button.setShowLabel(false);
                toolbar.addContent(button);
            }
        }
    }

    public connectionFormatter(value:{[p:string]:string}):string {
        let retVal:string = "";

        if (value == null) {
            return retVal;
        }

        let prop:string = value[ServerSummaryViewController.URL_KEY];
        if (prop != null) {
            retVal = "URL=" + prop + ";";
        }
        prop = value[ServerSummaryViewController.CONNSTR_KEY];
        if (prop != null) {
            retVal += prop;
        }

        return retVal;
    }

    public onDataServiceSuccess(event:Event):void{
        this.getPMController().addNewItem(event.getParameter("dataService"));
    }

    public onDataServiceError(event:Event):void{
        const error:ErrorResponse = event.getParameter("error");
        this.showErrorDialog(error);
    }

    private onNewDataService(event:Event):void{
        const wizard:DataServicesWizardComponent = <DataServicesWizardComponent>this.byId("dataServicesWizard");
        wizard.setServer(this.getPMController().server);
        wizard.show();
    }

    private unbind():void {
        BindingUtils.unbind(this._isConnectedWatcher);
        BindingUtils.unbind(this._actionsWatcher);

        const pm:ServerSummaryPM = this.getPMController();
        if (pm!= null){
            pm.detachEvent(ServerSummaryPM.EVT_NEWDATASERVICE, this.onNewDataService, this);
        }
    }

    public destroy():void {
        this.unbind();
        super.destroy();
    }
}
export = ServerSummaryViewController;

sap.ui["define"]("ServerSummaryViewController", ['sap/ui/core/mvc/Controller'],
    function(Controller){
        return Controller.extend("sas.dm.fsadmin.view.Server", new ServerSummaryViewController());
    });
