sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("com.lt.educationalui.controller.Education", {
        onInit() {

            //Qualification Sub Type - other than SSC & HSC
            this._getQualificationSubType();

            //this._onCreateRecord();
        },

        _getQualificationSubType: function () { 
            var oModel = this.getOwnerComponent().getModel(),
            entity = "/PickListV2(effectiveStartDate=datetime'1900-01-01T00:00:00',id='LT_QualificationSubType')/values"

            oModel.read(entity, {
                success: function (resp) {      
                    //resp.results[0].externalCode = QualificationSubType Code        
                    console.log("getQualificationSubType Length:" +resp.results.length);   
                }.bind(this),
                error: function (err) {
                    console.error("Error in Qualification SubType", err);
                }
            });                
        },

        _onCreateRecord: function(oEvent) { 
            var eduDetails = {
                "PSID":"2345679",
                "course":"SSC",
                "qualificationSubType":"SSC",
                "educationCertificate":"10",
                "branch1":"",
                "branch2":"",
                "yearOfPassing":2000,
                "institution":"ABC",
                "boardOrUniversity":"",
                "courseType":"",
                "duration":"",
                "percentage":"8.2",
                "cgpa":"7.2",
                "division":"",
                "grade":"",
                "status":"",
                "fileName":""
            }
            /*var posturl = this.getOwnerComponent().getManifestObject().resolveUri(
                "/odata/v4/educational/Educational_Details"
            );*/
            var entity = "Educational_Details"
            var oModel = this.getOwnerComponent().getModel("educational").sServiceUrl;
            var posturl = oModel + entity;
          
            console.log(posturl);
            $.ajax({
                url: posturl,
                type: "POST",
                async: true,
                data:JSON.stringify(eduDetails),
                contentType: "application/json",
                success: function (ndata) {
                    console.log(ndata);        
                   },
                error: function (err) {
                    console.log("Error while adding data");
                    console.log(err);
                }
            });
        }

    });
});