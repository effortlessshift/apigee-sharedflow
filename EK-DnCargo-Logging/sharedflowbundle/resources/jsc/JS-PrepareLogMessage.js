/* Construct Generic KVM element name based on Proxy name*/
var LogValues = context.getVariable("ProxyLogKVM");



/***Retrieve CLE Related Flow Variables*/
var CLEappID = context.getVariable('CLELog.applicationID');
var CLEsoure = context.getVariable('app.DisplayName');
var CLEtarget = context.getVariable('CLELog.target');
var CLEserviceName = context.getVariable('CLELog.serviceName');
var CLEcomponentName = context.getVariable('CLELog.componentName');
var CLEsrcMessageID = context.getVariable('CLELog.sourceMessageID');
var CLECorrelationID = context.getVariable('CLELog.correlationID');
var CLEsessionID = context.getVariable('CLELog.sessionID');
var CLEsessionToken = context.getVariable('CLELog.sessionToken');
var CLEshortMsgDesc = context.getVariable('CLELog.shortMsgDesc');
var CLEclientRequest = "Client Request : " + context.getVariable("CLELog.clientRequest") + '\n';

var tempClientResponse = context.getVariable("CLELog.clientResponse");

var RBALogContent = "";
var CLELogContent = "";
var CSOCLogContent = "";

if (tempClientResponse !== null) {
    var CLEclientResponse = "Client Response : " + context.getVariable("CLELog.clientResponse") + '\n';
} else {
    var CLEclientResponse = "Client Response : " + context.getVariable("message.content") + '\n';
}

for (i = 1; i <= 6; i++) {


    TargetRequest = context.getVariable("CLELog.targetRequest." + i);
    TargetResponse = context.getVariable("CLELog.targetResponse." + i);

    if (TargetRequest !== null) {
        TargetReqResp += "\nTarget Request " + i + ":" + TargetRequest + '\n' +
            "Target Response " + i + ":" + TargetResponse + '\n';
    }

}


/*Initialise Values*/

context.setVariable("MessageLog", "OFF");

var RBALog = "OFF";
var CSOCLog = "OFF";
var CLELog = "OFF";

var correlationId = context.getVariable("correlationId");
var appCode = context.getVariable("channelName");


/*CLE Flow */

/*Check for KVM values contains Flag ON or OFF*/

if (LogValues.includes("CLE_ERROR_ON") === true || LogValues.includes("CLE_LOG_ON") === true) {
    CLELog = "ON";
    context.setVariable("CLELog", "ON");
}

/*Construct CLE Log Message */

if (CLELog === "ON") {

    var errorMessage = "Error Message : " + context.getVariable("error.content");

    var TargetRequest = "";
    var TargetResponse = "";
    var TargetReqResp = "";
    var logType = "";
    var logLevel = "";
    var MessageTrace = "";
    var errorTS = "";
    var shortMessageDesc = "";


    if ((errorMessage.indexOf("fault") >= 0) || CLEclientResponse.indexOf("errorCode") >= 0) {
        logType = "ERROR";
        logLevel = "ERROR";

        if (LogValues.includes("CLE_ERROR_ON") === true) {
            CLELog = "ON";
        } else {
            CLELog = "OFF";
        }


        MessageTrace = CLEclientRequest + '\n' + CLEclientResponse + '\n' + errorMessage + '\n' + TargetReqResp;
        shortMessageDesc = CLEshortMsgDesc;

    }
    else 
    {

        if (LogValues.includes("CLE_LOG_ON") === true) {
            CLELog = "ON";
        } else {
            CLELog = "OFF";
        }
      

        logType = "LOG";
        logLevel = "DEBUG";
        MessageTrace = CLEclientRequest + '\n' + CLEclientResponse + '\n' + TargetReqResp;
        shortMessageDesc = CLEshortMsgDesc;
    }

    var logObject = {
        "Header": {
            "applicationID": CLEappID,
            "sourceApp": CLEsoure,
            "targetApp": CLEtarget,
            "serviceType": context.getVariable('request.verb'),
            "serviceName": context.getVariable('currentFlowName'),
            "componentName": CLEcomponentName,
            "moduleName": context.getVariable("organization.name") + "-->" + context.getVariable("environment.name") + "-->" + context.getVariable("apiproxy.name"),
            "processName": context.getVariable("proxy.url"),
            "sourceMessageID": CLEsrcMessageID,
            "trackingID": context.getVariable("messageid"),
            "correlationID": CLECorrelationID,
            "logTimeStamp": getXMLDate(context.getVariable('system.timestamp')),
            "logType": logType,
            "logLevel": logLevel
        },
        "Body": {
            "ErrorInfo": {
                "errorCode": context.getVariable('error.status.code'),
                "errorDesc": context.getVariable('error.content'),
                "errorType": "",
                "errorTimeStamp": getXMLDate(context.getVariable('system.timestamp'))
            },
            "MessageDetails": {
                "shortMsgDesc": shortMessageDesc,
                "messageTrace": MessageTrace,
                "messageTimeStamp": getXMLDate(context.getVariable('client.received.start.timestamp'))
            },
            "ServerInfo": {
                "hostName": context.getVariable("client.host"),
                "ipAddress": context.getVariable("client.ip"),
                "instanceName": ""
            },
            "SessionInfo": {
                "sessionID": CLEsessionID,
                "sessionSequence": "",
                "sessionToken": CLEsessionToken
            }
        }
    };

    if (CLELog == "ON") {
        CLELogContent = ',"CLE":' + JSON.stringify(logObject) + ',"ENDCLE":"TRUE"';
    }

}

