package apiClient

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

type ApiClient struct {
	client  *http.Client
	baseUrl string
	headers map[string]string
}

type ApiError = any

func New(baseUrl string, headers map[string]string) *ApiClient {
	client := &http.Client{}

	return &ApiClient{
		client:  client,
		baseUrl: baseUrl,
		headers: headers,
	}
}

func (a *ApiClient) prepareRequest(method string, endpoint string, body any, headers map[string]string) (*http.Request, error) {
	url := a.baseUrl + endpoint

	json, err := json.Marshal(body)

	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(method, url, bytes.NewReader(json))

	if err != nil {
		return nil, err
	}

	for k, v := range headers {
		req.Header.Set(k, v)
	}

	for k, v := range a.headers {
		req.Header.Set(k, v)
	}

	return req, nil
}

func parseResponse(resp *http.Response, result any) error {
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)

	if err != nil {
		return err
	}

	return json.Unmarshal(data, &result)
}

func (a *ApiClient) callEndpoint(req *http.Request) (*http.Response, string, error) {
	resp, err := a.client.Do(req)

	if err != nil {
		return nil, "", err
	}

	if resp.StatusCode >= 400 {
		var message string

		if resp.Body != nil {
			defer resp.Body.Close()

			data, err := io.ReadAll(resp.Body)

			if err != nil {
				return nil, "", err
			}

			message = string(data)
		}

		return nil, message, nil
	}

	return resp, "", nil
}

func (a *ApiClient) Get(endpoint string, headers map[string]string, result any) (apiError string, err error) {
	req, err := a.prepareRequest("GET", endpoint, nil, headers)

	if err != nil {
		return "", err
	}

	resp, apiError, err := a.callEndpoint(req)

	if err != nil || apiError != "" {
		return apiError, err
	}

	err = parseResponse(resp, &result)

	return "", err
}

func (a *ApiClient) mutation(method string, endpoint string, reqBody any, headers map[string]string, result any) (apiError string, err error) {
	req, err := a.prepareRequest(method, endpoint, reqBody, headers)

	if err != nil {
		return "", err
	}

	resp, apiError, err := a.callEndpoint(req)

	if err != nil || apiError != "" {
		return apiError, err
	}

	err = parseResponse(resp, result)

	return "", err
}

func (a *ApiClient) Post(endpoint string, reqBody any, headers map[string]string, result any) (apiError string, err error) {
	return a.mutation("POST", endpoint, reqBody, headers, result)
}

func (a *ApiClient) Patch(endpoint string, reqBody any, headers map[string]string, result any) (apiError string, err error) {
	return a.mutation("PATCH", endpoint, reqBody, headers, result)
}

func (a *ApiClient) Put(endpoint string, reqBody any, headers map[string]string, result any) (apiError string, err error) {
	return a.mutation("PUT", endpoint, reqBody, headers, result)
}

func (a *ApiClient) Delete(endpoint string, reqBody any, headers map[string]string, result any) (apiError string, err error) {
	return a.mutation("DELETE", endpoint, reqBody, headers, result)
}
