var RBAclientRequest = "RBA Request :\n " + context.getVariable("TMXRequest.content") + '\n';
var RBAclientResponse = "RBA Response :\n " + context.getVariable("TMXResponse.content") + '\n';
var ssoID = context.getVariable("extractedSsoId");

        var RBALogObject = {
            "riskAssessmentLogRequest": {
                "ssoId": ssoID,
                "isDataEnrichmentRequired": false,
                "requestPayload": RBAclientRequest,
                "responsePayload": RBAclientResponse
            }
        };
RBALogContent=JSON.stringify(RBALogObject);
context.setVariable("RBALogContent", RBALogContent);


print("RBAclientRequest=", RBAclientRequest );
print("RBAclientResponse=", RBAclientResponse );
print("RBALogContent=", RBALogContent );