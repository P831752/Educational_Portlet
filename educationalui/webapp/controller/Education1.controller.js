sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], (Controller, JSONModel, Filter, FilterOperator, MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("com.lt.educationalui.controller.Education1", {
        onInit() {

            //Qualification Sub Type - other than SSC & HSC
            //this._getQualificationSubType();

            //this._onCreateRecord();
            //this._onGetRecord();

            //DMS Attachments
            //this._createDocFolder();
            //this._getDMSFolderFiles();

            //this._getLoggedUserEducationalDetails();

            this.model = new JSONModel();
            this.model.setData({
                    Attachments: []
                  });
            this.getView().setModel(this.model);
            
            //this._getDMSFiles();
            this._getDMSSpecificFiles();
        },

        _getDMSSpecificFiles: async function () { 
          var docserviceBaseurl  = this.getOwnerComponent().getManifestObject().resolveUri('DMS_Dest');//<Repo ID>/root,
          const sUrl = docserviceBaseurl+"/Educational_Certificates";
          var that = this;
          const sSearch = "SSC"
          
          $.ajax({
              url: sUrl,
              type: "GET",
              headers: {
                "Accept":"application/json",
                "Content-Type" : "application/json"
            },
              data: JSON.stringify({
                      query: `SELECT * FROM cmis:document WHERE cmis:name LIKE '%${sSearch}%'`
              }),
              async: false,
              success: function (successData) {
                  //debugger;
                  console.log("successData:", successData);
                },
                error: function (errorData) {
                  console.log("error : " + errorData);
                }
          })
      },
        //working as expected - fetching all the files
        _getDMSFiles: async function () { 
            var docserviceBaseurl  = this.getOwnerComponent().getManifestObject().resolveUri('DMS_Dest');//<Repo ID>/root,
            const sUrl = docserviceBaseurl+"/Educational_Certificates";
            var that = this;
            
            jQuery.ajax({
                url: sUrl,
                type: "GET",
                async: false,
                success: function (successData) {
                    //debugger;
                    console.log("successData:", successData);
                    console.log("Attachments:" +that.model.getData().Attachments);
                    that.model.getData().Attachments = successData.objects.map(item => {
                      const properties = item.object.properties;
                      return {
                        Name: properties["cmis:name"].value,
                        URL: docserviceBaseurl + "?objectId=" + properties["cmis:objectId"].value + "&cmisSelector=content"
                      };
                    });
                    console.log("Attachments:" +that.model.getData().Attachments);
                  },
                  error: function (errorData) {
                    console.log("error : " + errorData);
                  }
            }); 

                var Title = "";
                var oContent;
          
                oContent = new sap.m.Table({
                  columns: [
                    new sap.m.Column({
                      header: new sap.m.Label({ text: "Document Name" })
                    })
                  ],
                  items: {
                    path: "/Attachments",
                    template: new sap.m.ColumnListItem({
                      cells: [
                        new sap.m.Link({
                          text: "{Name}",
                          href: "{URL}",
                          target: "_blank"
                        })
                      ]
                    })
                  }
                });

                if (that.getView().byId("attachmentTable").getItems().length == 0) {
                  that.getView().byId("attachmentTable").addItem(oContent);
                } else {
                  var oContainer = that.getView().byId("attachmentTable");
          
                  // Get all items
                  var aItems = oContainer.getItems();
          
                  // Find the index of the item you want to replace
                  var iIndexToReplace = 0; // example index
          
                  // Remove the old item
                  var oOldItem = aItems[iIndexToReplace];
                  oContainer.removeItem(oOldItem);
          
                  // Create or get the new item
                  var oNewItem = oContent; // assuming oContent is your new item
          
                  // Insert the new item at the same index
                  oContainer.insertItem(oNewItem, iIndexToReplace);
          
                }
                
            that.getView().byId("attachmentTable").updateBindings(true);
        },

        onFileSizeExceeded: function (oEvent) {
            MessageBox.warning("File size exceeds the 200 KB limit.");
        },


        onPressAddEducation: async function () { 
            const oUploadSet = this.byId("uploadSetSSC");
            const aItems = oUploadSet.getItems();
            
            const psid = "10012553",
            course = "Graduation_1";

            for (let i = 0; i < aItems.length; i++) {
                //const sNewFileName = psid+"_"+course+"_"+i;
                const sNewFileName = psid+"_"+course;
                const oFile = aItems[i].getFileObject();

                if (oFile) {
                  //await this._uploadSSCToDMS(oFile, sNewFileName);
                  await this._uploadToDMS(oFile, sNewFileName);
                }
              }
        },

        //working as expected
        _uploadToDMS: async function (file, newFileName) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
              
                    const formData = new FormData();
                    formData.append("datafile", file);
                    formData.append("cmisaction", "createDocument");
                    formData.append("propertyId[0]", "cmis:objectTypeId");
                    formData.append("propertyValue[0]", "cmis:document");
                    formData.append("propertyId[1]", "cmis:name");
                    formData.append("propertyValue[1]", newFileName);
              
                    var oDest = this.getOwnerComponent().getManifestObject().resolveUri('DMS_Dest'),
                    sUrl = oDest + "/Educational_Certificates"; //Folder Name
                    
                    try {
                        jQuery.ajax({
                            url: sUrl,
                            type: "POST",
                            contentType: false,
                            processData: false,
                            mimeType: "multipart/form-data",
                            data: formData,
                            success: function (successData) {         
                                MessageBox.success("Attachment Successfully Uploaded.");                       
                                console.log("Upload Success:" +successData);
                                resolve();
                            },
                            error: function (xhr, status, error) {
                                //console.log("Upload Failed1:" +xhr);
                                //reject();
                                //MessageBox.error("Upload error " + xhr);
                                try {
                                    const errorObj = JSON.parse(xhr.responseText);
                                    const errorMessage = errorObj.error.message.value || "Unknown error occurred.";
                                    MessageBox.error("Error: " + errorMessage);
                                    reject();
                                  } catch (e) {
                                    MessageBox.error("Unexpected error: " + xhr.responseText);
                                    reject();
                                  }                              
                            }
                        });                        
                    } catch (err) {
                      console.error("Upload error", err);
                      sap.m.MessageBox.error(`Upload error: ${err.message}`);
                      reject();
                    }                           
            });           
        },
 
        _deleteFilesDMS: async function (file, newFileName) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
              
                    const formData = new FormData();
                    formData.append("datafile", file);
                    formData.append("cmisaction", "createDocument");
                    formData.append("propertyId[0]", "cmis:objectTypeId");
                    formData.append("propertyValue[0]", "cmis:document");
                    formData.append("propertyId[1]", "cmis:name");
                    formData.append("propertyValue[1]", newFileName);
              
                    var oDest = this.getOwnerComponent().getManifestObject().resolveUri('DMS_Dest'),
                    sUrl = oDest + "/Educational Certificates";
                    
                    try {
                        jQuery.ajax({
                            url: sUrl,
                            type: "POST",
                            contentType: false,
                            processData: false,
                            mimeType: "multipart/form-data",
                            data: formData,
                            success: function (successData) {                                
                                console.log("Upload Success:" +successData);
                                resolve();
                            },
                            error: function (xhr) {
                                console.log("Upload Failed2:" +xhr);
                                reject();
                                //MessageBox.error("Upload error " + xhr);
                            }
                           });                        
                    } catch (err) {
                      console.error("Upload error", err);
                      sap.m.MessageBox.error(`Upload error: ${err.message}`);
                      reject();
                    }                           
            });           
        },

        _uploadSSCToDMS: async function (file, newFileName) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = async function (evt) {
                    const fileContent = evt.target.result;
              
                    const formData = new FormData();
                    formData.append("file", new Blob([fileContent]), newFileName);
              
                    // Optional: Add metadata
                    formData.append("metadata", JSON.stringify({
                      name: newFileName,
                      properties: {
                        "cmis:objectTypeId": "cmis:document",
                        "cmis:name": newFileName
                      }
                    }));
              
                    try {
                      const response = await fetch("/dms/documents", {
                        method: "POST",
                        body: formData,
                        headers: {
                          "slug": file.name,
                          "repositoryId": "your-repo-id",         // Replace this
                          "parentFolderId": "root"                // Or your actual folder ID
                        }
                      });
              
                      if (response.ok) {
                        sap.m.MessageToast.show(`Uploaded: ${file.name}`);
                        resolve();
                      } else {
                        const errorText = await response.text();
                        sap.m.MessageBox.error(`Upload failed3: ${errorText}`);
                        reject();
                      }
                    } catch (err) {
                      console.error("Upload error", err);
                      sap.m.MessageBox.error(`Upload error: ${err.message}`);
                      reject();
                    }
                  };              
                reader.readAsArrayBuffer(file);
            });           
        },

        _getDMSFolderFiles: function (oEvent) {
            var destination = this.getOwnerComponent().getManifestObject().resolveUri('DMS_Dest');//<Repo ID>/root,
            
            const sUrl = destination+"?filter=cmis:objectTypeId='cmis:document'"
            
            $.ajax({
                url: sUrl,
                type: "GET",
                contentType: "application/json",
                dataType: "json",
                success: function(data) {
                    if (data.objects) {
                        const fileNames = data.objects.map(obj => obj.object.properties["cmis:name"].value);
                        console.log("DMS Files:", fileNames);
                    }
                  // You can bind this data to a model or UI element
                },
                error: function(xhr, status, error) {
                  console.error("Error fetching documents:", error);
                }
              });              
        },

        onMediaTypeMismatch: function (oEvent) {
            // var aMismatchedFiles = oEvent.getParameter("files");
            // var sMessage = "Only PDF files are allowed. The following files are not supported:\n";
        
            // aMismatchedFiles.forEach(function (file) {
            //     sMessage += "- " + file.name + "\n";
            // });
        
            MessageBox.warning("Only PDF files are allowed");
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
            oForm.append("propertyValue[0]", 123456);
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