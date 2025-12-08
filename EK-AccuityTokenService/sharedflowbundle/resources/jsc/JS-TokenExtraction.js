var resString = context.getVariable('LoginServiceResponse.content');
var realvalue = resString.indexOf("sessionId");
var result = resString.substring(realvalue);
result = result.substring(result.indexOf(">")+1);
result = result.substring(0,result.indexOf("<"));
context.setVariable('cache.apiAccessToken',result);

