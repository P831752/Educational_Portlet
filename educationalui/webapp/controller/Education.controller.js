sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
	"use strict"

	return Controller.extend("com.lt.educationalui.controller.Education", {
		onInit() {
			this._initializeDisplayModel()
			this._fetchEducationData("10012553")
			this._initializePicklistModels()
			this._initializeEditModels()
		},

		_initializeDisplayModel() {
			let displayModel = new sap.ui.model.json.JSONModel({
				sscData: {},
				hscData: {},
				gradData: []
			})
			this.getView().setModel(displayModel, "displayModel")
		},

		_fetchEducationData(parentCode) {
			let oModel = this.getOwnerComponent().getModel()
			let aFilters = [
				new sap.ui.model.Filter("cust_EducationParentLegacy_externalCode", sap.ui.model.FilterOperator.EQ, parentCode)
			]
			oModel.read("/cust_EducationChild1", {
				filters: aFilters,
				success: this._onEducationDataFetched.bind(this),
				error: function(err) {
					console.error("Failed to fetch education data:", err)
				}
			})
		},

		_onEducationDataFetched(data) {
			let results = data.results
			let sscData = results.find(item => item.cust_Qualification_Type === 'Q01')
			let hscData = results.find(item => item.cust_Qualification_Type === 'Q02')
			let gradData = results.filter(item => item.cust_Qualification_Type === 'Q06')

			let oDisplayModel = this.getView().getModel("displayModel")

			this._updateLabels(sscData, "/sscData", ["Type Of Course", "Division", "Grade"])
			this._updateLabels(hscData, "/hscData", ["Type Of Course", "Division", "Grade"])
			this._processGraduationData(gradData, function(result) {
				console.log("All items processed:", result)
				oDisplayModel.setProperty("/gradData", result)
			})
		},

		_updateLabels(data, path, picklistId) {
			let oDisplayModel = this.getView().getModel("displayModel")
			picklistId.forEach(key => {
				if (data["cust_Type_Of_The_Course"] !== null && key === "Type Of Course") {
					this.getTxtfrCode(key, data["cust_Type_Of_The_Course"]).then(label => {
						data["cust_Type_Of_The_Course"] = label
						oDisplayModel.setProperty(path, data)
					})
				}
				if (data["cust_Division"] !== null && key === "Division") {
					this.getTxtfrCode(key, data["cust_Division"]).then(label => {
						data["cust_Division"] = label
						oDisplayModel.setProperty(path, data)
					})
				}
				if (data["cust_Grade"] !== null && key === "Grade") {
					this.getTxtfrCode(key, data["cust_Grade"]).then(label => {
						data["cust_Grade"] = label
						oDisplayModel.setProperty(path, data)
					})
				}
			})
		},

		_processGraduationData(gradData, onComplete) {
			let completedCount = 0;
			let totalItems = gradData.length;
			let processedItems = [];
		
			gradData.forEach((item, index) => {
				item.index = index;
				item.editMode = false;
				item.isNew = false;
		
				let labelCount = 0;
				let expectedLabels = 0;
		
				if (item.cust_Type_Of_The_Course !== null) expectedLabels++;
				if (item.cust_Division !== null) expectedLabels++;
				if (item.cust_Grade !== null) expectedLabels++;
		
				const checkAndComplete = () => {
					labelCount++;
					if (labelCount === expectedLabels) {
						processedItems.push(item);
						completedCount++;
						if (completedCount === totalItems && typeof onComplete === "function") {
							onComplete(processedItems);
						}
					}
				};
		
				if (item.cust_Type_Of_The_Course !== null) {
					this.getTxtfrCode("Type Of Course", item.cust_Type_Of_The_Course).then(typeLabel => {
						item.cust_Type_Of_The_Course = typeLabel;
						checkAndComplete();
					});
				}
				if (item.cust_Division !== null) {
					this.getTxtfrCode("Division", item.cust_Division).then(divisionLabel => {
						item.cust_Division = divisionLabel;
						checkAndComplete();
					});
				}		
				if (item.cust_Grade !== null) {
					this.getTxtfrCode("Grade", item.cust_Grade).then(gradeLabel => {
						item.cust_Grade = gradeLabel;
						checkAndComplete();
					});
				}
				
				if (expectedLabels === 0) {
					processedItems.push(item);
					completedCount++;
					if (completedCount === totalItems && typeof onComplete === "function") {
						onComplete(processedItems);
					}
				}
			});
		},

		_initializePicklistModels() {
			let picklistKeys = [{
					key: "Percentage",
					modelName: "percentModel"
				},
				{
					key: "CGPA",
					modelName: "cgpaModel"
				},
				{
					key: "Year Of Passing",
					modelName: "yopModel"
				},
				{
					key: "Division",
					modelName: "divModel"
				},
				{
					key: "Type Of Course",
					modelName: "tocModel"
				},
				{
					key: "Grade",
					modelName: "gradModel"
				}
			]
			picklistKeys.forEach(({
				key,
				modelName
			}) => {
				this.picklistVal(key).then(results => {
					let model = new sap.ui.model.json.JSONModel(results)
					this.getView().setModel(model, modelName)
				})
			})
		},

		_initializeEditModels() {
			let editModelData = {
				editTxt: true,
				editInp: false
			}
			let sscModel = new sap.ui.model.json.JSONModel(editModelData)
			let hscModel = new sap.ui.model.json.JSONModel(editModelData)
			this.getView().setModel(sscModel, "editSSCModel")
			this.getView().setModel(hscModel, "editHSCModel")
		},

		getTxtfrCode(picklistId, code) {
			return new Promise((resolve) => {
				let oModel = this.getOwnerComponent().getModel()
				let entity = `/PickListValueV2(PickListV2_effectiveStartDate=datetime'1900-01-01T00:00:00',PickListV2_id='${picklistId}',externalCode='${code}')`
				oModel.read(entity, {
					success: function(data) {
						resolve(data.label_defaultValue)
					},
					error: function() {
						resolve(code) 
					}
				})
			})
		},

		//PickList: Percentage
		picklistVal(picklistId) {
			return new Promise((resolve, reject) => {
				var oModel = this.getOwnerComponent().getModel()
				var entity = "/PickListV2(effectiveStartDate=datetime'1900-01-01T00:00:00',id='" + picklistId + "')/values"
				oModel.read(entity, {
					success: function(data) {
						resolve(data.results)
					}.bind(this),
					error: function(err) {
						reject(err)
					}
				})
			})
		},

		//---------------------------------SSC Start
		onSSCEdit() {
			this.getView().getModel("editSSCModel").setData({
				"editTxt": false,
				"editInp": true
			})
		},

		onSSCReset() {
			this.getView().getModel("editSSCModel").setData({
				"editTxt": true,
				"editInp": false
			})
		},
		//---------------------------------SSC End

		//---------------------------------HSC Start
		onHSCEdit() {
			this.getView().getModel("editHSCModel").setData({
				"editTxt": false,
				"editInp": true
			})
		},

		onHSCReset() {
			this.getView().getModel("editHSCModel").setData({
				"editTxt": true,
				"editInp": false
			})
		},
		//---------------------------------HSC End

		//---------------------------------Graduation Start
		onAddGraduation() {
			var oModel = this.getView().getModel("graduateModel")
			var oData = oModel.getProperty("/GraduationList")
			var oNewEntry = {
				id: "",
				title: "Graduation",
				blocks: [{
					QualificationSubType: "",
					InstitutionName: "",
					CGPA: "",
					EducationCertificate: "",
					UniversityBoard: "",
					Division: "",
					Branch1: "",
					TypeOfCourse: "",
					Grade: "",
					Branch2: "",
					DurationInMonths: null,
					YearOfPassing: null,
					Percentage: null,
					editMode: true,
					isNew: true
				}]
			}
			oData.push(oNewEntry)
			oModel.setProperty("/GraduationList", oData)
		},

		onEditGraduation(oEvent) {
			var oContext = oEvent.getSource().getBindingContext("graduateModel")
			oContext.getModel().setProperty(oContext.getPath() + "/editMode", true)
		},

		onResetGraduatio(oEvent) {
			var oContext = oEvent.getSource().getBindingContext("graduateModel")
			oContext.getModel().setProperty(oContext.getPath() + "/editMode", false)
		},

		onDeleteGraduation(oEvent) {
			var oModel = this.getView().getModel("graduateModel")
			var iGradIndex = oEvent.getSource().getBindingContext("graduateModel").getPath().split("/")[2]
			oModel.getProperty("/GraduationList").splice(iGradIndex, 1)
			oModel.refresh()
		}
		//---------------------------------Graduation End             

	})
})