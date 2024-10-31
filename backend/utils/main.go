package utils

import "time"

func GetTimestampTz() *time.Time {
	time := time.Now()
	return &time
}
