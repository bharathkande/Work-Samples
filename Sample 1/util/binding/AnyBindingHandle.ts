import PropertyBinding = sap.ui.model.PropertyBinding;
import Unbindable = require("sas/dm/commons/util/binding/Unbindable");
class AnyBindingHandle implements Unbindable {
    private _binding:PropertyBinding = null;
    private _handler:(property:string, newValue:any)=>void;
    private _wrappedHandler:(event:any)=>void;

    constructor(binding:PropertyBinding,handler:(property:string, newValue:any)=>void) {
        this._binding = binding;
        this._handler = handler;

        if(binding != null && handler != null){
            this._wrappedHandler = (event:any):void => {
                const property:string = event.mParameters.property;
                const newVal:any = event.mParameters.newValue;
                this._handler(property, newVal);
            };
            this._binding.attachEvent("change",void(0),this._wrappedHandler,this);
        }
    }

    public unbind():void{
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
export=AnyBindingHandle;