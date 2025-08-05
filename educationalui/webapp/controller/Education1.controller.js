sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], (Controller, JSONModel, Filter, FilterOperator, MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("com.lt.educationalui.controller.Education", {
        onInit() {

            //Qualification Sub Type - other than SSC & HSC
            //this._getQualificationSubType();

            //this._onCreateRecord();
            //this._onGetRecord();

            //DMS Attachments
            //this._createDocFolder();
            //this._getLoggedUserEducationalDetails();
        },

        _isFolderExist: function () { 

        },

        _getLoggedUserEducationalDetails: function () {
          //https://api10preview.sapsf.com/odata/v2/cust_EducationChild1?$filter=cust_EducationParentLegacy_externalCode eq '10012553'

          try { 
                var oModel = this.getOwnerComponent().getModel();
                
                var aFilters = [
                    new sap.ui.model.Filter("cust_EducationParentLegacy_externalCode", sap.ui.model.FilterOperator.EQ, "10012553"),
                ];

                oModel.read("/cust_EducationChild1", {
                    filters: aFilters,
                    success: function (resp) {      
                        //resp.results[0].externalCode = QualificationSubType Code        
                        console.log("Looged User Certificates list:" +resp.results.length);   
                    }.bind(this),
                    error: function (err) {
                        console.error("Error Looged User Certificates", err);
                    }
                });                
    
        } catch (e) {
            MessageBox.error("Unexpected error in to get LoggedUser EducationalDetails: " + e.message);
            //console.log("Exception caught:", e.message);
        }
    },

        _createDocFolder: function () {
            let oForm = new FormData();
            oForm.append("cmisaction", "createFolder");
            oForm.append("propertyId[0]", "cmis:name");
            oForm.append("propertyValue[0]", "123456");
            oForm.append("propertyId[1]", "cmis:objectTypeId");
            oForm.append("propertyValue[1]", "cmis:folder");
            oForm.append("succinct", "true");
            
            jQuery.ajax({
             url: this.getOwnerComponent().getManifestObject().resolveUri('DMS_Dest'),// <Repo ID>/root,
             type: "POST",
             headers: {
              "Accept": "application/json"
             },
             data: oForm,
             contentType: false,
             processData: false,
             success: function (response) {
                MessageBox.success("Folder Created Successfully: " + response)
             },
             error: function (xhr, status, error) {
              MessageBox.error("Error while creating DocFolder: " + error)
             }
            });
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
            try {
                var eduDetails = {
                    "PSID":"234515",
                    "course":"SSC",
                    "qualificationSubType":"SSC1",
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
                    "status":"D",
                    "fileName":""
                };

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
                        MessageToast.show("Record created successfully!");
                        console.log(ndata);        
                    },
                    error: function (err) {
                        console.log("Error while adding data");
                        console.log(err);
                    }
                });            
            } catch (e) {
                MessageBox.error("Unexpected error in CreateRecord: " + e.message);
                console.error("Exception caught:", e);
            }
        },

        _onGetRecord: function(oEvent) { 

            try {         
        /*        var aFilters = [
                    new Filter("PSID", FilterOperator.Contains, "234569"),
                    new Filter("STATUS", FilterOperator.Contains, "PA")
                ];

              var oModel = this.getOwnerComponent().getModel("educational");
                oModel.read("Educational_Details", {
                    filters: aFilters,
                    success: function (resp) {
                        console.log("GetRecord:" +resp.results);
                        // oJSONModel.setData(resp.results);
                        // this.getView().setModel(oJSONModel, "SFCand");
                    }.bind(this),
                    error: function (err) {
                        //oBusyDialog.close();
                        console.error("Error fetching data", err);
                    }
                }); */
                
                var oModel = this.getOwnerComponent().getModel("educational").sServiceUrl;
                var entity = "Educational_Details"
                var filter = "$filter=PSID eq '234510' and status eq 'PA'";

                var url = oModel + entity + "?" + filter;

                $.ajax({
                    url: url,
                    type: "GET",  
                    contentType: "application/json",
                    dataType: "json",
                    async: false,                 
                    success: function(data) {
                        console.log("Reportees:" +data.d.results.length);
                    },
                    error: function(error) {
                        console.log("Error:", error);
                        console.log("Reportees:", error.responseText);
                        //oBusyDialog.close();
                    }
                }); 

            } catch (e) {
                MessageBox.error("Unexpected error in Get Record: " + e.message);
                console.log("Exception caught:", e.message);
            }
        },

        _onCreateRecord1: function () {
            const oModel = this.getOwnerComponent().getModel("educational");
          
            oModel.metadataLoaded().then(() => {
              const oBindingList = oModel.bindList("/Educational_Details");
          
              const eduDetails = {
                PSID: "234569",
                course: "SSC",
                qualificationSubType: "SSC1",
                educationCertificate: "10",
                branch1: "",
                branch2: "",
                yearOfPassing: 2000,
                institution: "ABC",
                boardOrUniversity: "",
                courseType: "",
                duration: "",
                percentage: "8.2",
                cgpa: "7.2",
                division: "",
                grade: "",
                status: "PA",
                fileName: ""
              };
          
              const oContext = oBindingList.create(eduDetails);
          
              oContext.created().then(() => {
                MessageToast.show("Record created successfully!");
              }).catch((oError) => {
                let sErrorMessage = "Error creating record.";
                try {
                  const oResponse = JSON.parse(oError.message);
                  sErrorMessage = oResponse.error.message;
                } catch (e) {
                  sErrorMessage = oError.message;
                }
                MessageBox.error(sErrorMessage);
              });
            });
          }               

    });
});