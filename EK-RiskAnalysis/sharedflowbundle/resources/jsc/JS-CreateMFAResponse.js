

 var ssoSessionToken=context.getVariable("ssoSessionToken");
 var expiresAt =context.getVariable("expiresAt");
 var challengeRefCode=context.getVariable("challengeRefCode");
 var ssoId=context.getVariable("extractedSsoId");
 
 var factorsStatus = context.getVariable("getFactorsListResponse.status.code");
   
 var modifiedResponse = {};
 var profile={};
var FactorsArray = [];

if (factorsStatus == "200"){
    
 var responseObj1=JSON.parse(context.getVariable("getFactorsListResponse.content"));

 for(var i = 0; i < responseObj1.length; i++) {
     var factorObj = responseObj1[i];

     FactorsArray.push({ 
        "id" : factorObj.id,
        "factorType"  : factorObj.factorType,
        "provider":factorObj.provider,
         "factorsProfile":{
             "credentialId":factorObj.profile.credentialId,
             "phoneNumber":factorObj.profile.phoneNumber,
             "phoneExtension":factorObj.profile.phoneExtension,
             "email":factorObj.profile.email,
             "question":factorObj.profile.question,
             "questionText":factorObj.profile.questionText,
             "answer":factorObj.profile.answer
                      }
                });
}
}

if(ssoSessionToken)
{
 modifiedResponse.status = "MFA_REQUIRED";
 modifiedResponse.ssoSessionToken = ssoSessionToken;
 modifiedResponse.expiresAt= expiresAt;
 modifiedResponse.ssoId=ssoId;
 modifiedResponse.challengeRefCode=challengeRefCode;
} else {
 modifiedResponse.status = "MFA_REQUIRED";
 modifiedResponse.challengeRefCode=challengeRefCode;
  modifiedResponse.ssoId=ssoId;
}


 modifiedResponse.factors=FactorsArray;

 context.setVariable("MFAResponse", JSON.stringify(modifiedResponse));
 
 
 