import BindingUtils = require("sas/dm/commons/util/binding/BindingUtils");
import Unbindable = require("sas/dm/commons/util/binding/Unbindable");
import FSAdminViewControllerBase = require("sas/dm/fsadmin/view/base/FSAdminViewControllerBase");
import SharedProperties = require("sas/dm/fsadmin/util/SharedProperties");
import Model = sap.ui.model.Model;
import ResourceModel = sap.ui.model.resource.ResourceModel;

class ServerSummaryViewController extends FSAdminViewControllerBase {
    private _isConnectedWatcher:Unbindable;
    protected onModelChange(model:Model, oldModel:Model, name?:string) {
        if (name == null) {
            this.unbind();
            this._isConnectedWatcher = BindingUtils.handlePropertyChange(model, "server/isConnected", $.proxy(this.onIsConnectedChange, this));
        }
    }

    protected onInit(): void {
        const resourceModel:ResourceModel = <ResourceModel> sap.ui.getCore().getModel(SharedProperties.I18N_MODEL_NAME);
        this._resourceBundle = resourceModel.getResourceBundle();
    }

    private onIsConnectedChange(newValue:boolean, oldValue:boolean):void {
        // Check configuration issue
    }

    private unbind():void {
        BindingUtils.unbind(this._isConnectedWatcher);
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
