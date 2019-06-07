import PropertyBinding = sap.ui.model.PropertyBinding;
import Unbindable = require("sas/dm/commons/util/binding/Unbindable");
class BindingHandle implements Unbindable {
    private _binding:PropertyBinding = null;
    private _handler:(newValue:any, oldValue:any)=>void;
    private _wrappedHandler:(event:any)=>void;

    constructor(binding:PropertyBinding,handler:(oldValue:any, newValue:any)=>void) {
        this._binding = binding;
        this._handler = handler;

        if(binding != null && handler != null){

            this._wrappedHandler = (event:any):void => {
                var oldVal = event.mParameters.oldValue;
                var newVal = event.mParameters.newValue;
                this._handler(newVal, oldVal);
            }
            var oldValue:any = null;
            this._binding.attachEvent("change",void(0),this._wrappedHandler,this);
        }
    }

    unbind():void{
        if(this._binding != null && this._handler != null) {
            this._binding.getModel().removeBinding(this._binding);
            this._binding.detachEvent("change", this._wrappedHandler, this);
        }
        // remove references so this will get cleaned up
        this._binding = null;
        this._handler = null;
        this._wrappedHandler = null;
    }
}
export=BindingHandle;