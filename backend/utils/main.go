package utils

import "time"

func GetTimestampTz() string {
	return time.Now().Format(time.RFC3339)
}