function getXMLDate(milliSecs) {

    var ts = new Date(milliSecs);
    var dat = ts.toISOString();
    return dat;

}

/*RBA Flow*/

/*Check for KVM values contains Flag ON or OFF*/
if (LogValues.includes("RBA_ON") === true) {
    var RBALog = "ON";
}

/*Construct RBALog Message*/

if (RBALog === "ON") {

    if (context.getVariable('TMXRequest.content')) {
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
        RBALogContent = ',"RBACSOC":' + JSON.stringify(RBALogObject) + ',"ENDRBACSOC":"TRUE"';
    } else {

        /*Setting the RBALog as off when RBA cleint request is null. 
        Meaning TMX flow dint execute*/

        var RBALog = 'OFF';


    }
}

/* CSOC flow*/

/*Check for KVM values contains Flag ON or OFF*/

if (LogValues.includes("CSOC_ON") === true) {
    var CSOCLog = "ON";

}

/*Construct CSOC Logging Message*/
if (CSOCLog === "ON") {

    if (context.getVariable("flow.errorMessage")) {
        if (context.getVariable("flow.dynamicErrorMessage")) {
            var dynamicErrorMessage = context.getVariable("flow.dynamicErrorMessage");

        } else {
            var dynamicErrorMessage = "";
        }

        if (context.getVariable("flow.dynamicErrorMessage1")) {
            var dynamicErrorMessage1 = context.getVariable("flow.dynamicErrorMessage1");

        } else {
            var dynamicErrorMessage1 = "";
        }

        if (context.getVariable("flow.dynamicErrorMessage2")) {
            var dynamicErrorMessage2 = context.getVariable("flow.dynamicErrorMessage2");

        } else {
            var dynamicErrorMessage2 = "";
        }

        if (context.getVariable("flow.dynamicErrorMessage3")) {
            var dynamicErrorMessage3 = context.getVariable("flow.dynamicErrorMessage3");

        } else {
            var dynamicErrorMessage3 = "";
        }


        var CSOCLogObject = {
            "event": {
                "organization": context.getVariable("organization.name"),
                "environment": context.getVariable("environment.name"),
                "proxyName": context.getVariable("apiproxy.name"),
                "proxyRevision": context.getVariable("apiproxy.revision"),
                "userAgent": context.getVariable("request.header.user-agent"),
               "clientIp": context.getVariable("request.header.x-forwarded-for"),
                "requestParams": context.getVariable("request.querystring"),
                "timestamp": context.getVariable("system.time"),
                "region": context.getVariable("system.region.name"),
                "resourceName": context.getVariable("currentFlowName"),
                "sourceApp": context.getVariable("app.DisplayName"),
                "channelName": context.getVariable("channelName"),
                "srcMsgId": context.getVariable("sourceMessageId"),
                "correlationId": context.getVariable("correlationId"),
                "userName": context.getVariable("csoc.userName"),
                "oktaId": context.getVariable("csoc.ssoId"),
                
				
			//	"skywardsNumber": context.getVariable("skywardsNumber"),
			//	"lastName": context.getVariable("lastName"),
			//	"tier": context.getVariable("tier"),
			//	"firstName": context.getVariable("firstName"),
			//	"primaemail": context.getVariable("primaryemail"),
			//	"personId": context.getVariable("personId"),

				"statusCode": context.getVariable("flow.statusCode"),
				"errorResponse": context.getVariable("CLELog.clientResponse"),
				"httpMethod": context.getVariable("origVerb"),
				"contentLength": context.getVariable("originalRequest").length,		
				"targetPath": context.getVariable("target.url"),
				"proxyPath": context.getVariable("headerProxyUrl"),
				"acceptHeader": context.getVariable("headerAccept"),
				"acceptEncodingHeader": context.getVariable("headerAcceptEncoding"),
				"orgHostHeader": context.getVariable("headerOrgHost"),
				"xfwdForHeader": context.getVariable("headerXfwdFor"),
				"xfwdPortHeader": context.getVariable("headerXfwdPort"),                
                
                "status": "Failure",
                "errorMessage": context.getVariable("flow.errorMessage") + dynamicErrorMessage + dynamicErrorMessage1 + dynamicErrorMessage2 + dynamicErrorMessage3
            }
        };
    } else {

        var CSOCLogObject = {
            "event": {
                "organization": context.getVariable("organization.name"),
                "environment": context.getVariable("environment.name"),
                "proxyName": context.getVariable("apiproxy.name"),
                "proxyRevision": context.getVariable("apiproxy.revision"),
                "userAgent": context.getVariable("request.header.user-agent"),
                "clientIp": context.getVariable("request.header.x-forwarded-for"),
                "requestParams": context.getVariable("request.querystring"),
                "timestamp": context.getVariable("system.time"),
                "region": context.getVariable("system.region.name"),
                "resourceName": context.getVariable("currentFlowName"),
                "sourceApp": context.getVariable("app.DisplayName"),
                "channelName": context.getVariable("channelName"),
                "srcMsgId": context.getVariable("sourceMessageId"),
                "correlationId": context.getVariable("correlationId"),
                "userName": context.getVariable("csoc.userName"),
                "oktaId": context.getVariable("csoc.ssoId"),
                
			//	"skywardsNumber": context.getVariable("skywardsNumber"),
			//	"lastName": context.getVariable("lastName"),
			//	"tier": context.getVariable("tier"),
			//	"firstName": context.getVariable("firstName"),
			//	"primaemail": context.getVariable("primaryemail"),
			//	"personId": context.getVariable("personId"),
				
				"statusCode": context.getVariable("response.status.code"),
				"httpMethod": context.getVariable("origVerb"),
				"contentLength": context.getVariable("originalRequest").length,		
				"targetPath": context.getVariable("target.url"),
				"proxyPath": context.getVariable("headerProxyUrl"),
				"acceptHeader": context.getVariable("headerAccept"),
				"acceptEncodingHeader": context.getVariable("headerAcceptEncoding"),
				"orgHostHeader": context.getVariable("headerOrgHost"),
				"xfwdForHeader": context.getVariable("headerXfwdFor"),
				"xfwdPortHeader": context.getVariable("headerXfwdPort"),                
                
                "status": "Success"
            }
        };
    }

    CSOCLogContent = ',"CSOC":' + JSON.stringify(CSOCLogObject) + ',"ENDCSOC":"TRUE"';
}



/*Check wether either one of the Log flags are on .
If this Flag is ON Post Post Message Log Policy will be called*/

if (CSOCLog == "ON" || RBALog == "ON" || CLELog == "ON") {

    var logMessageContent = '{"Identifier":' + '"' + CLEsoure + '==' + context.getVariable("apiproxy.name") + '==' + context.getVariable("CLELog.serviceName") + '==' + context.getVariable("messageid") + '"' + ',"applicationCode":' + '"' + appCode + '"' + ',"clientTransactionId":"' + correlationId + '"' + CLELogContent + CSOCLogContent + RBALogContent + '}';
    context.setVariable("logMessage", logMessageContent);

    context.setVariable("MessageLogEnabled", "ON");

}