/*
  ~  Copyright 2016 Ripple Foundation C.I.C. Ltd
  ~  
  ~  Licensed under the Apache License, Version 2.0 (the "License");
  ~  you may not use this file except in compliance with the License.
  ~  You may obtain a copy of the License at
  ~  
  ~    http://www.apache.org/licenses/LICENSE-2.0

  ~  Unless required by applicable law or agreed to in writing, software
  ~  distributed under the License is distributed on an "AS IS" BASIS,
  ~  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  ~  See the License for the specific language governing permissions and
  ~  limitations under the License.
*/
let templatePatientsSummary = require('./patients-summary.html');

class PatientsSummaryController {
  constructor($scope, $state, $stateParams, $ngRedux, $location, patientsActions, serviceRequests, usSpinnerService) {

    serviceRequests.publisher('headerTitle', {title: 'Patients Summary'});
    serviceRequests.publisher('routeState', {state: $state.router.globals.current.views, breadcrumbs: $state.router.globals.current.breadcrumbs, name: 'patients-summary'});

    $scope.listsDashboards = {
      problems: {
        show: true,
        title: 'Problems',
        toState: 'diagnoses',
        goNameIndex: 'diagnosisIndex'
      },
      contacts: {
        show: true,
        title: 'Contacts',
        toState: 'contacts',
        goNameIndex: 'contactIndex'
      },
      allergies: {
        show: true,
        title: 'Allergies',
        toState: 'allergies',
        goNameIndex: 'allergyIndex'
      },
      medications: {
        show: true,
        title: 'Medications',
        toState: 'medications',
        goNameIndex: 'medicationIndex'
      }
      // transfers: {
      //   title: 'Transfer',
      //   toState: 'transferOfCare'
      // }
    };
    this.countPatientArr = 4;

    this.goToSection = function (state) {
      $state.go(state, {
        patientId: $stateParams.patientId,
        reportType: $stateParams.reportType
      });
    };

    $scope.go = function (state, sourceId, nameIndex) {
      var headerRequest = {};
      headerRequest.patientId = $stateParams.patientId;
      headerRequest[nameIndex] = sourceId;

      $state.go(state +'-detail', headerRequest);
    };

    /* istanbul ignore next  */
    function fillPatientArray(arr, count) {
      for (var i = 0; i < count; i++) {
        arr.push({});
      }
      return arr;
    }
    this.getPatientData = function (data) {
      /* istanbul ignore if  */
      if (!data || !data.nhsNumber) {
        return false;
      }
      /* istanbul ignore next */
      usSpinnerService.stop('patientSummary-spinner');

      this.patient = data;

      // Putting it all together dashboards
      for (var dashboard in $scope.listsDashboards) {
        $scope.listsDashboards[dashboard].array = this.patient[dashboard].slice(0, this.countPatientArr);
      }

      // Fill dashboards empty elements
      for (var dashboard in $scope.listsDashboards) {
        var arr = $scope.listsDashboards[dashboard].array;
        arr = fillPatientArray(arr, this.countPatientArr - arr.length);
      }

      this.transferofCareComposition = this.patient;
      
      var descendingTransferofCareComposition = [];
      for (var x = this.transferofCareComposition.transfers.length - 1; x >= 0; x--) {
        descendingTransferofCareComposition.push(this.transferofCareComposition.transfers[x]);
      }
      
      this.transferofCareComposition.transfers = descendingTransferofCareComposition;
      this.transferofCareComposition = this.transferofCareComposition.transfers.slice(0, 5);
    };

    let unsubscribe = $ngRedux.connect(state => ({
      patient: this.getPatientData(state.patientsGet.data)
    }))(this);

    $scope.$on('$destroy', unsubscribe);
    
    this.loadPatient = patientsActions.getPatient;
    this.loadPatient($stateParams.patientId);
  }
}

const PatientsSummaryComponent = {
  template: templatePatientsSummary,
  controller: PatientsSummaryController
};

PatientsSummaryController.$inject = ['$scope', '$state', '$stateParams', '$ngRedux', '$location', 'patientsActions', 'serviceRequests', 'usSpinnerService'];
export default PatientsSummaryComponent;