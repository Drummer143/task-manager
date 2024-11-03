import axios from 'axios'

export const axiosInstance = axios.create({
	withCredentials: true,
	baseURL: "http://192.168.10.55:8080"
})