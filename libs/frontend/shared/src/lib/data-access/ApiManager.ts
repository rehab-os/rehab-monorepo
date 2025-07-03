import { ICreatePatientPayload, IOnboardAssistantBody, IOnboardDoctorBody, IPaginationSearch, TEditBookingAction } from "@typings/index";
import ApiMethods from "./api-client";
import { ENDPOINTS } from "./endpoints";
// import { store } from "@redux/store";





export const BASE_URL = "localhost:3000";

class ApiManager {

    static createPatient = (patientDetails: ICreatePatientPayload) => {
        const url = BASE_URL + ENDPOINTS.CREATE_PATIENT();
        return ApiMethods.post(url, patientDetails).then(res => {
            console.log(res)
            return res
        });
    };


    static getDoctorUpcommingBookings = (doctorId: number | null) => {
        const url = BASE_URL + ENDPOINTS.GET_DOCTOR_UPCOMMING_PATIENTS();
        const body = doctorId ? { "doctorId": doctorId } : {}
        return ApiMethods.post(url, body).then((res: any) => {
            store.dispatch(doctorSlice.actions.setDoctorUpcommingPatients(Array.isArray(res.payload) ? res.payload : []))
            console.log(res)
            return res
        });
    };

    static getActivePatient = (patientVisitId: number) => {
        const url = BASE_URL + ENDPOINTS.GET_PATIENT();
        return ApiMethods.post(url, { visitId: patientVisitId }).then((res: any) => {

            store.dispatch(doctorSlice.actions.setActivePatient(res.payload))
            console.log(res)
            return res
        });
    };


}

export default ApiManager;
