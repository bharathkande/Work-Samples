import Model = sap.ui.model.Model;
import PropertyBinding = sap.ui.model.PropertyBinding;
import BindingHandle = require("sas/dm/commons/util/binding/BindingHandle");
import Unbindable = require("sas/dm/commons/util/binding/Unbindable");
import StringUtils = require("sas/dm/commons/util/StringUtils");
import CompositeBindingHandle = require("sas/dm/commons/util/binding/CompositeBindingHandle");
import AnyPropertyBindable = require("sas/dm/commons/model/base/AnyPropertyBindable");
import AnyBindingHandle = require("sas/dm/commons/util/binding/AnyBindingHandle");

class BindingUtils{
    public static handlePropertyChange(subject:Model,propertyToWatch:string,handler:(newValue:any, oldValue:any)=>void, callHandlerImmediately:boolean = false):BindingHandle{
        if(subject == null || handler == null || propertyToWatch == null){
            return null;
        }
        let binding:PropertyBinding = subject.bindProperty(propertyToWatch);
        subject.addBinding(binding);
        if(callHandlerImmediately == true){
            let beanStyleGetter:string = StringUtils.generateGetterFunctionName(propertyToWatch);
            if(subject[beanStyleGetter] != null && typeof subject[beanStyleGetter] == "function"){
                handler(subject[beanStyleGetter].call(subject), void(0));
            }else {
                handler(subject[propertyToWatch], void(0));
            }
        }
        return new BindingHandle(binding, handler);
    }

    public static handleAnyPropertyChange(subject:AnyPropertyBindable, handler:(property:string, newValue:any)=>void):Unbindable{
        if(subject == null || handler == null || BindingUtils.isAnyBindableInstance(subject) == false){
            return null;
        }
        const binding:PropertyBinding = (<any>subject).bindProperty("*");
        subject.addBinding(binding);
        return new AnyBindingHandle(binding, handler);
    }

    public static handlePropertiesChange(subject:Model, propertiesToWatch:Array<string>, handler:(property:string, newValue:any, oldValue:any)=>void, callHandlerImmediately:boolean = false):Unbindable{
        if(subject == null || handler == null || propertiesToWatch == null){
            return null;
        }
        const handles:Array<BindingHandle> = [];
        const propertiesToWatchLength:number = propertiesToWatch.length;
        for(let i:number = 0; i<propertiesToWatchLength; i++){
            let property:string = propertiesToWatch[i];
            let handle = BindingUtils.handlePropertyChange(subject, property, (n:any, o:any)=>{
                handler(property, n, o);
            }, callHandlerImmediately);
            handles.push(handle);
        }
        return new CompositeBindingHandle(handles);
    }

    public static isAnyBindableInstance(subject:Model):boolean{
        if(subject instanceof Model && subject["$any"] == true){
            return true;
        }
        return false;
    }

}

export=BindingUtils;
