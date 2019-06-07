class StringUtils{

    public static isNonEmptyString(obj:any):boolean{
        if(typeof obj == "string" && obj.length > 0){
            return true;
        }
        return false;
    }

    public static initCaps(str:string):string{
        if(StringUtils.isNonEmptyString(str) == false){
            return str;
        }
        return str[0].toLocaleUpperCase() + str.substr(1);
    }

    public static generateGetterFunctionName(propertyName:string):string{
        if(StringUtils.isNonEmptyString(propertyName)==false){
            return null;
        }
        return "get"+StringUtils.initCaps(propertyName);
    }

}
export=StringUtils;