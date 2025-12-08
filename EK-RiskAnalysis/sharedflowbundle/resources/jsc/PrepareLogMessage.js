     
    var clientRequest=  "RBA Request :\n " + context.getVariable('TMXRequest.content') + '\n' ; 
    var clientResponse=  "RBA Response :\n " + context.getVariable('TMXResponse.content') +'\n' ;
    
    var ssoID=   context.getVariable('extractedSsoId') ;
    
    var logObject = 		{
					"riskAssessmentLogRequest": {
						"ssoId": ssoID,
						"isDataEnrichmentRequired": false,
						"requestPayload":  clientRequest,
						"responsePayload": clientResponse
					}
				} ;
					

    context.setVariable('LogContent',  JSON.stringify(logObject));






