package errorHandlers

type Error struct {
	Error      string `json:"error"`
	ErrorCode  string `json:"errorCode,omitempty"`
	Message    string `json:"message"`
	StatusCode int    `json:"statusCode"`
	Details    *any   `json:"details,omitempty"`
}
