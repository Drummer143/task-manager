package apiClient

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

type ApiError = any

func prepareRequest(url string, method string, body any, headers map[string]string) (*http.Request, error) {
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

	return req, nil
}

func parseResponse(resp *http.Response, result any) error {
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)

	if err != nil {
		return err
	}

	if resp.StatusCode == http.StatusNoContent {
		return nil
	}

	return json.Unmarshal(data, &result)
}

func callEndpoint(req *http.Request) (*http.Response, error) {
	client := http.Client{}

	resp, err := client.Do(req)

	if err != nil {
		return nil, err
	}

	return resp, nil
}

func Get(url string, headers map[string]string, result any) error {
	req, err := prepareRequest(url, "GET", nil, headers)

	if err != nil {
		return err
	}

	resp, err := callEndpoint(req)

	if err != nil {
		return err
	}

	return parseResponse(resp, &result)
}

func mutation(method string, endpoint string, reqBody any, headers map[string]string, result any) error {
	req, err := prepareRequest(method, endpoint, reqBody, headers)

	if err != nil {
		return err
	}

	resp, err := callEndpoint(req)

	if err != nil {
		return err
	}

	err = parseResponse(resp, result)

	return err
}

func Post(url string, reqBody any, headers map[string]string, result any) error {
	return mutation(url, "POST", reqBody, headers, result)
}

func Patch(url string, reqBody any, headers map[string]string, result any) error {
	return mutation(url, "PATCH", reqBody, headers, result)
}

func Put(url string, reqBody any, headers map[string]string, result any) error {
	return mutation(url, "PUT", reqBody, headers, result)
}

func Delete(url string, reqBody any, headers map[string]string, result any) error {
	return mutation(url, "DELETE", reqBody, headers, result)
}
