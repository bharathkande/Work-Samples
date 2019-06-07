import Unbindable = require("sas/dm/commons/util/binding/Unbindable");
import BindingHandle = require("sas/dm/commons/util/binding/BindingHandle");

class CompositeBindingHandle implements Unbindable {
    private _bindingHandles:Array<BindingHandle|Unbindable>;

    constructor(bindingHandles:Array<BindingHandle|Unbindable>) {
        this._bindingHandles = bindingHandles;
    }

    public unbind():void{
        if(this._bindingHandles == null){
            return;
        }
        const bindingHandlesLength:number = this._bindingHandles.length;
        for(let i=0; i<bindingHandlesLength; i++){
            let handle:BindingHandle|Unbindable = this._bindingHandles[i];
            if(handle != null && handle.unbind != null){
                handle.unbind();
            }
        }
        this._bindingHandles = null;
    }
}
export=CompositeBindingHandle;