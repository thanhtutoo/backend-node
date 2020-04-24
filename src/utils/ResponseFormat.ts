import moment from "moment";
const ResponseFormat = {
    validation_error : (message:string)  => {
        return {
            // data:data,
            message: message,
        }
    },
    error : (data:any) => {
        return {
            is_request_success: false,
            response_date_time: moment().format("YYYY-MM-DD HH:mm:ss"),
            data:data
        }
    },
    success : (data:any) => {
        // data : JSON.stringify(data)
        return {
            is_request_success: true,
            response_date_time: moment().format("YYYY-MM-DD HH:mm:ss"),
            data:data
        }
    }
}
export default ResponseFormat;
// module.exports = ResponseFormat


